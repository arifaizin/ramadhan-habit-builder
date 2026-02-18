import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { Download, RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function PWAPrompt() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log("SW Registered: " + r);
        },
        onRegisterError(error) {
            console.log("SW registration error", error);
        },
    });

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    // Handle Update Notification
    useEffect(() => {
        if (needRefresh) {
            toast.custom((t) => (
                <div className="flex w-full max-w-md items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-elevated fade-in">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <img src="/pwa-icon.svg" className="h-10 w-10" alt="App Icon" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">Update Tersedia</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Versi terbaru siap digunakan untuk ibadah yang lebih baik.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <Button
                                size="sm"
                                className="btn-primary h-8 px-3 text-xs"
                                onClick={() => updateServiceWorker(true)}
                            >
                                Update Sekarang
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-xs text-muted-foreground hover:bg-secondary"
                                onClick={() => {
                                    setNeedRefresh(false);
                                    toast.dismiss(t);
                                }}
                            >
                                Nanti
                            </Button>
                        </div>
                    </div>
                </div>
            ), { duration: Infinity });
        }
    }, [needRefresh, updateServiceWorker, setNeedRefresh]);

    // Handle Install Prompt
    useEffect(() => {
        if (installPrompt) {
            const timer = setTimeout(() => {
                toast.custom((t) => (
                    <div className="flex w-full max-w-md items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-elevated fade-in">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <img src="/pwa-icon.svg" className="h-10 w-10" alt="App Icon" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-sm font-semibold text-foreground">Instal Aplikasi</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Akses Mutaba'ah lebih cepat & hemat kuota dengan fitur offline.
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <Button
                                    size="sm"
                                    className="btn-primary h-8 px-3 text-xs"
                                    onClick={async () => {
                                        if (installPrompt) {
                                            await installPrompt.prompt();
                                            const { outcome } = await installPrompt.userChoice;
                                            if (outcome === "accepted") {
                                                setInstallPrompt(null);
                                                toast.dismiss(t);
                                            }
                                        }
                                    }}
                                >
                                    Instal Sekarang
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs text-muted-foreground hover:bg-secondary"
                                    onClick={() => {
                                        setInstallPrompt(null);
                                        toast.dismiss(t);
                                    }}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    </div>
                ), { duration: 20000 });
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [installPrompt]);

    return null; // This component only handles logic and toasts
}
