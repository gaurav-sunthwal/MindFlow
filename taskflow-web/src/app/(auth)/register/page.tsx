"use client";

import React, { useState } from 'react';
import { Mail, Lock, Zap, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Typically show a success message or redirect to a "check your email" page
      router.push('/login?message=Check your email to confirm your account');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 font-geist">
      <div className="w-full max-w-lg">
        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity mb-8 uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Create your account</h1>
          <p className="text-on-surface-variant opacity-50 mt-2 max-w-xs">
            Start your journey towards high-fidelity productivity.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-10 rounded-[40px] shadow-level2 border border-gray-50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-2xl border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-14 pl-14 pr-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  required
                />
              </div>
            </div>

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
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 ml-1">
                Choose Password
              </label>
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

            <div className="pt-4">
              <Button 
                title={isLoading ? "Creating account..." : "Create Account"} 
                variant="primary" 
                className="w-full h-14 text-lg shadow-lg" 
                type="submit"
                disabled={isLoading}
              />
            </div>
          </form>

          <p className="mt-8 text-[11px] text-on-surface-variant text-center opacity-40 leading-relaxed px-4">
            By creating an account, you agree to MindFlow's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-10 text-sm font-medium text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="text-on-surface font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
