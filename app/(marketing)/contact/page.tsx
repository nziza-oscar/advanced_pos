import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContactForm } from '@/components/marketing/ContactForm';
import { 
  Mail, 
  Phone, 
  Clock, 
  ChevronRight,
  Calendar,
  FileText,
  HelpCircle,
  Twitter,
  Linkedin,
  Facebook,
  Youtube
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - ERP & POS System',
  description: 'Get in touch with our sales and support team. We\'re here to help you with any questions about our business management solutions.',
};

const contactMethods = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Email Us',
    description: 'Get a response within 24 hours',
    details: [
      { label: 'Sales', value: 'sales@pos.com', href: 'mailto:sales@pos.com' },
      { label: 'Support', value: 'support@pos.com', href: 'mailto:support@pos.com' },
      { label: 'Partnerships', value: 'partners@pos.com', href: 'mailto:partners@pos.com' },
    ],
    bgColor: 'bg-primary/5',
    iconColor: 'text-primary',
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: 'Call Us',
    description: 'Speak with a representative',
    details: [
      { label: 'Sales', value: '+250 788 123 456', href: 'tel:+250788123456' },
      { label: 'Support', value: '+250 788 123 457', href: 'tel:+250788123457' },
      { label: 'Emergency', value: '+250 788 123 458', href: 'tel:+250788123458' },
    ],
    bgColor: 'bg-primary/5',
    iconColor: 'text-primary',
  },
];

const supportOptions = [
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: 'Knowledge Base',
    description: 'Browse articles and tutorials',
    href: '/docs',
    bgColor: 'bg-card',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Documentation',
    description: 'Detailed API and user guides',
    href: '/docs/api',
    bgColor: 'bg-card',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: 'Schedule Demo',
    description: 'Book a personalized demo',
    href: '/demo',
    bgColor: 'bg-card',
  },
];

const faqs = [
  {
    question: 'How quickly can I get started?',
    answer: 'You can sign up and start using our platform in under 5 minutes. Our team is available to help with onboarding if needed.',
  },
  {
    question: 'Do you offer training for my staff?',
    answer: 'Yes! We provide onboarding calls, video tutorials, and documentation. Enterprise plans include personalized training sessions.',
  },
  {
    question: 'What support channels are available?',
    answer: 'We offer email support, phone support, and a comprehensive knowledge base. Enterprise customers get 24/7 priority phone support.',
  },
  {
    question: 'Can I migrate from another POS system?',
    answer: 'Absolutely! Our team can help you migrate your data from other systems. Contact us to discuss your migration needs.',
  },
];

export default function ContactPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1">
              Get in Touch
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Let&apos;s Talk About Your
              <span className="block text-primary">Business Needs</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Whether you have questions about our platform, need support, or want to discuss partnership opportunities, we&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Primary Methods */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            {/* Contact Details Column */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              {contactMethods.map((method, idx) => (
                <div key={idx} className={`rounded-[2rem] ${method.bgColor} p-8 border border-primary/10`}>
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-background mb-4 ${method.iconColor} shadow-sm`}>
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{method.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{method.description}</p>
                  <div className="space-y-3">
                    {method.details.map((detail, i) => (
                      <div key={i}>
                        {detail.href ? (
                          <a 
                            href={detail.href}
                            className="flex items-center justify-between text-sm hover:text-primary transition-colors group"
                          >
                            <span className="text-muted-foreground group-hover:text-primary/70">{detail.label}:</span>
                            <span className="font-bold text-foreground group-hover:text-primary">{detail.value}</span>
                          </a>
                        ) : (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{detail.label}:</span>
                            <span className="font-bold text-foreground">{detail.value}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Self-Service Support
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers quickly with our comprehensive resources.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {supportOptions.map((option, idx) => (
              <Link key={idx} href={option.href}>
                <div className="bg-card border border-border rounded-[2rem] p-8 text-center hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{option.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-background border-t border-border">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Quick answers to common questions about our support.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card border border-border rounded-2xl p-6 transition-colors hover:border-primary/20">
                <h3 className="font-bold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/faq">
              <Button variant="outline" className="gap-2 rounded-xl h-12 px-6 border-border hover:bg-muted">
                View All FAQs
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-4xl px-6">
          <div className="bg-primary rounded-[2.5rem] p-10 md:p-14 text-primary-foreground shadow-2xl shadow-primary/20">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Business Hours</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60 mb-4">Support Team</p>
                <div className="space-y-2 text-primary-foreground/90 font-medium">
                  <p className="flex justify-between border-b border-white/10 pb-2"><span>Mon - Fri:</span> <span>8:00 AM - 8:00 PM</span></p>
                  <p className="flex justify-between border-b border-white/10 pb-2"><span>Saturday:</span> <span>9:00 AM - 5:00 PM</span></p>
                  <p className="flex justify-between text-white/60"><span>Sunday:</span> <span>Emergency Only</span></p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60 mb-4">Sales Team</p>
                <div className="space-y-2 text-primary-foreground/90 font-medium">
                  <p className="flex justify-between border-b border-white/10 pb-2"><span>Mon - Fri:</span> <span>9:00 AM - 6:00 PM</span></p>
                  <p className="flex justify-between border-b border-white/10 pb-2"><span>Saturday:</span> <span>10:00 AM - 2:00 PM</span></p>
                  <p className="flex justify-between text-white/60"><span>Sunday:</span> <span>Closed</span></p>
                </div>
              </div>
            </div>
            <p className="mt-10 text-xs font-bold text-primary-foreground/50 uppercase tracking-widest text-center">
              * All times are in CAT (Central Africa Time)
            </p>
          </div>
        </div>
      </section>

      {/* Social Media Links */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Connect With Us</h2>
          <p className="text-muted-foreground mb-10">Follow us on social media for updates and tips.</p>
          <div className="flex justify-center gap-6">
            {[
              { icon: <Twitter className="h-5 w-5" />, href: '#', label: 'Twitter' },
              { icon: <Linkedin className="h-5 w-5" />, href: '#', label: 'LinkedIn' },
              { icon: <Facebook className="h-5 w-5" />, href: '#', label: 'Facebook' },
              { icon: <Youtube className="h-5 w-5" />, href: '#', label: 'YouTube' },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-primary/10 transition-all hover:-translate-y-1 group"
                aria-label={social.label}
              >
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  {social.icon}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}