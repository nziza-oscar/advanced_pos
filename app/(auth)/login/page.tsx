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

  // Quick login for demo
  const handleDemoLogin = () => {
    setFormData({
      username: 'admin',
      password: 'admin123',
    });
  };

  return (
    <Card className="p-8 shadow-lg border-0">
        <div className="text-center mb-8 ">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your POS account</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
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
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-4 h-4" /> Hide
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Show
                </span>
              )}
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
              className="h-11 pr-10"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 text-base" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </span>
          )}
        </Button>

        
      </form>

      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </Card>
  );
}