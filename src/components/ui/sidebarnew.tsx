
'use client';

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link'; // Import Link
import { getAvailableLessons, type Lesson } from '@/data/lessons';
import { BookOpen, ChevronDown, ChevronUp, Loader2, UserCircle, LogIn, UserPlus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/context/UserProgressContext"; // Import useUserProgress
import { Button } from "./button"; // Assuming Button is in the same folder or accessible path
import { ProfilIcon } from '@/components/icons/ProfilIcon'; // Import the new ProfilIcon
import { LockClosedIcon } from "@/components/icons/lock_closed";
import { LockOpenIcon } from "@/components/icons/lock_open";
import { LeaderboardIcon } from "@/components/icons/LeaderboardIcon";
import { LogoutIcon } from "@/components/icons/LogoutIcon";

interface SidebarProps {
    initialContentOpen?: boolean;
    onContentToggle: (isOpen: boolean) => void;
    onLessonSelect: (lesson: LessonListing) => void;
    currentSelectedLessonId?: string | null;
    currentLessonIdFromProgress?: string | null; // Added prop
    unlockedLessonIds?: string[]; // Added prop
    isAuthenticated: boolean; // To show login/register or logout
}

type LessonListing = Omit<Lesson, 'items'>;

const Sidebar: React.FC<SidebarProps> = ({
    initialContentOpen = true,
    onContentToggle,
    onLessonSelect,
    currentSelectedLessonId,
    currentLessonIdFromProgress,
    unlockedLessonIds = [],
    isAuthenticated
}) => {
    const [isContentOpen, setIsContentOpen] = useState(initialContentOpen);
    const [activeCategory, setActiveCategory] = useState<string | null>(initialContentOpen ? 'profil' : null);

    const [lessons, setLessons] = useState<LessonListing[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(true);
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
    const { logOut, currentUser, userProgress } = useUserProgress(); // Added userProgress


    useEffect(() => {
        if (isContentOpen && !activeCategory) {
            setActiveCategory('profil');
        }
        onContentToggle(isContentOpen);
    }, [isContentOpen, activeCategory, onContentToggle]);

    useEffect(() => {
        async function fetchLessonsData() {
            setIsLoadingLessons(true);
            try {
                const availableLessons = await getAvailableLessons();
                setLessons(availableLessons);
            } catch (error) {
                console.error("Failed to fetch lessons for sidebar:", error);
            }
            setIsLoadingLessons(false);
        }
        if (activeCategory === 'profil') {
            fetchLessonsData();
        }
    }, [activeCategory]);

    const handleCategoryClick = (category: string) => {
        if (activeCategory === category && isContentOpen) {
            setIsContentOpen(false);
        } else {
            setActiveCategory(category);
            setIsContentOpen(true);
        }
    };

    const toggleLessonDescription = (lessonId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setExpandedLessonId(prevId => prevId === lessonId ? null : lessonId);
    };

    const isLessonEffectivelySelected = (lessonId: string) => {
      return currentSelectedLessonId === lessonId || (currentSelectedLessonId === null && currentLessonIdFromProgress === lessonId);
    };

    const isLessonEffectivelyUnlocked = (lessonId: string) => {
        if (currentUser?.isAnonymous) return true;
        return unlockedLessonIds.includes(lessonId);
    };

    const iconContainerLeftPadding = 0.5;
    const iconSpanPadding = 0.375;
    const iconWidth = 1.25;
    const iconSpanMarginRight = 0.75;

    const lineLeftOffsetRem = iconContainerLeftPadding + iconSpanPadding + (iconWidth / 2);
    const descriptionPaddingLeftRem = iconContainerLeftPadding + (iconSpanPadding * 2) + iconWidth + iconSpanMarginRight;

    const userDisplayName = userProgress?.username || (currentUser && !currentUser.isAnonymous && currentUser.email) || "Profil & Lektionen";

    return (
        <div className="flex h-screen fixed top-0 left-0 z-40">
            {/* Fixed Icon Bar */}
            <div className="w-16 sidebar-background flex flex-col items-center justify-between py-4 space-y-6">
                <div className="flex flex-col items-center space-y-6">
                    <button
                        type="button"
                        onClick={() => handleCategoryClick('profil')}
                        className={cn(
                            "p-3 rounded-lg hover:bg-[var(--sidebar-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]",
                            activeCategory === 'profil' && isContentOpen && "bg-[var(--sidebar-accent)]"
                        )}
                        aria-label="Profil und Lektionen"
                    >
                        <ProfilIcon className={cn(
                            "h-8 w-8 shrink-0",
                             activeCategory === 'profil' && isContentOpen ? "text-[hsl(var(--sidebar-foreground))]" : "text-[hsl(var(--sidebar-foreground))] opacity-70"
                        )} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleCategoryClick('leaderboard')}
                        className={cn(
                            "p-3 rounded-lg hover:bg-[var(--sidebar-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]",
                            activeCategory === 'leaderboard' && isContentOpen && "bg-[var(--sidebar-accent)]"
                        )}
                        aria-label="Leaderboard"
                    >
                        <LeaderboardIcon className={cn(
                            "h-8 w-8 shrink-0",
                            activeCategory === 'leaderboard' && isContentOpen ? "text-[hsl(var(--sidebar-foreground))]" : "text-[hsl(var(--sidebar-foreground))] opacity-70"
                        )} />
                    </button>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    {!isAuthenticated ? (
                        <>
                            <Link href="/auth/login" passHref legacyBehavior>
                                <Button variant="ghost" size="icon" className="text-[hsl(var(--sidebar-foreground))] hover:bg-sidebar-accent" aria-label="Login">
                                    <LogIn />
                                </Button>
                            </Link>
                            <Link href="/auth/register" passHref legacyBehavior>
                                <Button variant="ghost" size="icon" className="text-[hsl(var(--sidebar-foreground))] hover:bg-sidebar-accent" aria-label="Register">
                                    <UserPlus />
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={logOut} className="text-[hsl(var(--sidebar-foreground))] hover:bg-sidebar-accent" aria-label="Logout">
                            <LogoutIcon />
                        </Button>
                    )}
                </div>
            </div>

            {/* Collapsible Content Area */}
            {isContentOpen && (
                <div className="w-64 sidebar-background h-full pr-3 pl-2 py-4 overflow-y-auto transition-all duration-300 ease-in-out hide-scrollbar">
                    {activeCategory === 'profil' && (
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-4 px-1 pt-4 truncate" title={userDisplayName}>
                                {userDisplayName}
                            </h2>
                            {isLoadingLessons && (
                                <div className={`flex items-center p-2 rounded-lg text-foreground`}>
                                    <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                                    <span className="ms-3 text-sm">Lade Lektionen...</span>
                                </div>
                            )}
                            {!isLoadingLessons && lessons.length > 0 && (
                                <div className="relative">
                                    {/* Dotted Line Element */}
                                    <div
                                        className="absolute w-px bg-repeat-y opacity-70"
                                        style={{
                                            left: `${lineLeftOffsetRem}rem`,
                                            top: '1.25rem',
                                            bottom: '1.25rem',
                                            backgroundImage: `linear-gradient(to bottom, hsl(var(--sidebar-foreground)) 50%, transparent 50%)`,
                                            backgroundSize: '1px 8px',
                                            zIndex: 0,
                                        }}
                                    ></div>
                                    <ul className="space-y-1 font-medium relative z-10">
                                        {lessons.map((lesson) => (
                                            <li key={lesson.id} className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => onLessonSelect(lesson)}
                                                    disabled={!isLessonEffectivelyUnlocked(lesson.id)}
                                                    className={cn(
                                                        `flex flex-col p-2 rounded-lg group sidebar-foreground w-full text-left`,
                                                        isLessonEffectivelySelected(lesson.id) && "bg-[var(--sidebar-accent)]",
                                                        isLessonEffectivelyUnlocked(lesson.id) ? "hover:bg-[var(--sidebar-accent)] cursor-pointer" : "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center overflow-hidden">
                                                            <span className="mr-3 p-1.5 rounded-full bg-[hsl(var(--sidebar-background))] relative z-20 flex items-center justify-center">
                                                                {isLessonEffectivelyUnlocked(lesson.id) ? (
                                                                    <LockOpenIcon className="text-foreground shrink-0" />
                                                                ) : (
                                                                    <LockClosedIcon className="text-foreground shrink-0" />
                                                                )}
                                                            </span>
                                                            <span className={cn(
                                                              "text-sm whitespace-normal break-words flex-1",
                                                              isLessonEffectivelyUnlocked(lesson.id) && "font-semibold"
                                                            )}>
                                                                {lesson.title}
                                                            </span>
                                                        </div>
                                                        {lesson.description && (
                                                            <div
                                                                onClick={(e) => toggleLessonDescription(lesson.id, e)}
                                                                className="p-1 -mr-1 hover:bg-opacity-50 rounded shrink-0 z-30 cursor-pointer"
                                                                aria-label={expandedLessonId === lesson.id ? "Beschreibung einklappen" : "Beschreibung ausklappen"}
                                                                role="button"
                                                                tabIndex={0}
                                                            >
                                                                {expandedLessonId === lesson.id ? <ChevronUp className="h-4 w-4 text-foreground/70" /> : <ChevronDown className="h-4 w-4 text-foreground/70" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {expandedLessonId === lesson.id && lesson.description && (
                                                        <p
                                                            className="mt-2 text-xs text-foreground/80 whitespace-normal break-words"
                                                            style={{ paddingLeft: `${descriptionPaddingLeftRem}rem` }}
                                                        >
                                                            {lesson.description}
                                                        </p>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {!isLoadingLessons && lessons.length === 0 && (
                                <div className="p-2 text-sm text-foreground/70">
                                    Keine Lektionen verfügbar.
                                </div>
                            )}
                        </div>
                    )}
                    {activeCategory === 'leaderboard' && (
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-4 px-1 pt-4">Leaderboard</h2>
                            <p className="text-foreground/80 p-2 text-sm">Leaderboard-Inhalt kommt bald!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;

    
