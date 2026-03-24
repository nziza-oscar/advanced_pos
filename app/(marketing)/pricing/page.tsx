import { PricingPlans } from '@/components/marketing/PricingPlans';
import { FAQ } from '@/components/marketing/FAQ';

export default function PricingPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Simple, <span className="text-primary">Transparent</span> Pricing
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the plan that's right for your business. No hidden fees, 
            just straightforward value designed to help you grow.
          </p>
        </div>
        
        {/* Decorative subtle background element */}
        <div className="relative">
          <div 
            className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" 
            aria-hidden="true" 
          />
          <PricingPlans />
        </div>

        <div className="mt-24 pt-24 border-t border-border/50">
          <FAQ />
        </div>
      </div>
    </div>
  );
}