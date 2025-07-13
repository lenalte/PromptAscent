
'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode, useMemo } from 'react';
import { type User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase/index';
import {
  getUserProgress,
  createUserProgressDocument,
  updateUserDocument,
  completeStageInFirestore as serverCompleteStage,
  populateBossChallengeQuestions as serverPopulateBoss,
  resolveBossChallenge as serverResolveBoss,
  restartStageInFirestore as serverRestartStage,
  type UserProgressData
} from '@/services/userProgressService';
import type { StageItemStatus, LessonItem, BossQuestion } from '@/ai/schemas/lesson-schemas';
import type { Boss } from '@/data/boss-data';
import type { AvatarId } from '@/data/avatars';

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
  ) => Promise<{ nextLessonIdIfAny: string | null; updatedProgress: UserProgressData | null; pointsAdded: number; basePointsAdded: number }>;
  signUpWithEmail: (email: string, password: string, username: string, avatarId?: AvatarId) => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  logOut: () => Promise<void>;
  restartStage: (lessonId: string, stageId: string) => Promise<void>;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    const fetchUserProgressData = async (userId: string, usernameForNewUser: string | null) => {
        if (!db) {
            console.error("[UserProgressContext] Firestore (db) is not available for fetchUserProgressData. Aborting.");
            setIsLoadingProgress(false);
            return;
        }
        setIsLoadingProgress(true);
        try {
            let progress = await getUserProgress(userId);
            if (!progress) {
                progress = await createUserProgressDocument(userId, {
                    username: usernameForNewUser ?? undefined,
                });
            } else if (usernameForNewUser && !progress.username) {
                await updateUserDocument(userId, { username: usernameForNewUser });
                progress.username = usernameForNewUser;
            }
            setUserProgress(progress);
        } catch (error) {
            console.error(`[UserProgressContext] Error fetching/creating user progress for UID ${userId}:`, error);
            setUserProgress(null);
        } finally {
            setIsLoadingProgress(false);
        }
    };
      
    if (!auth) {
        console.error("[UserProgressContext] Firebase Auth instance is not available. Auth operations will fail.");
        setIsLoadingAuth(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setIsLoadingAuth(true);
        if (user) {
            setCurrentUser(user);
            await fetchUserProgressData(user.uid, user.displayName);
        } else {
            setCurrentUser(null);
            setUserProgress(null);
        }
        setIsLoadingAuth(false);
    });

    return () => {
        unsubscribe();
    };
  }, []); 


  const completeStageAndProceed = useCallback(async (
    lessonId: string,
    stageId: string,
    stageIndex: number,
    stageItemsWithStatus: { [itemId: string]: StageItemStatus },
    pointsEarnedThisStage: number, // This is now IGNORED in favor of server calculation
    stageItems: LessonItem[]
  ): Promise<{ nextLessonIdIfAny: string | null; updatedProgress: UserProgressData | null; pointsAdded: number; basePointsAdded: number }> => {
    if (!currentUser || !db) {
      console.error("[UserProgressContext] completeStageAndProceed: Cannot complete - no current user or db unavailable.");
      if(!db) console.error("[UserProgressContext] Firestore (db) is not available.");
      return { nextLessonIdIfAny: null, updatedProgress: null, pointsAdded: 0, basePointsAdded: 0 };
    }
    if (!userProgress) {
        console.error("[UserProgressContext] completeStageAndProceed: Cannot complete - userProgress not loaded for user", currentUser.uid);
        return { nextLessonIdIfAny: null, updatedProgress: null, pointsAdded: 0, basePointsAdded: 0 };
    }

    setIsLoadingProgress(true);
    try {
      const result = await serverCompleteStage(
        currentUser.uid,
        lessonId,
        stageId,
        stageIndex,
        stageItemsWithStatus,
        pointsEarnedThisStage,
        stageItems
      );

      setUserProgress(result.updatedProgress);
      return result;
    } catch (error) {
      console.error(`[UserProgressContext] Error in completeStageAndProceed for lesson ${lessonId}, stage ${stageId}, UID ${currentUser.uid}:`, error);
      return { nextLessonIdIfAny: null, updatedProgress: null, pointsAdded: 0, basePointsAdded: 0 };
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser, userProgress]);

  const signUpWithEmail = useCallback(async (email: string, password: string, username: string, avatarId: AvatarId = 'avatar1'): Promise<AuthResult> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign up");
      return { user: null, error: "Authentication service not available." };
    }
    setIsLoadingAuth(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, { displayName: username });

      await createUserProgressDocument(userCredential.user.uid, { username, avatarId });

      return { user: userCredential.user, error: undefined };
    } catch (error) {
      const firebaseError = error as { code?: string; message: string };
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
      return { user: userCredential.user, error: undefined };
    } catch (error) {
      const firebaseError = error as { code?: string; message: string };
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
      await signOut(auth);
    } catch (error) {
      console.error("[UserProgressContext] Error signing out:", error);
    }
  }, []);

  const restartStage = useCallback(async (lessonId: string, stageId: string) => {
    if (!currentUser) {
      console.error("[UserProgressContext] restartStage: Cannot restart - no current user.");
      return;
    }
    setIsLoadingProgress(true);
    try {
      const updatedProgress = await serverRestartStage(currentUser.uid, lessonId, stageId);
      setUserProgress(updatedProgress);
    } catch (error) {
      console.error(`[UserProgressContext] Error restarting stage ${stageId}:`, error);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser]);

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
    restartStage,
  }), [currentUser, userProgress, isLoadingAuth, isLoadingProgress, completeStageAndProceed, signUpWithEmail, signInWithEmail, logOut, restartStage]);

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

export const restartStage = async (
  userId: string,
  lessonId: string,
  stageId: string
): Promise<UserProgressData> => {
  return serverRestartStage(userId, lessonId, stageId);
};
