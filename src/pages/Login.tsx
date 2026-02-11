import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [communityCode, setCommunityCode] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && communityCode.trim()) {
      login(name.trim(), email.trim(), communityCode.trim());
      navigate('/');
    }
  };

  const isValid = name.trim().length >= 2 && email.trim().includes('@') && communityCode.trim().length >= 2;

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

        {/* Login Card */}
        <div className="card-elevated p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={!isValid}
            >
              Mulai Perjalanan
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Fokus pada konsistensi dan kebiasaan baik, bukan kompetisi.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Ramadhan 1446H / 2025
        </p>
      </div>
    </div>
  );
}
