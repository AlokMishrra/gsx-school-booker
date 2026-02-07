import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, CreditCard, ArrowLeft, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SelectedSchool {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
}

interface SchoolBooking {
  schoolId: string;
  schoolName: string;
  location: string;
  price: number;
}

const RAZORPAY_KEY_ID = 'rzp_live_SCRcvtqJ5ouvgY';

const Payment = () => {
  const navigate = useNavigate();
  const { user, collegeId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<SelectedSchool[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [schoolBookings, setSchoolBookings] = useState<SchoolBooking[]>([]);

  useEffect(() => {
    const storedSchools = sessionStorage.getItem('selectedSchools');
    if (storedSchools) {
      setSelectedSchools(JSON.parse(storedSchools));
    } else {
      navigate('/schools');
    }
  }, [navigate]);

  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory-items', selectedSchools.map(s => s.id)],
    queryFn: async () => {
      if (selectedSchools.length === 0) return [];
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, school_id, price_per_hour, name')
        .in('school_id', selectedSchools.map(s => s.id))
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: selectedSchools.length > 0,
  });

  useEffect(() => {
    if (!inventoryItems) return;
    const bookings: SchoolBooking[] = selectedSchools.map(school => {
      const item = inventoryItems.find(i => i.school_id === school.id);
      const price = item?.price_per_hour || 500;
      return {
        schoolId: school.id,
        schoolName: school.name,
        location: [school.city, school.state].filter(Boolean).join(', ') || school.address,
        price,
      };
    });
    setSchoolBookings(bookings);
  }, [selectedSchools, inventoryItems]);

  const totalAmount = schoolBookings.reduce((sum, s) => sum + s.price, 0);

  if (!user || !collegeId) {
    navigate('/login');
    return null;
  }

  if (selectedSchools.length === 0) return null;

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Create booking with pending status first
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          college_id: collegeId,
          booking_date: today,
          start_time: '00:00:00',
          end_time: '23:59:59',
          total_amount: totalAmount,
          status: 'pending',
          notes: `Schools: ${schoolBookings.map(s => s.schoolName).join(', ')}`,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Insert booking items
      const schoolIds = schoolBookings.map(s => s.schoolId);
      const { data: items } = await supabase
        .from('inventory_items')
        .select('id, school_id, price_per_hour')
        .in('school_id', schoolIds)
        .eq('is_active', true);

      if (items && items.length > 0) {
        const bookingItems = items.map((item) => ({
          booking_id: booking.id,
          inventory_item_id: item.id,
          quantity: 1,
          hours: 1,
          price_per_hour: Number(item.price_per_hour),
          subtotal: Number(item.price_per_hour),
        }));
        await supabase.from('booking_items').insert(bookingItems);
      }

      // Create pending payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          amount: totalAmount,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      // Create Razorpay order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: totalAmount,
          receipt: booking.id,
          notes: { booking_id: booking.id },
        },
      });

      if (orderError) throw new Error(orderError.message || 'Failed to create payment order');
      if (orderData?.error) throw new Error(orderData.error);

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Zero's School",
        description: `Booking for ${schoolBookings.length} school(s)`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          // Verify payment via edge function
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.id,
            },
          });

          if (verifyError || !verifyData?.success) {
            toast({
              variant: 'destructive',
              title: 'Payment Verification Failed',
              description: 'Please contact support if money was deducted.',
            });
            return;
          }

          setBookingId(booking.id);
          setPaymentSuccess(true);
          sessionStorage.removeItem('selectedSchools');
          toast({
            title: 'Booking Confirmed!',
            description: 'Your payment was successful.',
          });
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You can try again when ready.',
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (paymentSuccess) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="mx-auto max-w-lg text-center animate-scale-in">
            <CardContent className="pt-12">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Booking Confirmed!</h1>
              <p className="mb-6 text-muted-foreground">
                Your booking for {schoolBookings.length} school{schoolBookings.length !== 1 ? 's' : ''} has been confirmed.
              </p>
              <div className="mb-6 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono font-medium">{bookingId}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => navigate('/dashboard')}>
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
        <Button variant="ghost" onClick={() => navigate('/schools')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schools
        </Button>

        <h1 className="mb-8 text-3xl font-bold animate-fade-in">Complete Payment</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Schools ({schoolBookings.length})</h4>
                {schoolBookings.map((school, index) => (
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
                    <span className="font-medium">₹{school.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Pay securely via Razorpay</p>
                <p className="text-xs text-muted-foreground">
                  UPI • Cards • NetBanking • Wallets
                </p>
              </div>

              <Button 
                className="w-full text-lg py-6" 
                onClick={handleRazorpayPayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${totalAmount.toLocaleString()}`
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Powered by Razorpay • 100% Secure
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payment;
