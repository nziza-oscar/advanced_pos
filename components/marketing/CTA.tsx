import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'

const CTA = () => {
  return (
      <section className="py-10 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl bg-primary p-12 text-primary-foreground">
          <h3 className="text-2xl font-bold sm:text-3xl">Ready to transform your business?</h3>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Join thousands of satisfied businesses using our modern POS system.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-6 bg-white text-primary hover:bg-gray-100">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
  )
}

export default CTA