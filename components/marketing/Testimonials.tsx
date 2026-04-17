// components/marketing/Testimonials.tsx
'use client';

import { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Kamanzi',
    role: 'Owner, Kigali Fashion Hub',
    content: 'This POS system transformed our retail operations. Inventory tracking is now effortless, and the daily reports help us make better business decisions. We increased sales by 40% in just 3 months!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    business: 'Retail Fashion',
    logo: '👗'
  },
  {
    id: 2,
    name: 'Jean Paul Niyomugabo',
    role: 'Manager, TechZone Rwanda',
    content: 'The multi-branch management feature is a game-changer. We can track inventory across all our stores in real-time. Support team is incredibly responsive and helpful.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    business: 'Electronics Retail',
    logo: '💻'
  },
  {
    id: 3,
    name: 'Marie Claire Uwase',
    role: 'Owner, FreshBites Restaurant',
    content: 'From table management to split bills, this POS handles everything. The offline mode saved us during internet outages. Best investment for our restaurant!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    business: 'Restaurant',
    logo: '🍽️'
  },
  {
    id: 4,
    name: 'David Mugisha',
    role: 'CEO, Mega Mart Ltd',
    content: 'We started with POS and now using accounting and inventory modules. The ERP features are robust and scalable. Perfect for growing businesses.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    business: 'Supermarket Chain',
    logo: '🏪'
  },
  {
    id: 5,
    name: 'Grace Uwineza',
    role: 'Owner, Beauty Haven Spa',
    content: 'Customer management and loyalty program helped us retain clients. The booking system and automated reminders saved hours of manual work.',
    rating: 4,
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    business: 'Salon & Spa',
    logo: '💅'
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play effect
  useState(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-primary text-primary" />
            Trusted by 500+ Businesses
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-4">
            What Our{' '}
            <span className="text-primary">Customers Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Join thousands of satisfied business owners who transformed their operations
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon Background */}
          <div className="absolute -top-6 -left-6 text-primary/10">
            <Quote className="h-24 w-24" />
          </div>
          
          <div className="relative bg-card rounded-3xl border border-border p-8 md:p-12 shadow-xl">
            {/* Rating Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < current.rating 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            {/* Testimonial Content */}
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-8 italic">
              "{current.content}"
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10">
                  <img 
                    src={current.image} 
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 text-2xl">
                  {current.logo}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-foreground">{current.name}</h4>
                <p className="text-sm text-muted-foreground">{current.role}</p>
                <p className="text-xs text-primary/70 mt-1">{current.business}</p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full border border-border hover:bg-primary/10 hover:border-primary/30 transition-all"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToTestimonial(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      idx === currentIndex 
                        ? "w-8 bg-primary" 
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full border border-border hover:bg-primary/10 hover:border-primary/30 transition-all"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
          <StatCard number="500+" label="Happy Customers" />
          <StatCard number="98%" label="Satisfaction Rate" />
          <StatCard number="24/7" label="Customer Support" />
          <StatCard number="50K+" label="Transactions/Day" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-card border border-border">
      <div className="text-3xl font-bold text-primary mb-2">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}