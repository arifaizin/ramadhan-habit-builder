import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ChevronLeft, Save } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Profile() {
    const { user, updateProfile } = useUser();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [pseudonym, setPseudonym] = useState(user?.pseudonym || '');
    const [saving, setSaving] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await updateProfile({ name, pseudonym });
            if (error) throw new Error(error);
            toast.success('Profil berhasil diperbarui');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Gagal memperbarui profil');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background geometric-pattern pb-24">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="mr-1"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="font-bold text-foreground">Profil Saya</h1>
                            <p className="text-xs text-muted-foreground">Kelola informasi akun Anda</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
                <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
                    <div className="card-elevated p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Nama Asli</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nama lengkap Anda"
                                    className="pl-10"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Nama ini hanya terlihat oleh Anda sendiri.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pseudonym" className="text-sm font-medium">Nama Samaran (Pseudonym)</Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="pseudonym"
                                    value={pseudonym}
                                    onChange={(e) => setPseudonym(e.target.value)}
                                    placeholder="Contoh: Hamba Allah, Fulan, dsb."
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Nama ini akan ditampilkan di papan peringkat (leaderboard) untuk pengguna lain.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full btn-primary"
                                disabled={saving}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Privasi Leaderboard</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Jika Anda mengosongkan nama samaran, sistem akan otomatis menampilkan <strong>"Hamba Allah"</strong> di papan peringkat untuk menjaga privasi dan keikhlasan amal Anda.
                        </p>
                    </div>
                </form>
            </main>

            <BottomNav />
        </div>
    );
}
