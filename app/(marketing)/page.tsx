// app/(marketing)/page.tsx
import { Hero } from '@/components/marketing/Hero';
import  Features  from '@/components/marketing/Features';
import  Pricing  from '@/components/marketing/Pricing';
import  CTA  from '@/components/marketing/CTA';
import  Testimonials from '@/components/marketing/Testimonials';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
    </>
  );
}