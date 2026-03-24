import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Globe, 
  Shield, 
  Heart, 
  Target, 
  Lightbulb,
  TrendingUp,
  Award,
  Clock,
  Building2,
  Zap,
  Handshake,
  Rocket,
  CheckCircle,
  Headphones
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Us - Modern ERP & POS System',
  description: 'Learn about our mission to empower businesses with cutting-edge technology and comprehensive business management solutions.',
};

const values = [
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Customer First',
    description: 'We put our customers at the center of everything we do. Your success is our success.',
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    title: 'Innovation',
    description: 'Constantly pushing boundaries to bring you the latest technology and features.',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Trust & Security',
    description: 'Your data is protected with enterprise-grade security and compliance.',
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: 'Passion',
    description: 'We are passionate about helping businesses grow and succeed.',
  },
  {
    icon: <Handshake className="h-8 w-8" />,
    title: 'Integrity',
    description: 'Transparent pricing, honest communication, and ethical business practices.',
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Global Impact',
    description: 'Empowering businesses worldwide with accessible technology solutions.',
  },
];

const milestones = [
  {
    year: '2022',
    title: 'Company Founded',
    description: 'Started with a vision to revolutionize business management in Africa.',
    icon: <Rocket className="h-6 w-6" />,
  },
  {
    year: '2023',
    title: 'First 100 Customers',
    description: 'Reached 100 businesses trusting our platform for their operations.',
    icon: <Users className="h-6 w-6" />,
  },
  {
    year: '2023',
    title: 'Launched Mobile App',
    description: 'Extended our platform to mobile devices for on-the-go management.',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    year: '2024',
    title: 'Full ERP Suite',
    description: 'Released comprehensive ERP features including accounting and HR.',
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    year: '2024',
    title: '1,000+ Businesses',
    description: 'Serving over 1,000 businesses across multiple industries.',
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    year: '2025',
    title: 'Global Expansion',
    description: 'Expanding our reach to serve businesses across Africa and beyond.',
    icon: <Globe className="h-6 w-6" />,
  },
];

const stats = [
  { number: '10K+', label: 'Active Users', icon: <Users className="h-5 w-5" /> },
  { number: '2K+', label: 'Businesses', icon: <Building2 className="h-5 w-5" /> },
  { number: '98%', label: 'CSAT Score', icon: <Award className="h-5 w-5" /> },
  { number: '24/7', label: 'Support', icon: <Clock className="h-5 w-5" /> },
  { number: '99.9%', label: 'Uptime', icon: <Shield className="h-5 w-5" /> },
  { number: '50M+', label: 'Transactions', icon: <TrendingUp className="h-5 w-5" /> },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1">
              Our Story
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Empowering Businesses
              <span className="block text-primary">with Smart Technology</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              We're on a mission to transform how businesses operate by providing accessible, 
              powerful, and intuitive management solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-10 transition-colors hover:border-primary/30">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To democratize access to enterprise-grade business management tools, 
                empowering businesses of all sizes to operate efficiently, make data-driven 
                decisions, and achieve sustainable growth through innovative technology.
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-10 transition-colors hover:border-primary/30">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading business management platform in Africa and beyond, 
                transforming how businesses operate through innovative technology that drives 
                efficiency, growth, and success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-3 text-primary-foreground/70">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary-foreground">{stat.number}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, idx) => (
              <div key={idx} className="text-center p-8 rounded-3xl bg-card/30 border border-border hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 group">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-primary">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Why Businesses Choose Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              What sets our solution apart.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <CheckCircle className="h-6 w-6" />,
                title: 'Comprehensive Solution',
                description: 'All-in-one platform covering POS, ERP, Accounting, and more.',
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: 'Easy to Use',
                description: 'Intuitive interface designed for users of all skill levels.',
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security with 99.9% uptime guarantee.',
              },
              {
                icon: <Headphones className="h-6 w-6" />,
                title: '24/7 Support',
                description: 'Dedicated support team always ready to help.',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-8 bg-card/50 border border-border rounded-3xl">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-5">
                  <div className="text-primary">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of businesses already using our platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground hover:opacity-90">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-2xl border-border bg-background hover:bg-muted">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}