import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getUser, saveUser, logoutUser as logoutFromStorage } from '@/lib/storage';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (name: string, division: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user on mount
    const existingUser = getUser();
    setUser(existingUser);
    setIsLoading(false);
  }, []);

  const login = (name: string, division: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      division,
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);
    setUser(newUser);
  };

  const logout = () => {
    logoutFromStorage();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
