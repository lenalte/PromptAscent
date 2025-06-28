
'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode, useMemo } from 'react';
import { type User, onAuthStateChanged, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type AuthError, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase/index';
import {
  getUserProgress,
  createUserProgressDocument,
  updateUserDocument,
  completeStageInFirestore as serverCompleteStage,
  populateBossChallengeQuestions as serverPopulateBoss,
  resolveBossChallenge as serverResolveBoss,
  type UserProgressData
} from '@/services/userProgressService';
import type { StageItemStatus, LessonItem, BossQuestion } from '@/ai/schemas/lesson-schemas';
import type { Boss } from '@/data/boss-data';

const USERS_COLLECTION = 'users';

// New result type for auth operations
interface AuthResult {
  user: User | null;
  error?: string;
}

interface UserProgressContextType {
  currentUser: User | null;
  userProgress: UserProgressData | null;
  isLoadingAuth: boolean;
  isLoadingProgress: boolean;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgressData | null>>;
  completeStageAndProceed: (
    lessonId: string,
    stageId: string,
    stageIndex: number,
    stageItemsWithStatus: { [itemId: string]: StageItemStatus },
    pointsEarnedThisStage: number,
    stageItems: LessonItem[]
  ) => Promise<{ nextLessonIdIfAny: string | null }>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  logOut: () => Promise<void>;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    // This function is defined inside useEffect to have a stable scope and avoid useCallback issues.
    const fetchUserProgressData = async (userId: string, usernameForNewUser: string | null) => {
        if (!db) {
            console.error("[UserProgressContext] Firestore (db) is not available for fetchUserProgressData. Aborting.");
            setIsLoadingProgress(false);
            return;
        }
        setIsLoadingProgress(true);
        console.log('[UserProgressContext] Fetching user progress for UID:', userId);
        try {
            let progress = await getUserProgress(userId);
            if (!progress) {
                console.log('[UserProgressContext] No progress found, creating new document for UID:', userId, 'with username:', usernameForNewUser);
                progress = await createUserProgressDocument(userId, {
                    username: usernameForNewUser ?? undefined,
                });
            } else if (usernameForNewUser && !progress.username) {
                console.log(`[UserProgressContext] User doc for ${userId} existed, updating with queued username: ${usernameForNewUser}`);
                await updateUserDocument(userId, { username: usernameForNewUser });
                progress.username = usernameForNewUser;
            }
            setUserProgress(progress);
            console.log('[UserProgressContext] User progress loaded/updated:', progress);

        } catch (error) {
            console.error(`[UserProgressContext] Error fetching/creating user progress for UID ${userId}:`, error);
            setUserProgress(null);
        } finally {
            setIsLoadingProgress(false);
        }
    };
      
    console.log('[UserProgressContext] Setting up onAuthStateChanged listener. Auth available:', !!auth, 'DB available:', !!db);
    if (!auth) {
        console.error("[UserProgressContext] Firebase Auth instance is not available. Auth operations will fail.");
        setIsLoadingAuth(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setIsLoadingAuth(true);
        if (user) {
            console.log('[UserProgressContext] onAuthStateChanged: User is signed in:', user.uid, 'isAnonymous:', user.isAnonymous);
            setCurrentUser(user);
            await fetchUserProgressData(user.uid, user.displayName);
        } else {
            console.log('[UserProgressContext] onAuthStateChanged: No user signed in. Attempting anonymous sign-in.');
            setCurrentUser(null);
            setUserProgress(null);
            try {
                await signInAnonymously(auth);
                console.log('[UserProgressContext] Anonymously signed in.');
            } catch (error) {
                const authError = error as AuthError;
                console.error("[UserProgressContext] Anonymous sign-in failed:", authError);
                if (authError.code === 'auth/operation-not-allowed') {
                    console.error("IMPORTANT: Anonymous sign-in failed. Ensure it's enabled in Firebase console.");
                }
            }
        }
        setIsLoadingAuth(false);
    });

    return () => {
        console.log('[UserProgressContext] Unsubscribing from onAuthStateChanged.');
        unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.


  const completeStageAndProceed = useCallback(async (
    lessonId: string,
    stageId: string,
    stageIndex: number,
    stageItemsWithStatus: { [itemId: string]: StageItemStatus },
    pointsEarnedThisStage: number,
    stageItems: LessonItem[]
  ): Promise<{ nextLessonIdIfAny: string | null }> => {
    if (!currentUser || !db) {
      console.error("[UserProgressContext] completeStageAndProceed: Cannot complete - no current user or db unavailable.");
      if(!db) console.error("[UserProgressContext] Firestore (db) is not available.");
      return { nextLessonIdIfAny: null };
    }
    if (!userProgress) {
        console.error("[UserProgressContext] completeStageAndProceed: Cannot complete - userProgress not loaded for user", currentUser.uid);
        return { nextLessonIdIfAny: null };
    }

    console.log(`[UserProgressContext] completeStageAndProceed called for lesson ${lessonId}, stage ${stageId} (index ${stageIndex}), user ${currentUser.uid}, pointsEarned: ${pointsEarnedThisStage}`);
    setIsLoadingProgress(true);
    try {
      const { nextLessonIdIfAny, updatedProgress } = await serverCompleteStage(
        currentUser.uid,
        lessonId,
        stageId,
        stageIndex,
        stageItemsWithStatus,
        pointsEarnedThisStage,
        stageItems
      );

      setUserProgress(updatedProgress);
      console.log(`[UserProgressContext] completeStageAndProceed success. Updated progress set in context. Next lesson to unlock (if any): ${nextLessonIdIfAny}`);
      return { nextLessonIdIfAny };
    } catch (error) {
      console.error(`[UserProgressContext] Error in completeStageAndProceed for lesson ${lessonId}, stage ${stageId}, UID ${currentUser.uid}:`, error);
      return { nextLessonIdIfAny: null };
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser, userProgress]);

  const signUpWithEmail = useCallback(async (email: string, password: string, username: string): Promise<AuthResult> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign up");
      return { user: null, error: "Authentication service not available." };
    }
    setIsLoadingAuth(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed up successfully:", userCredential.user.uid);
      
      // Update the user's profile in Firebase Auth. onAuthStateChanged will pick this up.
      await updateProfile(userCredential.user, { displayName: username });

      // Explicitly create the progress document here to ensure the username is captured immediately.
      // onAuthStateChanged will later fetch this same document.
      await createUserProgressDocument(userCredential.user.uid, { username });

      return { user: userCredential.user, error: undefined };
    } catch (error) {
      console.error("[UserProgressContext] Error signing up:", error);
      const firebaseError = error as AuthError;
      let errorMessage = "Registration failed. Please try again.";
      if (firebaseError.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please try logging in.";
      } else if (firebaseError.code === "auth/weak-password") {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      } else if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }
      return { user: null, error: errorMessage };
    } finally {
        setIsLoadingAuth(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign in");
      return { user: null, error: "Authentication service not available." };
    }
    setIsLoadingAuth(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed in successfully:", userCredential.user.uid);
      return { user: userCredential.user, error: undefined };
    } catch (error) {
      console.error("[UserProgressContext] Error signing in:", error);
      const firebaseError = error as AuthError;
      let errorMessage = "Login failed. Please check your credentials and try again.";
      if (firebaseError.code === "auth/user-not-found" || firebaseError.code === "auth/wrong-password" || firebaseError.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }
      return { user: null, error: errorMessage };
    } finally {
        setIsLoadingAuth(false);
    }
  }, []);

  const logOut = useCallback(async () => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign out");
      return;
    }
    try {
      await firebaseSignOut(auth);
      console.log("[UserProgressContext] User signed out. Anonymous sign-in will be attempted.");
    } catch (error) {
      console.error("[UserProgressContext] Error signing out:", error);
    }
  }, []);

  const value = useMemo(() => ({
    currentUser,
    userProgress,
    isLoadingAuth,
    isLoadingProgress,
    setUserProgress,
    completeStageAndProceed,
    signUpWithEmail,
    signInWithEmail,
    logOut,
  }), [currentUser, userProgress, isLoadingAuth, isLoadingProgress, completeStageAndProceed, signUpWithEmail, signInWithEmail, logOut]);

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = (): UserProgressContextType => {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};


// These functions are exported for use in components, wrapping server actions.
export const populateBossChallengeQuestions = async (
  userId: string,
  lessonId: string,
  stageId: string
): Promise<{ boss: Boss; questions: BossQuestion[]; challenge: any }> => {
  return serverPopulateBoss(userId, lessonId, stageId);
};

export const resolveBossChallenge = async (
  userId: string,
  lessonId: string,
  stageId: string,
  finalStatus: 'passed' | 'failed',
  finalQuestionStatus: { [itemId: string]: { correct: boolean | null; attempts: number } }
): Promise<UserProgressData> => {
  return serverResolveBoss(userId, lessonId, stageId, finalStatus, finalQuestionStatus);
};
