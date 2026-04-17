'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ShieldCheck, Mail, User, Building2, CreditCard } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

const plans = {
  starter: { name: 'Starter', price: 0, period: 'month', products: 50, users: 1 },
  professional: { name: 'Professional', price: 49000, period: 'month', products: 'Unlimited', users: 5 },
  business: { name: 'Business', price: 99000, period: 'month', products: 'Unlimited', users: 15 },
  enterprise: { name: 'Enterprise', price: 199000, period: 'month', products: 'Unlimited', users: 'Unlimited' },
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'starter';
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'account' | 'business'>('account');
  const [formData, setFormData] = useState({
    // Account info
    username: '',
    email: '',
    password: '',
    full_name: '',
    business_name: '',
    business_type: '',
    phone: '',
    country: 'Rwanda',
    plan: selectedPlan,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate account info
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setStep('business');
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
        }),
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
        if (loginData.success && loginData.data.tenant) {
          router.push(`/${loginData.data.tenant.slug}/dashboard`);
        } else {
          router.push('/login');
        }
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans] || plans.starter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[600px] space-y-8">
        {/* Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-blue-100 mb-2">
            <Logo className="h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {step === 'account' ? 'Create Account' : 'Tell Us About Your Business'}
          </h1>
          <p className="text-slate-500 text-sm">
            {step === 'account' 
              ? 'Start your 14-day free trial. No credit card required.'
              : 'Help us customize your experience'}
          </p>
          
          {/* Plan Badge */}
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1 rounded-full text-xs font-semibold">
            {currentPlan.name} Plan • {currentPlan.price === 0 ? 'Free' : `${currentPlan.price.toLocaleString()} FRW/mo`}
          </Badge>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step === 'account' ? 'bg-blue-600 w-6' : 'bg-blue-200'}`} />
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${step === 'business' ? 'bg-blue-600 w-6' : 'bg-blue-200'}`} />
        </div>

        <Card className="p-8 md:p-10 rounded-2xl shadow-xl border-0 bg-white">
          {step === 'account' ? (
            <form onSubmit={handleAccountSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-xs font-semibold text-slate-500">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-semibold text-slate-500">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="h-12 px-5 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-500">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-500">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <p className="text-xs text-slate-400">At least 6 characters</p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4" 
              >
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleBusinessSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="business_name" className="text-xs font-semibold text-slate-500">
                  Business Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="business_name"
                    name="business_name"
                    placeholder="Your Company Name"
                    value={formData.business_name}
                    onChange={handleChange}
                    required
                    className="h-12 pl-11 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="business_type" className="text-xs font-semibold text-slate-500">
                    Business Type
                  </Label>
                  <select
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-5 rounded-xl border border-slate-200 focus:border-blue-300 focus:ring-blue-100 bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="retail">Retail Store</option>
                    <option value="restaurant">Restaurant/Cafe</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="services">Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-500">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+250 788 123 456"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-12 px-5 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-xs font-semibold text-slate-500">
                  Country
                </Label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-12 px-5 rounded-xl border border-slate-200 focus:border-blue-300 focus:ring-blue-100 bg-white"
                >
                  <option value="Rwanda">Rwanda</option>
                  <option value="Kenya" disabled>Kenya</option>
                  <option value="Uganda" disabled>Uganda</option>
                  <option value="Tanzania" disabled>Tanzania</option>
                  <option value="Other" disabled>Other</option>
                </select>
              </div>

              {/* Plan Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Selected Plan</span>
                  <Badge className="bg-blue-100 text-blue-700">
                    {currentPlan.name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Products</span>
                  <span className="font-medium text-slate-700">{currentPlan.products}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-slate-500">Staff Accounts</span>
                  <span className="font-medium text-slate-700">{currentPlan.users}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">Price</span>
                  <span className="font-bold text-blue-600">
                    {currentPlan.price === 0 ? 'Free' : `${currentPlan.price.toLocaleString()} FRW/mo`}
                  </span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-2" 
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <UserPlus className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>

        {/* Trust Badges */}
        <div className="flex justify-center gap-6 text-xs text-slate-400">
          <span>✓ 14-day free trial</span>
          <span>✓ No credit card required</span>
          <span>✓ Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}