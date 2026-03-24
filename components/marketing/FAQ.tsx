'use client';

import { useState } from 'react';
import { MessageCircle, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is a POS system?',
    answer: 'A POS (Point of Sale) system is a combination of hardware and software that allows businesses to process sales transactions, manage inventory, track customer data, and generate reports. Our cloud-based POS system helps you manage your entire business from anywhere, anytime.'
  },
  {
    category: 'General',
    question: 'Is your POS system cloud-based?',
    answer: 'Yes! Our POS system is fully cloud-based, meaning you can access your business data from any device with an internet connection. This allows you to manage multiple locations, check sales remotely, and get real-time updates on your business performance.'
  },
  {
    category: 'General',
    question: 'Do I need special hardware to use your POS?',
    answer: 'No, you can use any device with a web browser. However, we recommend using our compatible hardware including receipt printers, barcode scanners, cash drawers, and card readers for the best experience.'
  },
  {
    category: 'Pricing',
    question: 'Do you offer a free trial?',
    answer: 'Yes! We offer a 14-day free trial on all our plans. No credit card required. You\'ll have full access to all features to test and see if our POS system is right for your business.'
  },
  {
    category: 'Pricing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), and Mobile Money (MoMo). For annual plans, we also support bank transfers.'
  },
  {
    category: 'Pricing',
    question: 'Can I change my plan later?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate the cost for the remainder of your billing cycle.'
  },
  {
    category: 'Features',
    question: 'Can I use the POS offline?',
    answer: 'Yes! Our POS system includes an offline mode. If your internet connection goes down, you can continue processing sales offline, and they will automatically sync when your connection is restored.'
  },
  {
    category: 'Features',
    question: 'Can I manage multiple store locations?',
    answer: 'Yes, our Business and Enterprise plans support multi-location management. You can track inventory across different stores and view consolidated reports for all your locations.'
  },
  {
    category: 'Security',
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption (256-bit SSL) to protect your data. All transactions are PCI-DSS compliant, and we perform regular security audits to ensure your information stays safe.'
  },
  {
    category: 'Security',
    question: 'Who owns my business data?',
    answer: 'You own all your business data. We never share or sell your data to third parties. You can export your data at any time in various formats (CSV, Excel, PDF).'
  },
  {
    category: 'Support',
    question: 'What kind of support do you offer?',
    answer: 'We offer multiple support channels including email support, live chat, and phone support for priority customers. Our knowledge base has detailed documentation and video tutorials.'
  },
  {
    category: 'Implementation',
    question: 'How long does it take to set up?',
    answer: 'Most businesses can set up and start using our POS system within 30 minutes. Simply sign up, add your products, and you\'re ready to start selling!'
  }
];

export function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFaqs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Common <span className="text-primary">Questions</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about our POS and ERP solution, visible at a glance.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Static Grid - No Clicking Required */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="break-inside-avoid group rounded-3xl border border-border bg-card/40 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-1 bg-primary/10 p-1.5 rounded-lg">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {faq.question}
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {faq.answer}
            </p>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/50 bg-primary/5 px-2 py-1 rounded-md">
                {faq.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-20 p-8 rounded-[2.5rem] bg-gradient-to-b from-primary/5 to-transparent border border-primary/10 text-center">
        <h3 className="text-xl font-bold text-foreground">Still need help?</h3>
        <p className="mt-2 text-muted-foreground text-sm">
          Our support team is ready to help you with any specific queries.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="rounded-2xl gap-2 h-12 px-8 bg-primary hover:opacity-90 transition-opacity">
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Button>
          <Button variant="outline" className="rounded-2xl gap-2 h-12 px-8 border-border bg-card hover:bg-muted">
            <FileText className="h-4 w-4" />
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}