
'use client';

import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';

interface PointsContextType {
  totalPoints: number;
  addTotalPoints: (amount: number) => void;
  resetTotalPoints: () => void; // Function to reset points, e.g., for testing or user request
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'promptAscentTotalPoints';

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false); // Prevent hydration mismatch

  // Load points from localStorage on initial mount
  useEffect(() => {
    const storedPoints = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedPoints !== null) {
      setTotalPoints(parseInt(storedPoints, 10));
    }
    setIsInitialized(true); // Mark as initialized after loading
  }, []);

  // Save points to localStorage whenever they change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_KEY, totalPoints.toString());
    }
  }, [totalPoints, isInitialized]);

  const addTotalPoints = useCallback((amount: number) => {
    if (amount > 0 && isInitialized) {
      setTotalPoints((prevPoints) => prevPoints + amount);
    }
  }, [isInitialized]);

   const resetTotalPoints = useCallback(() => {
     if (isInitialized) {
        setTotalPoints(0);
     }
   }, [isInitialized]);


  // Avoid rendering children until state is initialized to prevent hydration errors
  if (!isInitialized) {
    return null; // Or a loading indicator if preferred
  }


  return (
    <PointsContext.Provider value={{ totalPoints, addTotalPoints, resetTotalPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const useGlobalPoints = (): PointsContextType => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('useGlobalPoints must be used within a PointsProvider');
  }
  return context;
};
