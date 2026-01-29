'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className=" shadow-none border-0 bg-background/60 backdrop-blur-sm rounded-none">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tighter uppercase text-primary ">Welcome Back</h1>
        <div className="h-1 w-12 bg-primary mx-auto mt-2" />
        <p className="text-muted-foreground mt-4 text-sm">Sign in to your POS account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5  ">
        <div className="space-y-3">
          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="admin"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-12 bg-background rounded-none border-muted-foreground/20 focus-visible:ring-0 focus-visible:border-primary transition-all"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest">
              Password
            </Label>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase font-semibold"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-12 pr-10 bg-background rounded-none border-muted-foreground/20 focus-visible:ring-0 focus-visible:border-primary transition-all"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-sm font-bold uppercase tracking-widest rounded-none shadow-none" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin" />
              Processing
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Enter System
            </span>
          )}
        </Button>
      </form>

      <div className=" text-center border-t border-muted py-2">
        <p className="text-xs text-muted-foreground uppercase tracking-tight">
          New to the platform?{' '}
          <Link 
            href="/signup" 
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </Card>
  );
}