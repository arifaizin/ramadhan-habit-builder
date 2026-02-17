import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Globe, ChevronRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    display_name: string;
    total_score: number;
    is_me: boolean;
}

export default function Leaderboard() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'global' | 'community'>('global');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchLeaderboard();
    }, [user, activeTab, navigate]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const communityParam = activeTab === 'community' ? user?.communityCode : null;

            const { data, error } = await supabase.rpc('get_leaderboard', {
                community_code_param: communityParam
            });

            if (error) throw error;
            setEntries(data || []);
        } catch (error: any) {
            console.error('Error fetching leaderboard:', error);
            toast.error('Gagal memuat peringkat');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background geometric-pattern pb-24">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground">Papan Peringkat</h1>
                            <p className="text-xs text-muted-foreground">Fokus pada proses, bukan hasil</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
                {/* Tabs */}
                <div className="flex p-1 bg-muted rounded-xl gap-1">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'global' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Globe className="w-4 h-4" />
                        Global
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'community' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Komunitas
                    </button>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
                        ))
                    ) : entries.length > 0 ? (
                        entries.map((entry) => (
                            <div
                                key={entry.user_id}
                                className={cn(
                                    "card-elevated flex items-center p-3 transition-all duration-300",
                                    entry.is_me ? "ring-2 ring-primary border-transparent bg-primary/5" : ""
                                )}
                            >
                                <div className="w-10 flex items-center justify-center">
                                    <span className={cn(
                                        "font-bold text-sm",
                                        entry.rank === 1 ? "text-yellow-500 text-lg" :
                                            entry.rank === 2 ? "text-slate-400 text-base" :
                                                entry.rank === 3 ? "text-amber-600 text-base" : "text-muted-foreground"
                                    )}>
                                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                    </span>
                                </div>

                                <div className="flex-1 ml-3">
                                    <div className="flex items-center gap-2">
                                        <p className={cn("font-semibold text-sm", entry.is_me ? "text-primary" : "text-foreground")}>
                                            {entry.display_name}
                                        </p>
                                        {entry.is_me && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">SAYA</span>}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-sm text-foreground">{entry.total_score.toLocaleString()}</p>
                                    <p className="text-[10px] text-muted-foreground">pts</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground">Belum ada data peringkat</p>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground text-center">
                        Papan peringkat ini diupdate secara realtime. Nama pengguna lain disamarkan untuk menjaga keikhlasan amal.
                    </p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
