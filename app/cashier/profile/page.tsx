'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  LogOut,
  TrendingUp,
  Clock,
  Wallet,
  UserCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function CashierProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const result = await res.json();
        // Adapted to your specific return structure: result.data.user
        if (result.success && result.data?.user) {
          setUser(result.data.user);
        }
      } catch (err) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      
      {/* 1. Header Information */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600">
              <UserCircle className="w-16 h-16" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-800">{user?.full_name}</h1>
                {user?.is_active ? (
                  <Badge className="bg-green-50 text-green-600 border-none px-3 py-1 rounded-lg">Active</Badge>
                ) : (
                  <Badge className="bg-red-50 text-red-600 border-none px-3 py-1 rounded-lg">Inactive</Badge>
                )}
              </div>
              <p className="text-slate-400 font-medium capitalize">
                {user?.role} • @{user?.username}
              </p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            className="rounded-2xl gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border-none h-12 px-6 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Form Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Account Identity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input defaultValue={user?.full_name} className="h-12 pl-11 bg-slate-50 border-none rounded-2xl" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Username</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={user?.username} disabled className="h-12 pl-11 bg-slate-100 border-none rounded-2xl cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input defaultValue={user?.email} className="h-12 pl-11 bg-slate-50 border-none rounded-2xl" />
              </div>
            </div>
          </div>

          <Button>
            Update Profile
          </Button>
        </div>

        {/* 3. Shift Metadata Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> System Logs
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Last Login</p>
                  <p className="text-sm font-bold text-slate-800">
                    {user?.last_login ? new Date(user.last_login).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-bold text-slate-800">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <p className="text-blue-400 text-[10px] font-black uppercase mb-2 tracking-widest">Security Tip</p>
            <p className="text-sm leading-relaxed text-slate-300">
              Your account is set to <b>{user?.role}</b> privileges. Contact your administrator if you believe your permissions are incorrect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}