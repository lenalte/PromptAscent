
"use client";

import { useState, useCallback } from "react";

export function usePoints(initialPoints = 0) {
  const [points, setPoints] = useState(initialPoints);

  const addPoints = useCallback((amount: number) => {
    if (amount > 0) { // Ensure adding positive points
      setPoints((prevPoints) => prevPoints + amount);
    }
  }, []);

  const deductPoints = useCallback((amount: number) => {
     if (amount > 0) { // Ensure deducting positive points
       setPoints((prevPoints) => Math.max(0, prevPoints - amount)); // Ensure points don't go below 0
     }
  }, []);

  // Function to directly set points (e.g., for resetting)
  const resetPoints = useCallback((newPoints = 0) => {
      setPoints(newPoints);
  }, []);


  return { points, addPoints, deductPoints, setPoints: resetPoints }; // Export setPoints as resetPoints
}
```