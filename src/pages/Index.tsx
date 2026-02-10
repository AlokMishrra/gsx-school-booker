import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { Building2, Calendar, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Building2,
      title: 'Browse Schools',
      description: 'Explore a wide range of schools with available facilities and equipment for your needs.',
    },
    {
      icon: Calendar,
      title: 'Book Time Slots',
      description: 'Select your preferred date and hourly time slots that work best for your schedule.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Pay securely through Razorpay and receive instant booking confirmation.',
    },
  ];

  const benefits = [
    'Access to multiple schools and facilities',
    'Flexible hourly booking system',
    'Transparent per-item pricing',
    'Real-time availability checking',
    'Instant booking confirmation',
    'Dedicated support team',
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground/5" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl animate-fade-in">
              Book School Facilities with{' '}
              <span className="underline decoration-2 underline-offset-4">Ease</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl animate-slide-up">
              GSX connects colleges with schools offering facilities and equipment. 
              Browse, book, and pay — all in one seamless platform.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up">
              <Button asChild size="lg">
                <Link to="/schools">
                  Browse Schools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register">Register Your College</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
                  <feature.icon className="h-6 w-6 text-background" />
                </div>
                <div className="absolute right-4 top-4 text-4xl font-bold text-muted-foreground/20">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">
                Why Choose <span className="font-black">GSX</span>?
              </h2>
              <p className="mb-8 text-muted-foreground">
                We make it simple for colleges to find and book the facilities they need. 
                Our platform offers transparency, flexibility, and a seamless booking experience.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-foreground p-1">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                  <div className="text-center p-8">
                    <div className="text-6xl font-bold mb-2">100+</div>
                    <p className="text-muted-foreground">Schools Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-foreground p-12 text-center text-background">
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Book Your Next Session?
              </h2>
              <p className="mb-8 text-lg opacity-90">
                Join hundreds of colleges already using GSX to book school facilities.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link to="/register">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
