
'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode, useRef } from 'react';
import { type User, onAuthStateChanged, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type AuthError } from 'firebase/auth';
import { auth, db } from '../lib/firebase/index'; // Adjusted path
import {
  getUserProgress,
  createUserProgressDocument,
  updateTotalPointsInFirestore,
  completeLessonInFirestore,
  updateUserDocument,
  type UserProgressData
} from '@/services/userProgressService';
import { useRouter } from 'next/navigation';

const USERS_COLLECTION = 'users';

interface UserProgressContextType {
  currentUser: User | null;
  userProgress: UserProgressData | null;
  isLoadingAuth: boolean;
  isLoadingProgress: boolean;
  addPointsToTotal: (amount: number) => Promise<void>; // Kept for potential direct point additions
  completeLessonAndProceed: (lessonId: string, pointsEarned: number) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  currentLessonId: string | null;
  unlockedLessons: string[];
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const queuedUsernameRef = useRef<string | null>(null);
  const router = useRouter();

  const fetchUserProgressData = useCallback(async (userId: string, usernameForNewUser: string | null) => {
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
          username: usernameForNewUser ?? undefined, // Pass username if available
          // Defaults (like currentLessonId, unlockedLessons) are handled in createUserProgressDocument
        });
      } else if (usernameForNewUser && !progress.username) {
        // User exists but doesn't have a username, update it (e.g., after email signup)
        console.log(`[UserProgressContext] User doc for ${userId} existed, updating with queued username: ${usernameForNewUser}`);
        await updateUserDocument(userId, { username: usernameForNewUser });
        progress.username = usernameForNewUser; // Manually update local copy
      }
      setUserProgress(progress);
      console.log('[UserProgressContext] User progress loaded/updated:', progress);

      if (usernameForNewUser) {
        queuedUsernameRef.current = null; // Clear the queued username after use
      }
    } catch (error) {
      console.error(`[UserProgressContext] Error fetching/creating user progress for UID ${userId}:`, error);
      setUserProgress(null);
    } finally {
      setIsLoadingProgress(false);
    }
  }, []);


  useEffect(() => {
    console.log('[UserProgressContext] Setting up onAuthStateChanged listener. Auth available via import:', !!auth, 'DB available via import:', !!db);
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth instance is not available. Auth operations will fail.");
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingAuth(true);
      const usernameForNewUserOnAuthChange = queuedUsernameRef.current;

      if (user) {
        console.log('[UserProgressContext] onAuthStateChanged: User is signed in:', user.uid, 'isAnonymous:', user.isAnonymous, 'Display Name (from Auth):', user.displayName);
        setCurrentUser(user);
        await fetchUserProgressData(user.uid, usernameForNewUserOnAuthChange);
      } else {
        console.log('[UserProgressContext] onAuthStateChanged: No user signed in. Attempting anonymous sign-in.');
        setCurrentUser(null);
        setUserProgress(null);
        queuedUsernameRef.current = null;
        try {
          const userCredential = await signInAnonymously(auth);
          // The onAuthStateChanged listener will fire again for this new anonymous user.
          // setCurrentUser and fetchUserProgressData will be handled in that subsequent call.
          console.log('[UserProgressContext] Anonymously signed in UID:', userCredential.user.uid);
        } catch (error) {
          const authError = error as AuthError;
          console.error("[UserProgressContext] Anonymous sign-in failed:", authError);
          if (authError.code === 'auth/operation-not-allowed') {
            console.error("*****************************************************************************************************************");
            console.error("IMPORTANT: Anonymous sign-in failed. Ensure it's enabled in Firebase console: Authentication -> Sign-in method -> Anonymous.");
            console.error("*****************************************************************************************************************");
          }
        }
      }
      setIsLoadingAuth(false);
    });

    return () => {
      console.log('[UserProgressContext] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProgressData]); // fetchUserProgressData is memoized and stable

  const addPointsToTotal = useCallback(async (amount: number) => {
    if (!currentUser || !userProgress || amount <= 0 || !db) {
        if(!db) console.error("[UserProgressContext] Firestore (db) is not available for addPointsToTotal.");
        if(!currentUser) console.warn("[UserProgressContext] addPointsToTotal: No current user.");
        if(!userProgress) console.warn("[UserProgressContext] addPointsToTotal: userProgress not loaded.");
        return;
    }
    setIsLoadingProgress(true);
    try {
      const newTotalPoints = userProgress.totalPoints + amount;
      await updateTotalPointsInFirestore(currentUser.uid, newTotalPoints);
      setUserProgress(prev => prev ? { ...prev, totalPoints: newTotalPoints } : null);
      console.log(`[UserProgressContext] Added ${amount} points for user ${currentUser.uid}. New total: ${newTotalPoints}`);
    } catch (error) {
      console.error(`[UserProgressContext] Error adding points for UID ${currentUser.uid}:`, error);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser, userProgress, db]);

  const completeLessonAndProceed = useCallback(async (lessonId: string, pointsEarnedThisLesson: number) => {
    if (!currentUser || !db) {
      console.error("[UserProgressContext] completeLessonAndProceed: Cannot complete lesson - no current user or db unavailable.");
      if(!db) console.error("[UserProgressContext] Firestore (db) is not available for completeLessonAndProceed.");
      return null;
    }
    if (!userProgress) {
        console.error("[UserProgressContext] completeLessonAndProceed: Cannot complete lesson - userProgress not loaded for user", currentUser.uid);
        return null;
    }

    console.log(`[UserProgressContext] completeLessonAndProceed called for lesson ${lessonId}, user ${currentUser.uid}, pointsEarned: ${pointsEarnedThisLesson}`);
    setIsLoadingProgress(true);
    try {
      // Calculate the new total points *before* calling the service
      const newTotalPoints = (userProgress.totalPoints || 0) + pointsEarnedThisLesson;
      console.log(`[UserProgressContext] Calculated newTotalPoints: ${newTotalPoints} (current: ${userProgress.totalPoints || 0} + earned: ${pointsEarnedThisLesson})`);

      const { nextLessonId: newNextLessonId, updatedProgress } = await completeLessonInFirestore(
        currentUser.uid,
        lessonId,
        newTotalPoints // Pass the correctly calculated new total points
      );

      setUserProgress(updatedProgress); // Update context with the fresh data from Firestore
      
      console.log(`[UserProgressContext] completeLessonAndProceed successfully processed for user ${currentUser.uid}:
        Returned Next Lesson ID: ${newNextLessonId},
        Updated Progress in context: {
          totalPoints: ${updatedProgress.totalPoints},
          currentLessonId: ${updatedProgress.currentLessonId},
          unlockedLessons: [${updatedProgress.unlockedLessons.join(', ')}],
          completedLessons: [${updatedProgress.completedLessons.join(', ')}]
        }`);
      return newNextLessonId; // This is the ID of the next lesson to navigate to
    } catch (error) {
      console.error(`[UserProgressContext] Error in completeLessonAndProceed for lesson ${lessonId}, UID ${currentUser.uid}:`, error);
      return null;
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser, userProgress, db]);

  const signUpWithEmail = async (email: string, password: string, username: string): Promise<User | null> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign up");
      throw new Error("Firebase Auth not initialized");
    }
    setIsLoadingAuth(true);
    try {
      queuedUsernameRef.current = username; 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed up successfully via Firebase Auth:", userCredential.user.uid, "Username to queue:", username);
      // onAuthStateChanged will handle setting currentUser and calling fetchUserProgressData (which uses queuedUsernameRef.current)
      return userCredential.user;
    } catch (error) {
      console.error("[UserProgressContext] Error signing up:", error);
      queuedUsernameRef.current = null; 
      throw error;
    } finally {
      // setIsLoadingAuth(false); // onAuthStateChanged manages this
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign in");
      throw new Error("Firebase Auth not initialized");
    }
    setIsLoadingAuth(true);
    try {
      queuedUsernameRef.current = null; // Clear any queued username on sign-in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed in successfully via Firebase Auth:", userCredential.user.uid);
      // onAuthStateChanged will handle setting currentUser and calling fetchUserProgressData
      return userCredential.user;
    } catch (error) {
      console.error("[UserProgressContext] Error signing in:", error);
      throw error;
    } finally {
      // setIsLoadingAuth(false); // onAuthStateChanged manages this
    }
  };

  const logOut = async () => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign out");
      return;
    }
    try {
      queuedUsernameRef.current = null; 
      await firebaseSignOut(auth);
      console.log("[UserProgressContext] User signed out. Anonymous sign-in will be attempted by onAuthStateChanged.");
      // router.push('/'); // Let onAuthStateChanged handle state reset and potential redirection via page logic
    } catch (error) {
      console.error("[UserProgressContext] Error signing out:", error);
    }
  };

  return (
    <UserProgressContext.Provider value={{
      currentUser,
      userProgress,
      isLoadingAuth,
      isLoadingProgress,
      addPointsToTotal,
      completeLessonAndProceed,
      signUpWithEmail,
      signInWithEmail,
      logOut,
      currentLessonId: userProgress?.currentLessonId || null,
      unlockedLessons: userProgress?.unlockedLessons || [],
    }}>
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
