import { Home, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            id: 'dashboard',
            label: 'Beranda',
            icon: Home,
            path: '/dashboard',
        },
        {
            id: 'leaderboard',
            label: 'Peringkat',
            icon: Trophy,
            path: '/leaderboard',
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border animate-fade-in-up">
            <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-colors duration-300",
                                isActive ? "bg-primary/10" : "bg-transparent"
                            )}>
                                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                            </div>
                            <span className={cn("text-[10px] font-medium transition-all duration-300", isActive ? "opacity-100" : "opacity-70")}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
