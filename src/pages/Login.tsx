import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { DIVISIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Login() {
  const [name, setName] = useState('');
  const [division, setDivision] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && division) {
      login(name.trim(), division);
      navigate('/');
    }
  };

  const isValid = name.trim().length >= 2 && division;

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
              <Label htmlFor="division" className="text-sm font-medium">
                Divisi / Tim
              </Label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Pilih divisi Anda" />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((div) => (
                    <SelectItem key={div} value={div}>
                      {div}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
