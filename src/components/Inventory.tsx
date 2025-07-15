
"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { CloseIcon } from './icons/closeIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <CloseIcon className="h-6 w-6" />
      </button>
      <div className="p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Inventar</h2>
        <Tabs defaultValue="allgemein" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-sidebar-accent">
            <TabsTrigger value="allgemein">Allgemein</TabsTrigger>
            <TabsTrigger value="zusammenfassungen">Zusammenfassungen</TabsTrigger>
          </TabsList>
          <TabsContent value="allgemein">
            <div className="mt-4 p-4 rounded-lg bg-black/20">
              <h3 className="text-lg font-semibold">Allgemeine Gegenstände</h3>
              <p className="mt-2 text-white/80">Hier werden deine allgemeinen Gegenstände angezeigt.</p>
            </div>
          </TabsContent>
          <TabsContent value="zusammenfassungen">
            <div className="mt-4 p-4 rounded-lg bg-black/20">
              <h3 className="text-lg font-semibold">Zusammenfassungen</h3>
              <p className="mt-2 text-white/80">Hier werden deine gesammelten Zusammenfassungen angezeigt.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inventory;
