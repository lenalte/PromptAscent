'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode, useRef } from 'react';
import { type User, onAuthStateChanged, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type AuthError } from 'firebase/auth';
import { auth, db } from '../lib/firebase/index';
import {
  getUserProgress,
  createUserProgressDocument,
  updateUserDocument,
  completeStageInFirestore,
  type UserProgressData
} from '@/services/userProgressService';
import type { StageItemStatus, LessonItem } from '@/ai/schemas/lesson-schemas';
import { useRouter } from 'next/navigation';

const USERS_COLLECTION = 'users';

interface UserProgressContextType {
  currentUser: User | null;
  userProgress: UserProgressData | null;
  isLoadingAuth: boolean;
  isLoadingProgress: boolean;
  completeStageAndProceed: (
    lessonId: string,
    stageId: string,
    stageIndex: number,
    stageItemsWithStatus: { [itemId: string]: StageItemStatus },
    pointsEarnedThisStage: number,
    stageItems: LessonItem[]
  ) => Promise<{ nextLessonIdIfAny: string | null }>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  logOut: () => Promise<void>;
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
          username: usernameForNewUser ?? undefined,
        });
      } else if (usernameForNewUser && !progress.username) {
        console.log(`[UserProgressContext] User doc for ${userId} existed, updating with queued username: ${usernameForNewUser}`);
        await updateUserDocument(userId, { username: usernameForNewUser });
        progress.username = usernameForNewUser;
      }
      setUserProgress(progress);
      console.log('[UserProgressContext] User progress loaded/updated:', progress);

      if (usernameForNewUser) {
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
    console.log('[UserProgressContext] Setting up onAuthStateChanged listener. Auth available:', !!auth, 'DB available:', !!db);
    if (!auth) {
      console.error("[UserProgressContext] Firebase Auth instance is not available. Auth operations will fail.");
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingAuth(true);
      const usernameForNewUserOnAuthChange = queuedUsernameRef.current;

      if (user) {
        console.log('[UserProgressContext] onAuthStateChanged: User is signed in:', user.uid, 'isAnonymous:', user.isAnonymous);
        setCurrentUser(user);
        await fetchUserProgressData(user.uid, usernameForNewUserOnAuthChange);
      } else {
        console.log('[UserProgressContext] onAuthStateChanged: No user signed in. Attempting anonymous sign-in.');
        setCurrentUser(null);
        setUserProgress(null);
        queuedUsernameRef.current = null;
        try {
          const userCredential = await signInAnonymously(auth);
          console.log('[UserProgressContext] Anonymously signed in UID:', userCredential.user.uid);
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
  }, [fetchUserProgressData]);


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
      const { nextLessonIdIfAny, updatedProgress } = await completeStageInFirestore(
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
      console.log("[UserProgressContext] User signed up successfully:", userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error("[UserProgressContext] Error signing up:", error);
      queuedUsernameRef.current = null;
      throw error;
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
      console.log("[UserProgressContext] User signed out. Anonymous sign-in will be attempted.");
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
      completeStageAndProceed,
      signUpWithEmail,
      signInWithEmail,
      logOut,
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
