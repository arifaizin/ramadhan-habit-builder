import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type TabMode = 'login' | 'register';

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialCommunityCode = searchParams.get('community') || searchParams.get('code') || '';
  const initialMode: TabMode = initialCommunityCode ? 'register' : 'login';

  const [mode, setMode] = useState<TabMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [communityCode, setCommunityCode] = useState(initialCommunityCode);
  const [loading, setLoading] = useState(false);
  const { login, register } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const { error } = await login(email.trim(), password);
      if (error) {
        toast.error(error);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await register(name.trim(), email.trim(), password, communityCode.trim());
      if (error) {
        toast.error(error);
      } else {
        toast.success('Registrasi berhasil! Selamat datang.');
        navigate('/');
      }
    }

    setLoading(false);
  };

  const isLoginValid = email.trim().includes('@') && password.length >= 1;
  const isRegisterValid = name.trim().length >= 2 && email.trim().includes('@') && password.length >= 1 && communityCode.trim().length >= 2;
  const isValid = mode === 'login' ? isLoginValid : isRegisterValid;

  return (
    <div className="min-h-screen bg-background geometric-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <span className="text-4xl">🌙</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Mutaba'ah Ramadhan
          </h1>
          <p className="text-muted-foreground">
            Habit Builder untuk kebiasaan baik
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 animate-fade-in">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'login'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'register'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Daftar
          </button>
        </div>

        {/* Form Card */}
        <div className="card-elevated p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  autoComplete="name"
                  maxLength={50}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                autoComplete="email"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="communityCode" className="text-sm font-medium">
                  Kode Komunitas
                </Label>
                <Input
                  id="communityCode"
                  type="text"
                  placeholder="Masukkan kode komunitas Anda"
                  value={communityCode}
                  onChange={(e) => setCommunityCode(e.target.value)}
                  className="input-field"
                  maxLength={30}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={!isValid || loading}
            >
              {loading
                ? 'Memproses...'
                : mode === 'login'
                  ? 'Masuk'
                  : 'Daftar & Mulai'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            {mode === 'login'
              ? 'Belum punya akun? Klik "Daftar" di atas.'
              : 'Fokus pada konsistensi dan kebiasaan baik, bukan kompetisi.'}
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Ramadhan 1447H / 2026
        </p>
      </div>
    </div>
  );
}
