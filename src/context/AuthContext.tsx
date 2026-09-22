// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUsers, mockCredentials } from '../mocks/users';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'smart_sched_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        // Verify the user still exists in mock data
        const stillExists = mockUsers.find((u) => u.id === parsed.id && u.isActive);
        if (stillExists) {
          setUser(stillExists);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate a short network delay for realistic UX
      await new Promise((r) => setTimeout(r, 400));

      const normalizedEmail = email.trim().toLowerCase();
      const expectedPassword = mockCredentials[normalizedEmail];

      if (!expectedPassword) {
        throw Object.assign(new Error('Account not found. Please check your email.'), {
          code: 'NOT_FOUND',
        });
      }

      if (expectedPassword !== password) {
        throw Object.assign(new Error('Invalid email or password. Please try again.'), {
          code: 'AUTHENTICATION_ERROR',
        });
      }

      const found = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!found) {
        throw Object.assign(new Error('Account not found.'), { code: 'NOT_FOUND' });
      }

      if (!found.isActive) {
        throw Object.assign(new Error('Your account is inactive. Please contact the administrator.'), {
          code: 'INACTIVE',
        });
      }

      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}