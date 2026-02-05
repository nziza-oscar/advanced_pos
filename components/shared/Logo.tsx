import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image src="/doc_logo.png" alt="logo" width={96} height={96} className='object-cover' loading='eager'/>
      
    </div>
  );
}