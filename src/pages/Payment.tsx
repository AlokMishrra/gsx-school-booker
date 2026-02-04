import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, CreditCard, ArrowLeft, Smartphone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolBooking {
  schoolId: string;
  schoolName: string;
  location: string;
  pricePerHour: number;
  subtotal: number;
}

interface BookingDetails {
  date: string;
  startTime: string;
  endTime: string;
  shift: string;
  hours: number;
  totalAmount: number;
  schools: SchoolBooking[];
}

const paymentMethods = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Pay using any UPI app',
    icon: Smartphone,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Cards, NetBanking, Wallets',
    icon: CreditCard,
  },
];

const Payment = () => {
  const navigate = useNavigate();
  const { user, collegeId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingDetails');
    if (stored) {
      setBookingDetails(JSON.parse(stored));
    } else {
      navigate('/schools');
    }
  }, [navigate]);

  if (!user || !collegeId) {
    navigate('/login');
    return null;
  }

  if (!bookingDetails) {
    return null;
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          college_id: collegeId,
          booking_date: bookingDetails.date,
          start_time: bookingDetails.startTime,
          end_time: bookingDetails.endTime,
          total_amount: bookingDetails.totalAmount,
          status: 'confirmed',
          notes: `Shift: ${bookingDetails.shift}`,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Get inventory items for each school
      const schoolIds = bookingDetails.schools.map(s => s.schoolId);
      const { data: inventoryItems } = await supabase
        .from('inventory_items')
        .select('id, school_id, price_per_hour')
        .in('school_id', schoolIds)
        .eq('is_active', true);

      if (inventoryItems && inventoryItems.length > 0) {
        // Create booking items for each school's inventory
        const bookingItems = inventoryItems.map((item) => ({
          booking_id: booking.id,
          inventory_item_id: item.id,
          quantity: 1,
          hours: bookingDetails.hours,
          price_per_hour: Number(item.price_per_hour),
          subtotal: Number(item.price_per_hour) * bookingDetails.hours,
        }));

        const { error: itemsError } = await supabase
          .from('booking_items')
          .insert(bookingItems);

        if (itemsError) throw itemsError;
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          amount: bookingDetails.totalAmount,
          status: 'completed',
          razorpay_payment_id: paymentMethod === 'upi' ? `upi_${Date.now()}` : `rzp_${Date.now()}`,
        });

      if (paymentError) throw paymentError;

      setBookingId(booking.id);
      setPaymentComplete(true);
      sessionStorage.removeItem('bookingDetails');
      sessionStorage.removeItem('selectedSchools');

      toast({
        title: 'Booking Confirmed!',
        description: 'Your booking has been successfully confirmed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (paymentComplete) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="mx-auto max-w-lg text-center animate-scale-in">
            <CardContent className="pt-12">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gsx-success/10 animate-bounce">
                <CheckCircle className="h-10 w-10 text-gsx-success" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Booking Confirmed!</h1>
              <p className="mb-6 text-muted-foreground">
                Your booking for {bookingDetails.schools.length} school{bookingDetails.schools.length !== 1 ? 's' : ''} has been confirmed.
              </p>
              <div className="mb-6 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono font-medium">{bookingId}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full gsx-gradient" onClick={() => navigate('/dashboard')}>
                  View My Bookings
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/schools')}>
                  Book More Schools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/booking')} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scheduling
        </Button>

        <h1 className="mb-8 text-3xl font-bold animate-fade-in">Complete Payment</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shift</span>
                  <span className="font-medium">{bookingDetails.shift}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{bookingDetails.hours} hours</span>
                </div>
              </div>

              {/* Schools List */}
              <div className="space-y-3">
                <h4 className="font-medium">Schools ({bookingDetails.schools.length})</h4>
                {bookingDetails.schools.map((school, index) => (
                  <div 
                    key={school.schoolId} 
                    className="flex justify-between p-3 rounded-lg border animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium">{school.schoolName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {school.location}
                      </p>
                    </div>
                    <span className="font-medium text-primary">₹{school.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="gsx-gradient-text">₹{bookingDetails.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id}>
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.id}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-primary/50",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center transition-colors",
                          paymentMethod === method.id ? "gsx-gradient" : "bg-muted"
                        )}>
                          <method.icon className={cn(
                            "h-6 w-6",
                            paymentMethod === method.id ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button 
                className="w-full gsx-gradient text-lg py-6" 
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{bookingDetails.totalAmount.toLocaleString()}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Secure payment • 100% Safe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payment;
