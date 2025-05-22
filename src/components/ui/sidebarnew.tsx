
'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { getAvailableLessons, type Lesson } from '@/data/lessons';
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarProps {
    onToggle: (collapsed: boolean) => void;
}

type LessonListing = Omit<Lesson, 'items'>; // This includes the description

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [lessons, setLessons] = useState<LessonListing[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(true);
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);


    useEffect(() => {
        async function fetchLessonsData() {
            setIsLoadingLessons(true);
            try {
                const availableLessons = await getAvailableLessons();
                setLessons(availableLessons);
            } catch (error) { // Added curly braces here
                console.error("Failed to fetch lessons for sidebar:", error);
            }
            setIsLoadingLessons(false);
        }
        fetchLessonsData();
    }, []);

    const toggleSidebarCollapse = () => {
        const newCollapsedState = !collapsed;
        setCollapsed(newCollapsedState);
        onToggle(newCollapsedState);
    };

    const toggleLessonDescription = (lessonId: string, event: React.MouseEvent) => {
        event.preventDefault(); // Prevent link navigation when clicking chevron
        event.stopPropagation();
        setExpandedLessonId(prevId => prevId === lessonId ? null : lessonId);
    };


    return (
        <aside
            id="default-sidebar"
            className={`fixed top-0 left-0 z-40 h-screen transition-all ${collapsed ? 'w-20' : 'w-64'} sidebar-background`}
            aria-label="Sidebar"
        >
            <div className={`h-full px-1 py-4 dark:bg-gray-800 sidebar-background flex flex-col`}>
                <ul className="space-y-2 font-medium">
                    {/*Profil Option - Main Toggle */}
                    <li>
                        <button
                            type="button"
                            className={`w-full flex items-center p-4 rounded-lg dark:text-white hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)] group sidebar-foreground`}
                            onClick={toggleSidebarCollapse}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground shrink-0" viewBox="0 0 790.000000 790.000000"
                                preserveAspectRatio="xMidYMid meet">
                                <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
                                    fill="currentColor" stroke="none">
                                    <path d="M2900 7630 l0 -270 -265 0 -265 0 0 -270 0 -270 -270 0 -270 0 0 -1040 0 -1040 270 0 270 0 0 -270 0 -270 -265 0 -265 0 0 -270 0 -270 -270 0 -270 0 0 -785 0 -785 265 0 265 0 0 -270 0 -270 265 0 265 0 0 -775 0 -775 1580 0 1580 0 0 775 0 775 265 0 265 0 0 270 0 270 265 0 265 0 0 785 0 785 -270 0 -270 0 0 270 0 270 -265 0 -265 0 0 270 0 270 270 0 270 0 0 1040 0 1040 -270 0 -270 0 0 270 0 270 -265 0 -265 0 0 270 0 270 -1040 0 -1040 0 0 -270z m2080 -540 l0 -270 265 0 265 0 0 -1040 0 -1040 -265 0 -265 0 0 -270 0 -270 265 0 265 0 0 -270 0 -270 265 0 265 0 0 -785 0 -785 -260 0 -260 0 0 265 0 265 -270 0 -270 0 0 -1040 0 -1040 -260 0 -260 0 0 525 0 525 -525 0 -525 0 0 -525 0 -525 -255 0 -255 0 0 1040 0 1040 -270 0 -270 0 0 -265 0 -265 -260 0 -260 0 0 785 0 785 265 0 265 0 0 270 0 270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 1040 0 1040 265 0 265 0 0 270 0 270 1040 0 1040 0 0 -270z"/>
                                    <path d="M2900 5510 l0 -270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 -270z" />
                                    <path d="M4450 5510 l0 -270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 -270z" />
                                </g>
                            </svg>
                            <span className={cn("ms-3 text-foreground whitespace-nowrap", collapsed ? 'hidden' : '')}>Profil</span>
                        </button>
                    </li>
                </ul>

                {/* Lessons Section - Shown only if sidebar is not collapsed */}
                {!collapsed && (
                    <div className="mt-4 pt-4 border-t border-[var(--sidebar-border)]">
                        {isLoadingLessons && (
                            <div className={`flex items-center p-4 rounded-lg text-foreground`}>
                                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                                <span className="ms-3">Loading lessons...</span>
                            </div>
                        )}
                        {!isLoadingLessons && lessons.length > 0 && (
                            <ul className="space-y-1 font-medium">
                                {lessons.map((lesson) => (
                                    <li key={lesson.id}>
                                        <Link href={`/lesson/${lesson.id}`} passHref legacyBehavior>
                                            <a className={`flex flex-col p-3 rounded-lg dark:text-white hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)] group sidebar-foreground`}>
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center">
                                                        <BookOpen className="h-5 w-5 text-foreground shrink-0" />
                                                        <span className="ms-3 text-sm whitespace-normal break-words flex-1">{lesson.title}</span>
                                                    </div>
                                                    {lesson.description && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => toggleLessonDescription(lesson.id, e)}
                                                            className="p-1 -mr-1 hover:bg-opacity-50 rounded"
                                                            aria-label={expandedLessonId === lesson.id ? "Collapse description" : "Expand description"}
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
                        {!isLoadingLessons && lessons.length === 0 && (
                             <div className="p-4 text-sm text-foreground/70">
                                No lessons available.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
