import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, CreditCard, ArrowLeft, Smartphone, MapPin, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface SelectedSchool {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
}

interface BookingDetails {
  date: string;
  shift: {
    id: string;
    name: string;
    time: string;
    startTime: string;
    endTime: string;
    hours: number;
  };
}

interface SchoolBooking {
  schoolId: string;
  schoolName: string;
  location: string;
  pricePerHour: number;
  subtotal: number;
}

type PaymentStep = 'method' | 'upi_input' | 'upi_waiting' | 'success';

const Payment = () => {
  const navigate = useNavigate();
  const { user, collegeId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<SelectedSchool[]>([]);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('method');
  const [upiId, setUpiId] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [schoolBookings, setSchoolBookings] = useState<SchoolBooking[]>([]);

  useEffect(() => {
    const storedSchools = sessionStorage.getItem('selectedSchools');
    const storedDetails = sessionStorage.getItem('bookingDetails');
    
    if (storedSchools && storedDetails) {
      setSelectedSchools(JSON.parse(storedSchools));
      setBookingDetails(JSON.parse(storedDetails));
    } else {
      navigate('/schools');
    }
  }, [navigate]);

  // Fetch pricing for selected schools
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

  // Calculate pricing
  useEffect(() => {
    if (!bookingDetails || !inventoryItems) return;
    
    const bookings: SchoolBooking[] = selectedSchools.map(school => {
      const item = inventoryItems.find(i => i.school_id === school.id);
      const pricePerHour = item?.price_per_hour || 500; // Default price
      const subtotal = pricePerHour * bookingDetails.shift.hours;
      return {
        schoolId: school.id,
        schoolName: school.name,
        location: [school.city, school.state].filter(Boolean).join(', ') || school.address,
        pricePerHour,
        subtotal,
      };
    });
    setSchoolBookings(bookings);
  }, [selectedSchools, inventoryItems, bookingDetails]);

  const totalAmount = schoolBookings.reduce((sum, s) => sum + s.subtotal, 0);

  // Poll for payment confirmation when waiting
  useEffect(() => {
    if (paymentStep !== 'upi_waiting' || !paymentId) return;

    const interval = setInterval(async () => {
      setCheckingPayment(true);
      const { data: payment } = await supabase
        .from('payments')
        .select('status')
        .eq('id', paymentId)
        .single();

      if (payment?.status === 'completed') {
        // Update booking status to confirmed
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);

        setPaymentStep('success');
        sessionStorage.removeItem('selectedSchools');
        clearInterval(interval);
        
        toast({
          title: 'Payment Confirmed!',
          description: 'Your booking has been successfully confirmed.',
        });
      }
      setCheckingPayment(false);
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [paymentStep, paymentId, bookingId, toast]);

  if (!user || !collegeId) {
    navigate('/login');
    return null;
  }

  if (selectedSchools.length === 0 || !bookingDetails) {
    return null;
  }

  const validateUpiId = (upi: string) => {
    // Basic UPI ID validation: username@bankname
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/;
    return upiRegex.test(upi);
  };

  const handleSendUpiRequest = async () => {
    if (!validateUpiId(upiId)) {
      toast({
        variant: 'destructive',
        title: 'Invalid UPI ID',
        description: 'Please enter a valid UPI ID (e.g., name@upi)',
      });
      return;
    }

    if (!bookingDetails) return;

    setLoading(true);
    try {
      // Create booking with pending status
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          college_id: collegeId,
          booking_date: bookingDetails.date,
          start_time: bookingDetails.shift.startTime,
          end_time: bookingDetails.shift.endTime,
          total_amount: totalAmount,
          status: 'pending', // Pending until payment confirmed
          notes: `Shift: ${bookingDetails.shift.name} | UPI: ${upiId}`,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Get inventory items for booking items
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
          hours: bookingDetails.shift.hours,
          price_per_hour: Number(item.price_per_hour),
          subtotal: Number(item.price_per_hour) * bookingDetails.shift.hours,
        }));

        const { error: itemsError } = await supabase
          .from('booking_items')
          .insert(bookingItems);

        if (itemsError) throw itemsError;
      }

      // Create payment record with pending status
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          amount: totalAmount,
          status: 'pending', // Will be updated when payment confirmed
          razorpay_payment_id: `upi_request_${Date.now()}`,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      setPaymentStep('upi_waiting');
      sessionStorage.removeItem('bookingDetails');
      setPaymentStep('upi_waiting');

      toast({
        title: 'Payment Request Sent!',
        description: `Payment request sent to ${upiId}. Please approve in your UPI app.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!bookingDetails) return;

    setLoading(true);
    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          college_id: collegeId,
          booking_date: bookingDetails.date,
          start_time: bookingDetails.shift.startTime,
          end_time: bookingDetails.shift.endTime,
          total_amount: totalAmount,
          status: 'confirmed',
          notes: `Shift: ${bookingDetails.shift.name}`,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Get inventory items
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
          hours: bookingDetails.shift.hours,
          price_per_hour: Number(item.price_per_hour),
          subtotal: Number(item.price_per_hour) * bookingDetails.shift.hours,
        }));

        await supabase.from('booking_items').insert(bookingItems);
      }

      // Create payment record
      await supabase.from('payments').insert({
        booking_id: booking.id,
        amount: totalAmount,
        status: 'completed',
        razorpay_payment_id: `rzp_${Date.now()}`,
      });

      setBookingId(booking.id);
      setPaymentStep('success');
      sessionStorage.removeItem('selectedSchools');
      sessionStorage.removeItem('bookingDetails');

      toast({
        title: 'Booking Confirmed!',
        description: 'Your booking has been successfully confirmed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulate payment confirmation (for demo)
  const simulatePaymentConfirmation = async () => {
    if (!paymentId) return;
    
    await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', paymentId);
  };

  const canProceedToPayment = bookingDetails && schoolBookings.length > 0;

  // Success Screen
  if (paymentStep === 'success') {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="mx-auto max-w-lg text-center animate-scale-in">
            <CardContent className="pt-12">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gsx-success/10">
                <CheckCircle className="h-10 w-10 text-gsx-success" />
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

  // UPI Waiting Screen
  if (paymentStep === 'upi_waiting') {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="mx-auto max-w-lg text-center animate-scale-in">
            <CardContent className="pt-12 space-y-6">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gsx-warning/10">
                <Clock className="h-10 w-10 text-gsx-warning animate-pulse" />
              </div>
              <div>
                <h1 className="mb-2 text-2xl font-bold">Waiting for Payment</h1>
                <p className="text-muted-foreground">
                  Payment request sent to <span className="font-mono font-medium">{upiId}</span>
                </p>
              </div>
              
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-6">
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Open your UPI app and approve the payment</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount: ₹{totalAmount.toLocaleString()}
                </p>
              </div>

              {checkingPayment && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking payment status...
                </div>
              )}

              <div className="space-y-3">
                {/* Demo button to simulate payment */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={simulatePaymentConfirmation}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  I've Completed Payment (Demo)
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setPaymentStep('method');
                    setUpiId('');
                  }}
                >
                  Try Different Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // UPI Input Screen
  if (paymentStep === 'upi_input') {
    return (
      <MainLayout>
        <div className="container py-8">
          <Button 
            variant="ghost" 
            onClick={() => setPaymentStep('method')} 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="max-w-md mx-auto">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Enter UPI ID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="upi">Your UPI ID</Label>
                  <Input
                    id="upi"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: name@paytm, name@oksbi, name@ybl
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Schools</span>
                    <span>{schoolBookings.length}</span>
                  </div>
                </div>

                <Button 
                  className="w-full text-lg py-6" 
                  onClick={handleSendUpiRequest}
                  disabled={loading || !upiId.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    'Send Payment Request'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  A payment request will be sent to your UPI app
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Payment Method Selection
  return (
    <MainLayout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/schools')} 
          className="mb-6"
        >
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
              {/* Booking Info */}
              {bookingDetails && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{bookingDetails.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shift</span>
                    <span className="font-medium">{bookingDetails.shift.name} ({bookingDetails.shift.time})</span>
                  </div>
                </div>
              )}

              {/* Selected Schools */}
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
                    <span className="font-medium">₹{school.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {canProceedToPayment && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* UPI Option */}
                    <div>
                      <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                      <Label
                        htmlFor="upi"
                        className={cn(
                          "flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-foreground/50",
                          paymentMethod === 'upi' ? "border-foreground bg-accent" : "border-border"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center transition-colors",
                          paymentMethod === 'upi' ? "bg-foreground" : "bg-muted"
                        )}>
                          <Smartphone className={cn(
                            "h-6 w-6",
                            paymentMethod === 'upi' ? "text-background" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className="font-semibold">UPI Payment</p>
                          <p className="text-sm text-muted-foreground">Pay using any UPI app (GPay, PhonePe, Paytm)</p>
                        </div>
                      </Label>
                    </div>

                    {/* Razorpay Option */}
                    <div>
                      <RadioGroupItem value="razorpay" id="razorpay" className="peer sr-only" />
                      <Label
                        htmlFor="razorpay"
                        className={cn(
                          "flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-foreground/50",
                          paymentMethod === 'razorpay' ? "border-foreground bg-accent" : "border-border"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center transition-colors",
                          paymentMethod === 'razorpay' ? "bg-foreground" : "bg-muted"
                        )}>
                          <CreditCard className={cn(
                            "h-6 w-6",
                            paymentMethod === 'razorpay' ? "text-background" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className="font-semibold">Razorpay</p>
                          <p className="text-sm text-muted-foreground">Cards, NetBanking, Wallets</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <Button 
                  className="w-full text-lg py-6" 
                  onClick={() => {
                    if (paymentMethod === 'upi') {
                      setPaymentStep('upi_input');
                    } else {
                      handleRazorpayPayment();
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'upi' ? (
                    'Continue with UPI'
                  ) : (
                    `Pay ₹${totalAmount.toLocaleString()}`
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
