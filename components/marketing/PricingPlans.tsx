'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, Building2, Globe, ShoppingCart, 
  Briefcase, Zap, ChevronDown, ChevronUp,
  Mail, Users, BarChart3, Calculator, Truck, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 0,
    description: 'Essential tools for micro-businesses and startups.',
    tagline: 'Perfect for small shops and solo entrepreneurs',
    features: [
      '50 Products', 'Daily Sales Reports', 'Single User Access', 
      'Basic Inventory Management', 'Simple POS Interface', 
      'Cash & Mobile Money Payments', 'Daily Sales Summary', 
      'Basic Receipt Printing', 'Community Support'
    ],
    buttonText: 'Start Free',
    buttonLink: '/signup?plan=starter',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: 'Professional',
    monthlyPrice: 49000,
    description: 'Complete business management solution for growing businesses.',
    tagline: 'Everything you need to run a professional operation',
    features: [
      'Unlimited Products', '5 Staff Accounts', 'Full Inventory Management', 
      'Purchase Orders & Suppliers', 'Customer Management', 'Loyalty Program', 
      'Advanced Analytics & Reports', 'Profit & Loss Statements', 
      'Balance Sheet', 'Cash Flow Management', 'Tax Calculations & Reports', 
      'Low Stock SMS Alerts', 'Bulk Import/Export', 'Priority Email Support'
    ],
    buttonText: 'Get Started',
    buttonLink: '/signup?plan=professional',
    popular: true,
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    name: 'Business',
    monthlyPrice: 99000,
    description: 'Advanced ERP features for established businesses.',
    tagline: 'Scale your operations with comprehensive tools',
    features: [
      'Unlimited Products', '15 Staff Accounts', 'Multi-Branch Management', 
      'Advanced Inventory Control', 'Supplier Management', 'Multi-Warehouse Sync', 
      'Advanced Accounting', 'General Ledger', 'Accounts Payable/Receivable', 
      'Budgeting & Forecasting', 'Financial Ratios & KPIs', 
      'Fixed Assets Management', 'Payroll Integration', 'Expense Tracking', 
      'Advanced CRM', 'Email Marketing Integration', 'Custom API Access', 
      'Priority Phone Support'
    ],
    buttonText: 'Talk to Sales',
    buttonLink: '/contact',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 199000,
    description: 'Full-scale enterprise resource planning.',
    tagline: 'Complete ERP solution for large organizations',
    features: [
      'Unlimited Everything', 'Unlimited Staff Accounts', 'Multi-Company Management', 
      'Consolidated Financial Reports', 'Advanced Consolidation', 'Inter-Company Transactions', 
      'Multi-Currency Support', 'Global Operations', 'Custom Financial Reports', 
      'Audit Trail & Compliance', 'EBM V2 Integration', 'Tax Authority Compliance', 
      'Custom Workflows', 'Full API Access', 'Webhooks & Integrations', 
      'Dedicated Account Manager', '24/7 Priority Phone Support', 'SLA Guarantee', 
      'Custom Development', 'On-Premise Option Available'
    ],
    buttonText: 'Contact Sales',
    buttonLink: '/contact',
    icon: <Globe className="h-5 w-5" />,
    enterprise: true,
  },
];

export function PricingPlans() {
  const [expandedPlans, setExpandedPlans] = useState<string[]>([]);

  const toggleExpand = (name: string) => {
    setExpandedPlans(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-start">
        {plans.map((plan) => {
          const isExpanded = expandedPlans.includes(plan.name);
          const visibleFeatures = isExpanded ? plan.features : plan.features.slice(0, 5);

          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl transition-all duration-500",
                plan.popular
                  ? "bg-card shadow-2xl shadow-primary/15 border-2 border-primary lg:scale-105 z-10"
                  : "bg-card/40 backdrop-blur-sm shadow-sm border border-border"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      {plan.monthlyPrice === 0 ? '0' : new Intl.NumberFormat('en-RW').format(plan.monthlyPrice)}
                    </span>
                    <span className="text-sm font-bold text-foreground/70">FRW</span>
                    <span className="text-muted-foreground text-xs font-medium">/mo</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed h-10">
                    {plan.tagline}
                  </p>
                </div>

                <ul className="space-y-3 mb-4 overflow-hidden transition-all duration-300">
                  {visibleFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                      <Check className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0 stroke-[3]" />
                      <span className="text-xs text-foreground/80 leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.features.length > 5 && (
                  <button 
                    onClick={() => toggleExpand(plan.name)}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors mb-6"
                  >
                    {isExpanded ? (
                      <><ChevronUp className="h-3 w-3" /> Show Less</>
                    ) : (
                      <><ChevronDown className="h-3 w-3" /> Show all {plan.features.length} features</>
                    )}
                  </button>
                )}

                <Link href={plan.buttonLink} className="block w-full">
                  <Button
                    className={cn(
                      "w-full h-11 rounded-xl text-xs font-bold transition-all duration-300",
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30"
                        : "bg-secondary text-secondary-foreground hover:bg-accent border-none"
                    )}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Compliance Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-border/50">
        <FeatureInfo icon={<ShoppingCart />} title="EBM V2 Ready" desc="RRA Certified" />
        <FeatureInfo icon={<Calculator />} title="Accounting" desc="Full Ledger & P&L" />
        <FeatureInfo icon={<Layers />} title="MoMo Pay" desc="Mobile Payments" />
        <FeatureInfo icon={<Building2 />} title="Multi-Store" desc="Inventory Sync" />
      </div>
    </div>
  );
}

function FeatureInfo({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="p-3 bg-primary/10 rounded-2xl text-primary">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}