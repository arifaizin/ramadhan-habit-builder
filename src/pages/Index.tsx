import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

const Index = () => {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  // Loading state
  return (
    <div className="flex min-h-screen items-center justify-center bg-background geometric-pattern">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <span className="text-3xl animate-pulse">🌙</span>
        </div>
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
};

export default Index;
