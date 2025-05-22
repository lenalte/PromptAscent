
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

    // Calculate left offset for the dotted line and padding for description
    // Assumes: <a> has p-2 (0.5rem), icon wrapper <span> has p-1.5 (0.375rem) & mr-3 (0.75rem), icon is w-5 (1.25rem)
    // 1rem = 16px for tailwind defaults
    const iconContainerLeftPadding = 0.5; // rem, from a's p-2
    const iconSpanPadding = 0.375; // rem, from span's p-1.5
    const iconWidth = 1.25; // rem, from w-5
    const iconSpanMarginRight = 0.75; // rem, from mr-3

    const lineLeftOffsetRem = iconContainerLeftPadding + iconSpanPadding + (iconWidth / 2); // Center of icon
    const descriptionPaddingLeftRem = iconContainerLeftPadding + (iconSpanPadding * 2) + iconWidth + iconSpanMarginRight;


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
                                <div className="relative"> {/* Container for UL and the line */}
                                    {/* Dotted Line Element - adjust top/bottom/left to align with icons */}
                                    <div
                                        className="absolute w-px bg-repeat-y opacity-70"
                                        style={{
                                            left: `${lineLeftOffsetRem}rem`, // Center of icons
                                            top: '1.25rem', // Start slightly below the first icon's top
                                            bottom: '1.25rem', // End slightly above the last icon's bottom
                                            backgroundImage: `linear-gradient(to bottom, hsl(var(--sidebar-foreground)) 50%, transparent 50%)`,
                                            backgroundSize: '1px 8px', // Creates a dotted effect (1px line, 4px space)
                                            zIndex: 0, // Ensure line is behind list items
                                        }}
                                    ></div>
                                    <ul className="space-y-1 font-medium relative z-10"> {/* Ensure ul is above the line */}
                                        {lessons.map((lesson) => (
                                            <li key={lesson.id} className="relative"> {/* Each li is relative for z-index context if needed */}
                                                <Link href={`/lesson/${lesson.id}`} passHref legacyBehavior>
                                                    <a className={`flex flex-col p-2 rounded-lg hover:bg-[var(--sidebar-accent)] group sidebar-foreground`}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="flex items-center overflow-hidden">
                                                                {/* Span around icon to give it a background and make it circular to "cover" the line */}
                                                                <span className="mr-3 p-1.5 rounded-full bg-[hsl(var(--sidebar-background))] relative z-20 flex items-center justify-center">
                                                                    <BookOpen className="h-5 w-5 text-foreground shrink-0" />
                                                                </span>
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
                                                            <p 
                                                              className="mt-2 text-xs text-foreground/80 whitespace-normal break-words"
                                                              style={{ paddingLeft: `${descriptionPaddingLeftRem}rem` }}
                                                            >
                                                                {lesson.description}
                                                            </p>
                                                        )}
                                                    </a>
                                                </Link>
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
