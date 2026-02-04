import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Barcode, LineChart, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Barcode size={18} />,
      text: "Smart Barcoding: Automate stock intake and eliminate manual entry errors."
    },
    {
      icon: <LineChart size={18} />,
      text: "Business Intelligence: Generate deep-dive reports to track profit margins."
    },
    {
      icon: <ShieldCheck size={18} />,
      text: "Secure Auditing: Maintain a transparent trail of every transaction."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-10">
          <Logo className="w-16 h-16 mx-auto" />
        </div>

        <div className="max-w-xl space-y-8">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold uppercase tracking-tighter">
              The Professional Choice.
            </h1>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Precision tools for retail management.
            </p>
          </header>

          <div className="grid gap-4 py-8 border-y border-muted">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 text-left px-4">
                <div className="text-primary">{feature.icon}</div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link href="/login">
              <Button className="rounded-none h-14 px-12 text-xs font-bold uppercase tracking-[0.2em]">
                Enter System
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-10 border-t border-muted">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Precision POS © 2026
          </p>
          <div className="flex gap-8">
            <Link 
              href="/docs" 
              className="text-[10px] text-muted-foreground hover:text-primary uppercase tracking-[0.2em] font-bold underline underline-offset-4"
            >
              Documentation
            </Link>
            <Link href="/terms" className="text-[10px] text-muted-foreground hover:text-primary uppercase tracking-[0.2em]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;