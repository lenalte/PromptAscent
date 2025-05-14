import { useState } from "react";
import Image from "next/image";


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
            <div className={`h-full px-3 py-4 overflow-y-auto dark:bg-gray-800 sidebar-background`}>
                <ul className="space-y-2 font-medium">
                    {/*Profil Option*/}
                    <li>
                        <a
                            href="#"
                            className={`flex items-center p-4 rounded-lg dark:text-white hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)] group sidebar-foreground`}
                            onClick={toggleSidebar}
                        >
                            <Image
                                className="full"
                                src="./nobody_avatar.svg"
                                alt="Avatar"
                                width={30}
                                height={30}
                                style={{ width: "30px", height: "30px", marginRight: "10px", fill: "var(--sidebar-primary-foreground)" }}
                            />

                            <span className={`ms-3 ${collapsed ? 'hidden' : ''}`}>Profil</span>
                        </a>
                    </li>

                    {/*Leaderboard Option*/}
                    <li>
                        <a
                            href="#"
                            className={`flex items-center p-4 rounded-lg dark:text-white hover:bg-[var(--sidebar-accent)] dark:hover:bg-[--sidebar-accent)] group sidebar-foreground`}
                            onClick={toggleSidebar}
                        >
                            <Image
                                className="full"
                                src="./leaderboard.svg"
                                alt="Leaderboard"
                                width={25}
                                height={25}
                                style={{ width: "25px", height: "25px", marginRight: "10px", fill: "var(--sidebar-primary-foreground)" }}
                            />
                            <span className={`flex-1 ms-3 whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>Leaderboard</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
