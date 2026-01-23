import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="w-full max-w-md flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <Logo className="mx-auto w-32 h-32" />
        </div>
        
        {children}

        <footer className="mt-8 text-center">
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
  );
}