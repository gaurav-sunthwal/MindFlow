"use client";

import React from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Moon, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  Camera,
  Mail,
  Smartphone,
  Lock
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import { useTasks } from '@/context/TaskContext';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const { tasks } = useTasks();
  const { events } = useEvents();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const completedTasks = tasks.filter(t => t.completed).length;
  const displayName = user?.user_metadata?.full_name || 'MindFlow User';
  const email = user?.email || 'No email provided';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { data, error: uploadError } = await supabase.storage
        .from('profile-pic')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pic')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      // ALSO update the database profiles table via API
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });
      
      // The auth context should update automatically via onAuthStateChange
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      alert(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(true); // Wait, should be false
      setIsUploading(false);
    }
  };

  const SettingItem = ({ icon: Icon, label, description, rightElement }: any) => (
    <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all cursor-pointer group">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-on-surface group-hover:text-white transition-colors">
          <Icon className="w-5 h-5 text-on-surface-variant group-hover:text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-on-surface">{label}</h4>
          <p className="text-sm text-on-surface-variant opacity-60 mt-0.5">{description}</p>
        </div>
      </div>
      {rightElement || <ChevronRight className="w-5 h-5 text-outline-variant" />}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="px-12 pb-16 max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-on-surface mb-2">Profile</h1>
          <p className="text-on-surface-variant opacity-60">Manage your identity and cognitive preferences.</p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: User Card & Info */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <Card className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gray-100 rounded-[40px] flex items-center justify-center overflow-hidden border-4 border-white shadow-level1">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  ) : user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-on-surface-variant opacity-20" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-1 right-1 w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-on-surface">{displayName}</h2>
              <p className="text-sm font-medium text-on-surface-variant opacity-50 mb-8">{email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-2xl font-bold text-on-surface">{completedTasks}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Tasks Done</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-2xl font-bold text-on-surface">{events.length}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Events</p>
                </div>
              </div>
            </Card>

            <div className="p-8 bg-on-surface rounded-[40px] text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold tracking-widest uppercase">Security Status</span>
              </div>
              <p className="text-sm text-blue-100/40 leading-relaxed mb-6">Your account is secured with 256-bit encryption. Multi-factor authentication is active.</p>
              <button className="w-full py-3 bg-white/10 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white/20 transition-all">
                Security Audit
              </button>
            </div>
          </div>

          {/* Right Column: Settings & Preferences */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <section className="bg-white border border-gray-50 rounded-[40px] overflow-hidden shadow-level1">
              <div className="p-8 border-b border-gray-50">
                <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50">Personal Details</h3>
              </div>
              <div className="divide-y divide-gray-50">
                <SettingItem 
                  icon={Mail} 
                  label="Email Address" 
                  description={email} 
                />
                <SettingItem 
                  icon={Smartphone} 
                  label="Phone Number" 
                  description={user?.phone || "Not linked"} 
                />
                <SettingItem 
                  icon={Lock} 
                  label="Password" 
                  description="Securely stored" 
                />
              </div>
            </section>

            <section className="bg-white border border-gray-50 rounded-[40px] overflow-hidden shadow-level1">
              <div className="p-8 border-b border-gray-50">
                <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50">Application Settings</h3>
              </div>
              <div className="divide-y divide-gray-50">
                <SettingItem 
                  icon={Bell} 
                  label="Notifications" 
                  description="Managed focused alerts and session reminders" 
                  rightElement={
                    <div className="w-12 h-6 bg-secondary rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  }
                />
                <SettingItem 
                  icon={Moon} 
                  label="Dark Mode" 
                  description="Calm your visual cognitive load" 
                  rightElement={
                    <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  }
                />
                <SettingItem 
                  icon={CreditCard} 
                  label="Subscription" 
                  description="You are currently on the Pro Plan" 
                />
              </div>
            </section>

            <button 
              onClick={handleSignOut}
              className="w-full p-6 flex items-center justify-center gap-3 text-red-500 font-bold tracking-widest uppercase hover:bg-red-50 rounded-[32px] transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out of MindFlow
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
