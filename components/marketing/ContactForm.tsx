'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 bg-card border border-border rounded-[2.5rem] shadow-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">Message Sent!</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Thank you for reaching out. Our team will review your inquiry and get back to you within 24 hours.
        </p>
        <Button
          variant="outline"
          className="mt-8 rounded-2xl px-8 border-border hover:bg-muted"
          onClick={() => setSubmitted(false)}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-foreground/80 ml-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-foreground/80 ml-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-bold text-foreground/80 ml-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm"
              placeholder="+250 788 123 456"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="inquiryType" className="text-sm font-bold text-foreground/80 ml-1">
              Inquiry Type *
            </label>
            <select
              id="inquiryType"
              name="inquiryType"
              required
              value={formData.inquiryType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="general">General Inquiry</option>
              <option value="sales">Sales</option>
              <option value="support">Technical Support</option>
              <option value="partnership">Partnership</option>
              <option value="billing">Billing</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-bold text-foreground/80 ml-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm"
            placeholder="How can we help you?"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-bold text-foreground/80 ml-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm resize-none"
            placeholder="Tell us more about your inquiry..."
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Send Message
              <Send className="h-4 w-4" />
            </span>
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
          By submitting, you agree to our privacy policy.
        </p>
      </form>
    </div>
  );
}