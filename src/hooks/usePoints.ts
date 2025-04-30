
"use client";

import { useState, useCallback } from "react";

export function usePoints(initialPoints = 0) {
  const [points, setPoints] = useState(initialPoints);

  const addPoints = useCallback((amount: number) => {
    setPoints((prevPoints) => prevPoints + amount);
  }, []);

  const deductPoints = useCallback((amount: number) => {
    setPoints((prevPoints) => Math.max(0, prevPoints - amount)); // Ensure points don't go below 0
  }, []);

  return { points, addPoints, deductPoints };
}
