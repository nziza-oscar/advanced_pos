import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Image */}
      <div className="hidden lg:block relative bg-muted">
        <img
          src="/images/pos.jpg" 
          alt="Authentication background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-12">
          <div className="space-y-2">
            <Logo className="w-16 h-16 mb-4" />
            <h2 className="text-3xl font-bold tracking-tight">Streamline your business.</h2>
            <p className="text-muted-foreground text-lg">The all-in-one POS solution for modern commerce.</p>
          </div>
        </div>
      </div>

      {/* Right Side: Content */}
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-secondary/30">
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <div className="text-center mb-8 lg:hidden">
            <Logo className="mx-auto w-24 h-24" />
          </div>
          
          {children}

          <footer className="mt-1 text-center">
            <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              © {currentYear} POS System. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}