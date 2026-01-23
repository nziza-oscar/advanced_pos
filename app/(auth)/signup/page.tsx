'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';

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
        // Auto login after signup
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="p-8 shadow-lg border-0">
      

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username *
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-medium">
              Password *
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
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 h-11 text-base" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </span>
            )}
          </Button>

         
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </Card>
  );
}