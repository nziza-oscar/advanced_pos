import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { userService } from '@/lib/api/services';
import { useUIStore } from '@/lib/store/ui-store';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { addNotification } = useUIStore();

  // Check if user is logged in
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await userService.getCurrentUser();
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (emailOrUsername: string, password: string) => {
    try {
      const response = await userService.login({ 
        username: emailOrUsername, 
        password 
      });
      
      if (response.success) {
        setUser(response.data?.user || null);
        setIsAuthenticated(true);
        
        addNotification('success', 'Login Successful', 'Welcome back!');
        toast.success('Logged in successfully');
        
        // Redirect based on role
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        
        return { success: true };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      addNotification('error', 'Login Failed', error.message);
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  }, [addNotification, router]);

  // Signup
  const signup = useCallback(async (userData: {
    email: string;
    username: string;
    password: string;
    full_name: string;
    role?: string;
  }) => {
    try {
      const response = await userService.signup(userData);
      
      if (response.success) {
        setUser(response.data?.user || null);
        setIsAuthenticated(true);
        
        addNotification('success', 'Registration Successful', 'Account created successfully');
        toast.success('Account created successfully');
        
        // Auto-login after signup
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        
        return { success: true };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      addNotification('error', 'Registration Failed', error.message);
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  }, [addNotification, router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await userService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      addNotification('info', 'Logged Out', 'You have been logged out');
      toast.info('Logged out successfully');
      
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local state even if API fails
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [addNotification, router]);

  // Check if user has required role
  const hasRole = useCallback((requiredRole: string | string[]) => {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  }, [user]);

  // Protected route check
  const requireAuth = useCallback((requiredRole?: string | string[]) => {
    if (isLoading) return true; // Still checking
    
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/dashboard');
      toast.error('Insufficient permissions');
      return false;
    }
    
    return true;
  }, [isAuthenticated, isLoading, hasRole, router]);

  // Check auth on initial load and route changes
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for route changes to check auth
  useEffect(() => {
    if (pathname && !isLoading) {
      // Don't require auth for login/signup pages
      const publicPaths = ['/login', '/signup', '/forgot-password'];
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
      
      if (!isPublicPath && !isAuthenticated) {
        router.push('/login');
      }
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    checkAuth,
    hasRole,
    requireAuth
  };
}