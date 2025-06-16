
'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { type User, onAuthStateChanged, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/index.ts'; // Ensure db is correctly imported if used here, or pass to service
import {
  getUserProgress,
  createUserProgressDocument,
  updateTotalPointsInFirestore,
  completeLessonInFirestore,
  type UserProgressData
} from '../services/userProgressService'; // Adjusted path to use alias, assuming services is also under src
import { useRouter } from 'next/navigation'; // For redirection

interface UserProgressContextType {
  currentUser: User | null;
  userProgress: UserProgressData | null;
  isLoadingAuth: boolean;
  isLoadingProgress: boolean;
  addPointsToTotal: (amount: number) => Promise<void>;
  completeLessonAndProceed: (lessonId: string, pointsEarned: number) => Promise<string | null>; // Returns next lesson ID or null
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
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
  const router = useRouter();

  const fetchUserProgressData = useCallback(async (userId: string) => {
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
        console.log('[UserProgressContext] No progress found, creating new document for UID:', userId);
        const initialLessonId = "lesson1";
        progress = await createUserProgressDocument(userId, {
          totalPoints: 0,
          currentLessonId: initialLessonId,
          completedLessons: [],
          unlockedLessons: [initialLessonId],
        });
      }
      setUserProgress(progress);
      console.log('[UserProgressContext] User progress loaded:', progress);
    } catch (error) {
      console.error("[UserProgressContext] Error fetching/creating user progress:", error);
      setUserProgress(null);
    } finally {
      setIsLoadingProgress(false);
    }
  }, []);

  useEffect(() => {
    console.log('[UserProgressContext] Setting up onAuthStateChanged listener. Auth available via import:', !!auth, 'DB available via import:', !!db);
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth instance is not available from import. Check Firebase initialization in src/lib/firebase.");
      setIsLoadingAuth(false);
      return;
    }
     if (!db) {
      console.error("[UserProgressContext] Firestore instance (db) is not available from import. Check Firebase initialization in src/lib/firebase.");
    }


    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingAuth(true);
      if (user) {
        console.log('[UserProgressContext] User is signed in (or was already):', user.uid, 'isAnonymous:', user.isAnonymous);
        setCurrentUser(user);
        await fetchUserProgressData(user.uid);
      } else {
        console.log('[UserProgressContext] No user signed in. Attempting anonymous sign-in.');
        setCurrentUser(null);
        setUserProgress(null);
        try {
          const userCredential = await signInAnonymously(auth);
          console.log('[UserProgressContext] Anonymously signed in UID:', userCredential.user.uid);
          // Ensure setCurrentUser and fetchUserProgressData are called for anonymous user
          setCurrentUser(userCredential.user);
          await fetchUserProgressData(userCredential.user.uid);
        } catch (error) {
          console.error("[UserProgressContext] Anonymous sign-in failed:", error);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => {
      console.log('[UserProgressContext] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProgressData]);


  const addPointsToTotal = useCallback(async (amount: number) => {
    if (!currentUser || !userProgress || amount <= 0 || !db) {
        if(!db) console.error("[UserProgressContext] Firestore (db) is not available for addPointsToTotal.");
        return;
    }
    setIsLoadingProgress(true);
    try {
      const newTotalPoints = userProgress.totalPoints + amount;
      await updateTotalPointsInFirestore(currentUser.uid, newTotalPoints);
      setUserProgress(prev => prev ? { ...prev, totalPoints: newTotalPoints } : null);
      console.log(`[UserProgressContext] Added ${amount} points. New total: ${newTotalPoints}`);
    } catch (error) {
      console.error("[UserProgressContext] Error adding points:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser, userProgress]);

  const completeLessonAndProceed = useCallback(async (lessonId: string, pointsEarnedThisLesson: number) => {
    if (!currentUser || !db) {
      console.error("[UserProgressContext] Cannot complete lesson: no current user or db unavailable.");
      if(!db) console.error("[UserProgressContext] Firestore (db) is not available for completeLessonAndProceed.");
      return null;
    }
    if (!userProgress) {
        console.error("[UserProgressContext] Cannot complete lesson: userProgress not loaded.");
        return null;
    }

    setIsLoadingProgress(true);
    try {
      const newTotalPoints = userProgress.totalPoints + pointsEarnedThisLesson;
      const { nextLessonId: newNextLessonId, updatedProgress } = await completeLessonInFirestore(
        currentUser.uid,
        lessonId,
        newTotalPoints
      );
      setUserProgress(updatedProgress);
      console.log(`[UserProgressContext] Lesson ${lessonId} completed. Points updated. Next lesson: ${newNextLessonId}`);
      return newNextLessonId;
    } catch (error) {
      console.error(`[UserProgressContext] Error completing lesson ${lessonId}:`, error);
      return null;
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser, userProgress]);


  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign up");
      throw new Error("Firebase Auth not initialized");
    }
    setIsLoadingAuth(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed up successfully:", userCredential.user.uid);
      // User state will be updated by onAuthStateChanged listener, which will trigger fetchUserProgressData
      return userCredential.user;
    } catch (error) {
      console.error("[UserProgressContext] Error signing up:", error);
      throw error; // Re-throw to be caught by the form
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign in");
      throw new Error("Firebase Auth not initialized");
    }
    setIsLoadingAuth(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed in successfully:", userCredential.user.uid);
      // User state will be updated by onAuthStateChanged listener
      return userCredential.user;
    } catch (error) {
      console.error("[UserProgressContext] Error signing in:", error);
      throw error; // Re-throw to be caught by the form
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logOut = async () => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign out");
      return;
    }
    setIsLoadingAuth(true);
    try {
      await firebaseSignOut(auth);
      // setCurrentUser(null) and setUserProgress(null) will be handled by onAuthStateChanged listener
      // which will then trigger anonymous sign-in.
      console.log("[UserProgressContext] User signed out. Anonymous sign-in will be attempted by onAuthStateChanged.");
      router.push('/'); // Navigate to home, which might show login/register or lesson list for anon user
    } catch (error) {
      console.error("[UserProgressContext] Error signing out:", error);
    } finally {
      setIsLoadingAuth(false);
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

