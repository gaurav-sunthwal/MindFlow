"use client";

import React, { useState } from 'react';
import { Mail, Lock, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 font-geist">
      <div className="w-full max-w-lg">
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Welcome back</h1>
          <p className="text-on-surface-variant opacity-50 mt-2 text-center max-w-xs">
            Enter your credentials to access your cognitive workspace.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-[40px] shadow-level2 border border-gray-50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-14 pl-14 pr-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                  Password
                </label>
                <button type="button" className="text-[11px] font-bold text-primary tracking-widest uppercase hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-14 pr-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  required
                />
              </div>
            </div>

            <Button 
              title={isLoading ? "Signing in..." : "Sign In"} 
              variant="primary" 
              className="w-full h-14 text-lg" 
              type="submit"
              disabled={isLoading}
            />
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-10 text-sm font-medium text-on-surface-variant">
          New to MindFlow?{' '}
          <Link href="/register" className="text-on-surface font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
