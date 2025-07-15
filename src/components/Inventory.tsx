
"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { CloseIcon } from './icons/closeIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProgress } from '@/context/UserProgressContext';
import { AvatarDisplay } from './AvatarDisplay';

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth: number;
}

const Inventory: React.FC<InventoryProps> = ({ isOpen, onClose, sidebarWidth }) => {
  const { userProgress } = useUserProgress();

  if (!isOpen) {
    return null;
  }

  const tabTriggerClasses = "relative inline-block w-full text-white px-4 py-2 transition-all duration-100 no-underline text-center";
  const activeTabClasses = "!bg-white !text-black";
  const inactiveTabClasses = "bg-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))]";

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
          <TabsList className="grid w-full grid-cols-2 gap-4 bg-transparent p-0 border-none">
              <TabsTrigger value="allgemein" className={cn(tabTriggerClasses, inactiveTabClasses, "data-[state=active]:" + activeTabClasses)}>
                Allgemein
              </TabsTrigger>
              <TabsTrigger value="zusammenfassungen" className={cn(tabTriggerClasses, inactiveTabClasses, "data-[state=active]:" + activeTabClasses)}>
                Zusammenfassungen
              </TabsTrigger>
          </TabsList>
          <TabsContent value="allgemein">
            <div className="mt-4 p-4 rounded-lg bg-black/20">
              <h3 className="text-lg font-semibold mb-4">Allgemeine Gegenstände</h3>
              
              {userProgress?.avatarId && (
                <div className="flex items-center gap-4">
                  <AvatarDisplay avatarId={userProgress.avatarId} className="h-32 w-32" />
                  <p className="text-white/80">Dein aktueller Avatar.</p>
                </div>
              )}

              <p className="mt-4 text-white/80">Hier werden deine allgemeinen Gegenstände angezeigt.</p>
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
