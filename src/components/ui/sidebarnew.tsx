import { useState } from "react";


interface SidebarProps {
    onToggle: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
        onToggle(!collapsed); // Gib den Zustand der Sidebar nach außen weiter
    };

    return (
        <aside
            id="default-sidebar"
            className={`fixed top-0 left-0 z-40 h-screen transition-all ${collapsed ? 'w-20' : 'w-64'} sidebar-background`}
            /* style={{ backgroundColor: "red" }} */
            aria-label="Sidebar"
        >
            <div className={`h-full px-1 py-4 overflow-y-auto dark:bg-gray-800 sidebar-background`}>
                <ul className="space-y-2 font-medium">
                    {/*Profil Option*/}
                    <li>
                        <a
                            href="#"
                            className={`flex items-center p-4 rounded-lg dark:text-white hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)] group sidebar-foreground`}
                            onClick={toggleSidebar}
                        >
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-foreground" viewBox="0 0 790.000000 790.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
                                    fill="currentColor" stroke="none">
                                    <path d="M2900 7630 l0 -270 -265 0 -265 0 0 -270 0 -270 -270 0 -270 0 0
-1040 0 -1040 270 0 270 0 0 -270 0 -270 -265 0 -265 0 0 -270 0 -270 -270 0
-270 0 0 -785 0 -785 265 0 265 0 0 -270 0 -270 265 0 265 0 0 -775 0 -775
1580 0 1580 0 0 775 0 775 265 0 265 0 0 270 0 270 265 0 265 0 0 785 0 785
-270 0 -270 0 0 270 0 270 -265 0 -265 0 0 270 0 270 270 0 270 0 0 1040 0
1040 -270 0 -270 0 0 270 0 270 -265 0 -265 0 0 270 0 270 -1040 0 -1040 0 0
-270z m2080 -540 l0 -270 265 0 265 0 0 -1040 0 -1040 -265 0 -265 0 0 -270 0
-270 265 0 265 0 0 -270 0 -270 265 0 265 0 0 -785 0 -785 -260 0 -260 0 0
265 0 265 -270 0 -270 0 0 -1040 0 -1040 -260 0 -260 0 0 525 0 525 -525 0
-525 0 0 -525 0 -525 -255 0 -255 0 0 1040 0 1040 -270 0 -270 0 0 -265 0
-265 -260 0 -260 0 0 785 0 785 265 0 265 0 0 270 0 270 265 0 265 0 0 270 0
270 -265 0 -265 0 0 1040 0 1040 265 0 265 0 0 270 0 270 1040 0 1040 0 0
-270z"/>
                                    <path d="M2900 5510 l0 -270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 -270z" />
                                    <path d="M4450 5510 l0 -270 265 0 265 0 0 270 0 270 -265 0 -265 0 0 -270z" />
                                </g>
                            </svg>

                            <span className={`ms-3 ${collapsed ? 'hidden' : ''} text-foreground`}>Dein Name</span>
                        </a>
                    </li>

                    {/*Leaderboard Option*/}
                    <li>
                        <a
                            href="#"
                            className={`flex items-center p-4 rounded-lg dark:text-white hover:bg-[var(--sidebar-accent)] dark:hover:bg-[--sidebar-accent)] group sidebar-foreground`}
                            onClick={toggleSidebar}
                        >
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-foreground" viewBox="0 0 790.000000 790.000000"
                                preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,790.000000) scale(0.100000,-0.100000)"
                                    fill="currentColor" stroke="none">
                                    <path d="M1450 7240 l0 -310 -495 0 -495 0 0 -1045 0 -1045 230 0 230 0 0
-225 0 -225 265 0 265 0 0 -230 0 -230 223 -2 222 -3 3 -222 2 -223 240 0 240
0 0 -200 0 -200 255 0 255 0 0 -225 0 -225 215 0 215 0 0 -470 0 -470 -375 0
-375 0 0 -225 0 -225 -185 0 -185 0 0 -445 0 -445 1765 0 1765 0 0 445 0 445
-182 2 -183 3 -3 223 -2 222 -390 0 -390 0 0 470 0 470 215 0 215 0 0 215 0
215 255 0 255 0 0 210 0 210 260 0 260 0 0 225 0 225 205 0 205 0 0 230 0 230
265 0 265 0 0 225 0 225 230 0 230 0 0 1045 0 1045 -495 0 -495 0 0 310 0 310
-2500 0 -2500 0 0 -310z m4538 -1502 l-3 -1363 -102 -3 -103 -3 0 -219 0 -220
-167 -2 -168 -3 -3 -207 -2 -208 -215 0 -215 0 0 -215 0 -215 -1060 0 -1060 0
0 225 0 225 -200 0 -200 0 0 200 0 200 -185 0 -185 0 0 220 0 219 -102 3 -103
3 -3 1363 -2 1362 2040 0 2040 0 -2 -1362z m-4538 -78 l0 -820 -160 0 -160 0
0 220 0 219 -102 3 -103 3 -3 598 -2 597 265 0 265 0 0 -820z m5528 223 l-3
-598 -102 -3 -103 -3 0 -219 0 -220 -160 0 -160 0 0 820 0 820 265 0 265 0 -2
-597z m-2858 -3723 l0 -470 -170 0 -170 0 0 470 0 470 170 0 170 0 0 -470z
m920 -1140 l0 -220 -1075 0 -1075 0 0 220 0 220 1075 0 1075 0 0 -220z"/>
                                </g>
                            </svg>
                            <span className={`flex-1 ms-3 whitespace-nowrap ${collapsed ? 'hidden' : ''} text-foreground`}>Leaderboard</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
