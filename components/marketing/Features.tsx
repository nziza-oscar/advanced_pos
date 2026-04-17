// components/marketing/Features.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Barcode, LineChart, ShieldCheck, 
  Package, Users, ShoppingCart, CreditCard,
  Bell, Truck, Gift, BarChart, Lock, Printer,
  Headphones, Play, FileText, Cloud, Smartphone
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast Checkout',
    description: 'Process transactions in seconds with optimized POS interface.',
    benefits: ['< 3 second checkout', 'One-click repeat purchases', 'Quick barcode search']
  },
  {
    icon: Barcode,
    title: 'Smart Barcoding',
    description: 'Automate stock intake and eliminate manual entry errors.',
    benefits: ['Scan any barcode', 'Generate custom barcodes', 'Bulk import/export']
  },
  {
    icon: LineChart,
    title: 'Advanced Analytics',
    description: 'Make data-driven decisions with comprehensive reports.',
    benefits: ['Real-time dashboards', 'Custom report builder', 'Export multiple formats']
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels in real-time with automatic alerts.',
    benefits: ['Real-time tracking', 'Low stock alerts', 'Supplier management']
  },
  {
    icon: ShieldCheck,
    title: 'Secure Auditing',
    description: 'Maintain transparent trail of every transaction.',
    benefits: ['Complete audit trail', 'User activity logs', 'Role-based access']
  },
  {
    icon: Users,
    title: 'Multi-User Support',
    description: 'Manage your team with role-based access controls.',
    benefits: ['Unlimited staff', 'Custom permissions', 'Performance tracking']
  }
];

const additionalFeatures = [
  { icon: ShoppingCart, name: 'Quick Sale Mode', desc: 'Process sales without customer details' },
  { icon: CreditCard, name: 'Split Payments', desc: 'Accept multiple payment methods' },
  { icon: Bell, name: 'Stock Alerts', desc: 'Get notified at reorder levels' },
  { icon: Truck, name: 'Stock Transfers', desc: 'Move stock between locations' },
  { icon: Gift, name: 'Loyalty Program', desc: 'Reward repeat customers' },
  { icon: BarChart, name: 'Profit Margins', desc: 'Track profitability by product' },
  { icon: Lock, name: 'PCI Compliance', desc: 'Secure payment processing' },
  { icon: Printer, name: 'Receipt Printing', desc: 'Print or email receipts' },
  { icon: Cloud, name: 'Cloud Sync', desc: 'Real-time device synchronization' },
  { icon: Smartphone, name: 'Mobile POS', desc: 'Take orders from anywhere' },
  { icon: Headphones, name: '24/7 Support', desc: 'Get help whenever you need it' },
  { icon: Play, name: 'Video Tutorials', desc: 'Learn at your own pace' }
];

export default function Features() {
  return (
    <div className="bg-background">
      {/* Header */}
      <section className="py-20 text-center">
        <Badge className="mb-6 bg-primary/10 text-primary">Platform Features</Badge>
        <h2 className="text-4xl font-bold sm:text-5xl">
          Everything you need to
          <span className="block text-primary">run your business</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Powerful features designed to manage sales, inventory, customers, and growth.
        </p>
      </section>

      {/* Main Features Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="rounded-2xl border bg-card p-8 transition-all hover:border-primary/20 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="mb-4 text-muted-foreground">{feature.description}</p>
              <ul className="space-y-2 text-sm">
                {feature.benefits.map((benefit, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="text-primary">✓</span> {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="mb-12 text-center text-3xl font-bold">Plus more powerful features</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {additionalFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-4 transition-all hover:bg-card">
                <feature.icon className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-semibold">{feature.name}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    
    </div>
  );
}