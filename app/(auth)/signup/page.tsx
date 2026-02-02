'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ShieldCheck, Mail, User } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Account created successfully!');
        const loginResponse = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const loginData = await loginResponse.json();
        if (loginData.success) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6">
      <div className="w-full max-w-[550px] space-y-8">
        {/* Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-white rounded-[2rem] shadow-sm flex items-center justify-center border border-blue-50 mb-2">
            <Logo className="h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-400 font-medium text-sm">Join our POS system and start managing today.</p>
        </div>

        <Card className="p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_-20px_rgba(59,130,246,0.1)] border-0 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="h-12 pl-11 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="h-12 px-5 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 pl-11 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-bold uppercase text-blue-500 hover:text-blue-600 tracking-tighter"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 pl-11 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-100 transition-all active:scale-95 mt-4" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Get Started <UserPlus className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm font-medium text-slate-400">
          Already a member?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}