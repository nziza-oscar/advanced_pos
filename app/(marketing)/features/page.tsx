import { Metadata } from 'next';
import { 
  Barcode, 
  LineChart, 
  ShieldCheck, 
  Zap, 
  Users, 
  Package,
  Smartphone,
  Cloud,
  Printer,
  CreditCard,
  Gift,
  BarChart,
  Bell,
  Globe,
  Database,
  ShoppingCart,
  Truck,
  FileText,
  RefreshCw,
  Lock,
  Headphones,
  Layers,
  Settings,
  Mail, 
  Play 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features - Modern POS System',
  description: 'Discover powerful features designed to help you manage sales, inventory, and customers efficiently.',
};

const mainFeatures = [
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Lightning Fast Checkout',
    description: 'Process transactions in seconds with our optimized POS interface. Reduce wait times and increase customer satisfaction.',
    benefits: ['< 3 second checkout time', 'One-click repeat purchases', 'Quick search by barcode/name']
  },
  {
    icon: <Barcode className="h-8 w-8" />,
    title: 'Smart Barcoding',
    description: 'Automate stock intake and eliminate manual entry errors with our advanced barcode scanning system.',
    benefits: ['Scan any barcode type', 'Generate custom barcodes', 'Bulk import/export']
  },
  {
    icon: <LineChart className="h-8 w-8" />,
    title: 'Advanced Analytics',
    description: 'Make data-driven decisions with comprehensive reports on sales, inventory, and customer behavior.',
    benefits: ['Real-time dashboards', 'Custom report builder', 'Export in multiple formats']
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: 'Secure Auditing',
    description: 'Maintain a transparent trail of every transaction with comprehensive audit logging and role-based access.',
    benefits: ['Complete audit trail', 'User activity logs', 'Role-based permissions']
  },
  {
    icon: <Package className="h-8 w-8" />,
    title: 'Inventory Management',
    description: 'Track stock levels in real-time and get automatic alerts when items run low.',
    benefits: ['Real-time stock tracking', 'Low stock alerts', 'Supplier management']
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Multi-User Support',
    description: 'Manage your team with role-based access controls for cashiers, managers, and admins.',
    benefits: ['Unlimited staff accounts', 'Custom permissions', 'Staff performance tracking']
  }
];

const features = [
  {
    category: 'Sales & Checkout',
    icon: <ShoppingCart className="h-6 w-6" />,
    features: [
      {
        name: 'Quick Sale Mode',
        description: 'Process sales without adding customer details for fast checkout.',
        icon: <Zap className="h-5 w-5" />
      },
      {
        name: 'Split Payments',
        description: 'Accept multiple payment methods for a single transaction.',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        name: 'Hold Orders',
        description: 'Pause and resume orders, perfect for busy periods.',
        icon: <RefreshCw className="h-5 w-5" />
      },
      {
        name: 'Order Notes',
        description: 'Add special instructions for kitchen or fulfillment.',
        icon: <FileText className="h-5 w-5" />
      }
    ]
  },
  {
    category: 'Inventory Management',
    icon: <Package className="h-6 w-6" />,
    features: [
      {
        name: 'Stock Alerts',
        description: 'Get notified when products reach reorder levels.',
        icon: <Bell className="h-5 w-5" />
      },
      {
        name: 'Bulk Import/Export',
        description: 'Quickly update inventory with CSV files.',
        icon: <Database className="h-5 w-5" />
      },
      {
        name: 'Stock Transfers',
        description: 'Move stock between multiple locations.',
        icon: <Truck className="h-5 w-5" />
      },
      {
        name: 'Low Stock Report',
        description: 'Identify products that need reordering.',
        icon: <BarChart className="h-5 w-5" />
      }
    ]
  },
  {
    category: 'Customer Management',
    icon: <Users className="h-6 w-6" />,
    features: [
      {
        name: 'Customer Profiles',
        description: 'Store customer details, purchase history, and preferences.',
        icon: <Users className="h-5 w-5" />
      },
      {
        name: 'Loyalty Program',
        description: 'Reward repeat customers with points and special offers.',
        icon: <Gift className="h-5 w-5" />
      },
      {
        name: 'Purchase History',
        description: 'Track what customers buy and when.',
        icon: <LineChart className="h-5 w-5" />
      },
      {
        name: 'Email Marketing',
        description: 'Send promotions and updates to your customers.',
        icon: <Mail className="h-5 w-5" />
      }
    ]
  },
  {
    category: 'Reporting & Analytics',
    icon: <BarChart className="h-6 w-6" />,
    features: [
      {
        name: 'Sales Reports',
        description: 'Track daily, weekly, and monthly sales trends.',
        icon: <LineChart className="h-5 w-5" />
      },
      {
        name: 'Profit Margins',
        description: 'Calculate profitability by product and category.',
        icon: <BarChart className="h-5 w-5" />
      },
      {
        name: 'Tax Reports',
        description: 'Simplify tax filing with detailed tax summaries.',
        icon: <FileText className="h-5 w-5" />
      },
      {
        name: 'Staff Performance',
        description: 'Monitor cashier productivity and sales metrics.',
        icon: <Users className="h-5 w-5" />
      }
    ]
  },
  {
    category: 'Payments & Security',
    icon: <Lock className="h-6 w-6" />,
    features: [
      {
        name: 'Multiple Payment Types',
        description: 'Accept cash, card, mobile money, and more.',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        name: 'PCI Compliance',
        description: 'Secure payment processing that meets industry standards.',
        icon: <ShieldCheck className="h-5 w-5" />
      },
      {
        name: 'Receipt Printing',
        description: 'Print or email receipts to customers.',
        icon: <Printer className="h-5 w-5" />
      },
      {
        name: 'Refund Management',
        description: 'Process returns and refunds seamlessly.',
        icon: <RefreshCw className="h-5 w-5" />
      }
    ]
  },
  // {
  //   category: 'Mobile & Cloud',
  //   icon: <Cloud className="h-6 w-6" />,
  //   features: [
  //     {
  //       name: 'Mobile POS',
  //       description: 'Take orders from anywhere with mobile devices.',
  //       icon: <Smartphone className="h-5 w-5" />
  //     },
  //     {
  //       name: 'Offline Mode',
  //       description: 'Continue selling even without internet connection.',
  //       icon: <Cloud className="h-5 w-5" />
  //     },
  //     {
  //       name: 'Cloud Sync',
  //       description: 'Real-time synchronization across all devices.',
  //       icon: <RefreshCw className="h-5 w-5" />
  //     },
  //     {
  //       name: 'Multi-Location',
  //       description: 'Manage multiple stores from one dashboard.',
  //       icon: <Globe className="h-5 w-5" />
  //     }
  //   ]
  // },
 
  {
    category: 'Support & Training',
    icon: <Headphones className="h-6 w-6" />,
    features: [
      {
        name: '24/7 Support',
        description: 'Get help whenever you need it.',
        icon: <Headphones className="h-5 w-5" />
      },
      {
        name: 'Video Tutorials',
        description: 'Learn at your own pace with our library.',
        icon: <Play className="h-5 w-5" />
      },
      {
        name: 'Onboarding Calls',
        description: 'Personalized setup assistance.',
        icon: <Users className="h-5 w-5" />
      },
      {
        name: 'Documentation',
        description: 'Detailed guides and API documentation.',
        icon: <FileText className="h-5 w-5" />
      }
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1">
              Platform Features
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-7xl">
              Everything you need to
              <span className="block text-primary">run your business</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Powerful features designed to help you manage sales, inventory, customers, and grow your business efficiently with a modern interface.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="rounded-2xl px-8 h-14 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 border-border font-bold hover:bg-muted transition-all">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground sm:text-5xl">
              Powerful features for modern businesses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to streamline operations and boost sales.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="group relative rounded-[2.5rem] border border-border bg-card p-10 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-2xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <ul className="mt-8 space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center text-sm font-medium text-foreground/80">
                      <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-[10px]">✓</span>
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features by Category */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground sm:text-5xl">
              Comprehensive feature set
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover all the tools you need to succeed in one platform.
            </p>
          </div>
          
          <div className="space-y-24">
            {features.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
                    {category.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">
                    {category.category}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.features.map((feature, i) => (
                    <div key={i} className="bg-card rounded-[1.5rem] p-8 border border-border hover:border-primary/20 hover:shadow-lg transition-all group">
                      <div className="text-primary mb-4 p-2 bg-primary/5 w-fit rounded-xl group-hover:bg-primary/10 transition-colors">
                        {feature.icon}
                      </div>
                      <h4 className="font-bold text-foreground mb-2">
                        {feature.name}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl rounded-[3rem] bg-primary p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-5xl">
              Ready to transform your business?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80 leading-relaxed">
              Join thousands of satisfied businesses using our modern POS system to grow their revenue.
            </p>
            <div className="mt-10">
              <Link href="/signup">
                <Button size="lg" className="rounded-2xl px-10 h-14 bg-background text-primary font-bold hover:bg-muted transition-all">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}