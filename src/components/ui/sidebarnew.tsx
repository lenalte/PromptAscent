
'use client';

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link'; // Import Link
import { getAvailableLessons, type Lesson } from '@/data/lessons';
import { getLeaderboardData } from '@/services/userProgressService';
import type { LeaderboardEntry } from '@/services/userProgressService';
import { BookOpen, ChevronDown, ChevronUp, Loader2, UserCircle, UserPlus, Award, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/context/UserProgressContext"; // Import useUserProgress
import { EightbitButton } from './eightbit-button';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { LockClosedIcon } from "@/components/icons/lock_closed";
import { LockOpenIcon } from "@/components/icons/lock_open";
import { LeaderboardIcon } from "@/components/icons/LeaderboardIcon";
import { LogoutIcon } from "@/components/icons/LogoutIcon";
import { LoginIcon } from "@/components/icons/LoginIcon";
import { PointsIcon } from '@/components/icons/PointsIcon';
import { ProfilIcon } from "../icons/ProfilIcon";

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

    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);


    useEffect(() => {
        if (isContentOpen && !activeCategory) {
            setActiveCategory('profil');
        }
        onContentToggle(isContentOpen);
    }, [isContentOpen, activeCategory, onContentToggle]);

    useEffect(() => {
        async function fetchSidebarData() {
            if (activeCategory === 'profil') {
                setIsLoadingLessons(true);
                try {
                    const availableLessons = await getAvailableLessons();
                    setLessons(availableLessons);
                } catch (error) {
                    console.error("Failed to fetch lessons for sidebar:", error);
                }
                setIsLoadingLessons(false);
            } else if (activeCategory === 'leaderboard') {
                setIsLoadingLeaderboard(true);
                try {
                    const data = await getLeaderboardData();
                    setLeaderboardData(data);
                } catch (error) {
                    console.error("Failed to fetch leaderboard data:", error);
                }
                setIsLoadingLeaderboard(false);
            }
        }
        if (isContentOpen) {
            fetchSidebarData();
        }
    }, [activeCategory, isContentOpen]);

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

    const userDisplayName = userProgress?.username || currentUser?.displayName || "Profil & Lektionen";
    
    const getMedalColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-gray-400';
        if (rank === 2) return 'text-yellow-600';
        return 'text-white/60';
    };


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
                        <AvatarDisplay avatarId={userProgress?.avatarId ?? 'avatar1'} className={cn(
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
                    {isAuthenticated ? (
                        <EightbitButton onClick={logOut} className="!p-2" aria-label="Logout">
                            <LogoutIcon />
                        </EightbitButton>
                    ) : (
                         <Link href="/auth/login" passHref legacyBehavior>
                            <EightbitButton as="a" className="!p-2" aria-label="Login">
                                <LoginIcon />
                            </EightbitButton>
                        </Link>
                    )}
                </div>
            </div>

            {/* Collapsible Content Area */}
            {isContentOpen && (
                <div className="w-64 sidebar-background h-full pr-3 pl-2 py-4 overflow-y-auto transition-all duration-300 ease-in-out hide-scrollbar">
                    {activeCategory === 'profil' && (
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4 px-1 pt-4 truncate" title={userDisplayName}>
                                {userDisplayName}
                            </h2>
                            {isLoadingLessons && (
                                <div className={`flex items-center p-2 rounded-lg text-white`}>
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
                                                        `flex flex-col p-2 rounded-lg group text-white w-full text-left`,
                                                        isLessonEffectivelySelected(lesson.id) && "bg-[var(--sidebar-accent)]",
                                                        isLessonEffectivelyUnlocked(lesson.id) ? "hover:bg-[var(--sidebar-accent)] cursor-pointer" : "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center overflow-hidden">
                                                            <span className={cn("mr-3 h-8 w-8 relative z-20 flex items-center justify-center rounded-full bg-[hsl(var(--sidebar-background))]")}>
                                                                {isLessonEffectivelyUnlocked(lesson.id) ? (
                                                                    <LockOpenIcon className="shrink-0 text-white" />
                                                                ) : (
                                                                    <LockClosedIcon className="shrink-0 text-white" />
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
                                                                {expandedLessonId === lesson.id ? <ChevronUp className="h-4 w-4 text-white/70" /> : <ChevronDown className="h-4 w-4 text-white/70" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {expandedLessonId === lesson.id && lesson.description && (
                                                        <p
                                                            className="mt-2 text-xs text-white/80 whitespace-normal break-words"
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
                                <div className="p-2 text-sm text-white/70">
                                    Keine Lektionen verfügbar.
                                </div>
                            )}
                        </div>
                    )}
                    {activeCategory === 'leaderboard' && (
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4 px-1 pt-4">Leaderboard</h2>
                             {isLoadingLeaderboard ? (
                                <div className="flex items-center p-2 rounded-lg text-white">
                                    <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                                    <span className="ms-3 text-sm">Lade Leaderboard...</span>
                                </div>
                            ) : leaderboardData.length > 0 ? (
                                <ul className="space-y-2">
                                    {leaderboardData.map((user, index) => (
                                        <li key={user.userId} className={cn(
                                            "flex items-center p-2 rounded-lg",
                                            user.userId === currentUser?.uid ? 'bg-[#3B0099]' : ''
                                        )}>
                                            <span className={cn("w-6 text-center font-bold mr-2", getMedalColor(index))}>
                                                {index + 1}
                                            </span>
                                            <AvatarDisplay avatarId={user.avatarId} className="h-6 w-6 mr-2 shrink-0 text-white" />
                                            <span className="flex-1 truncate text-white text-sm" title={user.username}>
                                                {user.username}
                                            </span>
                                            <span className="flex items-center font-semibold text-white text-sm">
                                                <PointsIcon className="h-5 w-5 mr-1"/>
                                                {user.totalPoints}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-white/80 p-2 text-sm">Noch niemand auf dem Leaderboard. Sei der Erste!</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
