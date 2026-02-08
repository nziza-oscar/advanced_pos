import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Barcode, LineChart, ShieldCheck, Check } from 'lucide-react';

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

  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Essential tools for micro-businesses.',
      features: ['50 Products', 'Daily Reports', 'Single User'],
      buttonText: 'Start Free',
      popular: false
    },
    {
      name: 'Growth',
      price: '25',
      description: 'Scale your retail operations effectively.',
      features: ['Unlimited Products', 'Advanced Analytics', '3 Staff Accounts', 'Low Stock Alerts'],
      buttonText: 'Get Started',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '99',
      description: 'Full-scale multi-location management.',
      features: ['Multi-Warehouse', 'API Access', '24/7 Priority Support', 'Custom Branding'],
      buttonText: 'Contact Us',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center p-6 text-center">
        <div className="mt-12 mb-10">
          <Logo className="w-16 h-16 mx-auto" />
        </div>

        <div className="max-w-4xl space-y-12">
          <header className="space-y-4">
            <h1 className="text-4xl font-bold uppercase tracking-tighter sm:text-6xl">
              The Professional Choice.
            </h1>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Precision tools for retail management.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8 border-y border-muted">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-3 text-center px-4">
                <div className="text-primary">{feature.icon}</div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground leading-relaxed">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          <section className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`p-6 border text-left flex flex-col transition-all ${
                    plan.popular ? 'border-primary ring-1 ring-primary' : 'border-muted'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="w-fit mb-4 rounded-none uppercase text-[9px] tracking-widest">
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="text-sm font-bold uppercase tracking-widest">{plan.name}</h3>
                  <div className="my-4 flex items-baseline">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-xs text-muted-foreground uppercase ml-1">/mo</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-6 min-h-[30px]">
                    {plan.description}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[10px] uppercase tracking-wide font-medium">
                        <Check size={12} className="text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className="w-full">
                    <Button 
                      variant={plan.popular ? 'default' : 'outline'} 
                      className="w-full rounded-none uppercase text-[10px] font-bold tracking-[0.1em]"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-4 pb-12">
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