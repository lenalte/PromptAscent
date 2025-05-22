
'use client';

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { getAvailableLessons, type Lesson } from '@/data/lessons';
import { BookOpen, ChevronDown, ChevronUp, Loader2, UserCircle, BarChart3 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarProps {
    initialContentOpen?: boolean;
    onContentToggle: (isOpen: boolean) => void;
}

type LessonListing = Omit<Lesson, 'items'>;

// Profil SVG Icon
const ProfilIcon = () => (
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-foreground shrink-0" viewBox="0 0 790.000000 790.000000"
        preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
            fill="currentColor" stroke="none">
            <path d="M2900 7630 l0 -270 -265 0 -265 0 0 -270 0 -270 -270 0 -270 0 0 -1040 0 -1040 270 0 270 0 0 -270 0 -270 -265 0 -265 0 0 -270 0 -270 -270 0 -270 0 0 -785 0 -785 265 0 265 0 0 -270 0 -270 265 0 265 0 0 -775 0 -775 1580 0 1580 0 0 775 0 775 265 0 265 0 0 270 0 270 265 0 265 0 0 785 0 785 -270 0 -270 0 0 270 0 270 -265 0 -265 0 0 270 0 270 -1040 0 -1040 0 0 -270z m2080 -540 l0 -270 265 0 265 0 0 -1040 0 -1040 -265 0 -265 0 0 -270 0 -270 265 0 265 0 0 -270 0 -270 265 0 265 0 0 -785 0 -785 -260 0 -260 0 0 265 0 265 -270 0 -270 0 0 -1040 0 -1040 -260 0 -260 0 0 525 0 525 -525 0 -525 0 0 -525 0 -525 -255 0 -255 0 0 1040 0 1040 -270 0 -270 0 0 -265 0 -265 -260 0 -260 0 0 785 0 785 265 0 265 0 0 270 0 270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 1040 0 1040 265 0 265 0 0 270 0 270 1040 0 1040 0 0 -270z"/>
            <path d="M2900 5510 l0 -270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 -270z" />
            <path d="M4450 5510 l0 -270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 -270z" />
        </g>
    </svg>
);

// Leaderboard Icon
const LeaderboardIcon = () => (
    <BarChart3 className="h-8 w-8 text-foreground shrink-0" />
);


const Sidebar: React.FC<SidebarProps> = ({ initialContentOpen = true, onContentToggle }) => {
    const [isContentOpen, setIsContentOpen] = useState(initialContentOpen);
    const [activeCategory, setActiveCategory] = useState<string | null>(initialContentOpen ? 'profil' : null);

    const [lessons, setLessons] = useState<LessonListing[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(true);
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

    useEffect(() => {
        if (isContentOpen && !activeCategory) {
            setActiveCategory('profil');
        }
        onContentToggle(isContentOpen); // Notify parent about content area state
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
            // setActiveCategory(null); // Keep active category to reopen it later
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

    return (
        <div className="flex h-screen fixed top-0 left-0 z-40">
            {/* Fixed Icon Bar */}
            <div className="w-20 sidebar-background flex flex-col items-center py-4 space-y-6">
                <button
                    type="button"
                    onClick={() => handleCategoryClick('profil')}
                    className={cn(
                        "p-3 rounded-lg hover:bg-[var(--sidebar-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]",
                        activeCategory === 'profil' && isContentOpen && "bg-[var(--sidebar-accent)]"
                    )}
                    aria-label="Profil und Lektionen"
                >
                    <ProfilIcon />
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
                    <LeaderboardIcon />
                </button>
            </div>

            {/* Collapsible Content Area */}
            {isContentOpen && (
                <div className="w-64 sidebar-background h-full px-3 py-4 overflow-y-auto transition-all duration-300 ease-in-out">
                    {activeCategory === 'profil' && (
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-4 px-1 pt-4">Profil &amp; Lektionen</h2>
                            {isLoadingLessons && (
                                <div className={`flex items-center p-2 rounded-lg text-foreground`}>
                                    <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                                    <span className="ms-3 text-sm">Lade Lektionen...</span>
                                </div>
                            )}
                            {!isLoadingLessons && lessons.length > 0 && (
                                <ul className="space-y-1 font-medium">
                                    {lessons.map((lesson) => (
                                        <li key={lesson.id}>
                                            <Link href={`/lesson/${lesson.id}`} passHref legacyBehavior>
                                                <a className={`flex flex-col p-2 rounded-lg dark:text-white hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)] group sidebar-foreground`}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center overflow-hidden">
                                                            <BookOpen className="h-5 w-5 text-foreground shrink-0 mr-3" />
                                                            <span className="text-sm whitespace-normal break-words flex-1">{lesson.title}</span>
                                                        </div>
                                                        {lesson.description && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => toggleLessonDescription(lesson.id, e)}
                                                                className="p-1 -mr-1 hover:bg-opacity-50 rounded shrink-0"
                                                                aria-label={expandedLessonId === lesson.id ? "Beschreibung einklappen" : "Beschreibung ausklappen"}
                                                            >
                                                                {expandedLessonId === lesson.id ? <ChevronUp className="h-4 w-4 text-foreground/70" /> : <ChevronDown className="h-4 w-4 text-foreground/70" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {expandedLessonId === lesson.id && lesson.description && (
                                                        <p className="mt-2 ml-[calc(1.25rem+0.75rem)] text-xs text-foreground/80 whitespace-normal break-words">
                                                            {lesson.description}
                                                        </p>
                                                    )}
                                                </a>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {!isLoadingLessons && lessons.length === 0 && activeCategory === 'profil' && (
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
