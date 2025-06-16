
'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode, useRef } from 'react';
import { type User, onAuthStateChanged, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type AuthError } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/index';
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
  addPointsToTotal: (amount: number) => Promise<void>;
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

  const fetchUserProgressData = useCallback(async (userId: string, initialUsernameFromAuthChange: string | null) => {
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
          username: initialUsernameFromAuthChange ?? undefined,
          totalPoints: 0,
          currentLessonId: initialLessonId,
          completedLessons: [],
          unlockedLessons: [initialLessonId],
        });
      } else if (initialUsernameFromAuthChange && !progress.username) {
        console.log(`[UserProgressContext] User doc for ${userId} existed, updating with queued username: ${initialUsernameFromAuthChange}`);
        await updateUserDocument(userId, { username: initialUsernameFromAuthChange });
        progress.username = initialUsernameFromAuthChange;
      }
      setUserProgress(progress);
      console.log('[UserProgressContext] User progress loaded:', progress);

      if (initialUsernameFromAuthChange) {
        queuedUsernameRef.current = null; 
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
      console.error("[UserProgressContext] Firebase Auth instance is not available from import. Check Firebase initialization in src/lib/firebase.");
      setIsLoadingAuth(false);
      return;
    }
    if (!db) {
      console.error("[UserProgressContext] Firestore instance (db) is not available from import. Check Firebase initialization in src/lib/firebase.");
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingAuth(true);
      const currentQueuedUserForAuthChange = queuedUsernameRef.current; 

      if (user) {
        console.log('[UserProgressContext] User is signed in (or was already):', user.uid, 'isAnonymous:', user.isAnonymous);
        setCurrentUser(user);
        await fetchUserProgressData(user.uid, currentQueuedUserForAuthChange);
      } else {
        console.log('[UserProgressContext] No user signed in. Attempting anonymous sign-in.');
        setCurrentUser(null);
        setUserProgress(null);
        queuedUsernameRef.current = null; 
        try {
          const userCredential = await signInAnonymously(auth);
          console.log('[UserProgressContext] Anonymously signed in UID:', userCredential.user.uid);
          setCurrentUser(userCredential.user);
          await fetchUserProgressData(userCredential.user.uid, null);
        } catch (error) {
          const authError = error as AuthError;
          console.error("[UserProgressContext] Anonymous sign-in failed:", authError);
          if (authError.code === 'auth/operation-not-allowed') {
            console.error("*****************************************************************************************************************");
            console.error("IMPORTANT: Anonymous sign-in failed because it's not enabled in your Firebase project.");
            console.error("Please go to your Firebase console -> Authentication -> Sign-in method -> Enable 'Anonymous' provider.");
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
      console.error(`[UserProgressContext] Error adding points for UID ${currentUser.uid}:`, error);
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
      console.log(`[UserProgressContext] Lesson ${lessonId} completed for UID ${currentUser.uid}. Points updated. Next lesson: ${newNextLessonId}`);
      return newNextLessonId;
    } catch (error) {
      console.error(`[UserProgressContext] Error completing lesson ${lessonId} for UID ${currentUser.uid}:`, error);
      return null;
    } finally {
      setIsLoadingProgress(false);
    }
  }, [currentUser, userProgress]);

  const signUpWithEmail = async (email: string, password: string, username: string): Promise<User | null> => {
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth not initialized for sign up");
      throw new Error("Firebase Auth not initialized");
    }
    setIsLoadingAuth(true);
    try {
      queuedUsernameRef.current = username; 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed up successfully:", userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error("[UserProgressContext] Error signing up:", error);
      queuedUsernameRef.current = null; 
      throw error;
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
      queuedUsernameRef.current = null; 
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("[UserProgressContext] User signed in successfully:", userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error("[UserProgressContext] Error signing in:", error);
      throw error;
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
      queuedUsernameRef.current = null; 
      await firebaseSignOut(auth);
      console.log("[UserProgressContext] User signed out. Anonymous sign-in will be attempted by onAuthStateChanged.");
      router.push('/');
    } catch (error) {
      console.error("[UserProgressContext] Error signing out:", error);
    } finally {
      // setIsLoadingAuth(false); // onAuthStateChanged will manage this
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

