import { ShoppingBag } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-blue-600 p-2 rounded-lg">
        <ShoppingBag className="w-6 h-6 text-white" />
      </div>
      <div className="hidden sm:block">
        <span className="text-xl font-bold text-gray-900">POS</span>
        <span className="text-xl font-bold text-blue-600">System</span>
      </div>
    </div>
  );
}