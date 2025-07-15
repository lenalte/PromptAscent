
"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { CloseIcon } from './icons/closeIcon';

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth: number;
}

const Inventory: React.FC<InventoryProps> = ({ isOpen, onClose, sidebarWidth }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed top-0 right-0 bottom-0 sidebar-background z-50"
      style={{ left: `${sidebarWidth}px` }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        aria-label="Close inventory"
      >
        <CloseIcon className="h-8 w-8" />
      </button>
      <div className="p-8 text-white">
        <h2 className="text-2xl font-bold">Inventar</h2>
        <p className="mt-4">Hier werden deine Gegenstände angezeigt.</p>
        {/* Inventory content will go here */}
      </div>
    </div>
  );
};

export default Inventory;
