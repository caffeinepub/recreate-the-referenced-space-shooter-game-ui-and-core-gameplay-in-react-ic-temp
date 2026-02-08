import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className={`transition-all ${
        isAuthenticated
          ? 'border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10'
          : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:scale-105'
      } disabled:opacity-50`}
    >
      {isAuthenticated ? (
        <LogOut className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
      ) : (
        <LogIn className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
      )}
      <span className="text-xs sm:text-sm">{text}</span>
    </Button>
  );
}
