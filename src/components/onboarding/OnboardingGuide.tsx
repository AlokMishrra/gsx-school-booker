import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, MapPin, Calendar, CreditCard, X } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: 'Select Schools',
    description: 'Choose schools from different cities by selecting them from the list',
  },
  {
    icon: Calendar,
    title: 'Pick Date & Shift',
    description: 'Select your preferred date and shift (First Half or Second Half)',
  },
  {
    icon: CreditCard,
    title: 'Pay & Confirm',
    description: 'Review your selection, pay via UPI or Razorpay, and get instant confirmation',
  },
];

interface OnboardingGuideProps {
  onComplete: () => void;
}

export const OnboardingGuide = ({ onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="mx-4 w-full max-w-md animate-scale-in">
        <CardContent className="pt-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Welcome to <span className="gsx-gradient-text">GSX</span>
            </h2>
            <p className="text-muted-foreground">
              Let's show you how easy it is to book
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-6 gsx-gradient'
                    : index < currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Current Step */}
          <div className="text-center mb-8 animate-slide-up" key={currentStep}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gsx-gradient">
              {(() => {
                const StepIcon = steps[currentStep].icon;
                return <StepIcon className="h-8 w-8 text-primary-foreground" />;
              })()}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Step {currentStep + 1}: {steps[currentStep].title}
            </h3>
            <p className="text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Steps Overview */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  index === currentStep
                    ? 'bg-primary/10 border border-primary/20'
                    : index < currentStep
                    ? 'bg-muted/50'
                    : 'opacity-50'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs ${
                    index === currentStep ? 'border-primary text-primary' : 'border-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                )}
                <span className={index === currentStep ? 'font-medium' : ''}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleNext} className="flex-1 gsx-gradient">
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
