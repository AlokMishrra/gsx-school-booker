import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, CreditCard, ArrowLeft, Smartphone, Wallet } from 'lucide-react';

interface BookingDetails {
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  totalAmount: number;
  items: Array<{
    inventoryItemId: string;
    itemName: string;
    schoolName?: string;
    quantity: number;
    pricePerHour: number;
    subtotal: number;
  }>;
}

const Payment = () => {
  const navigate = useNavigate();
  const { user, collegeId } = useAuth();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingDetails');
    if (stored) {
      setBookingDetails(JSON.parse(stored));
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  if (!user || !collegeId) {
    navigate('/login');
    return null;
  }

  if (!bookingDetails) {
    return null;
  }

  // Group items by school
  const itemsBySchool = bookingDetails.items.reduce((acc, item) => {
    const schoolName = item.schoolName || 'Unknown School';
    if (!acc[schoolName]) {
      acc[schoolName] = [];
    }
    acc[schoolName].push(item);
    return acc;
  }, {} as Record<string, typeof bookingDetails.items>);

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
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create booking items
      const bookingItems = bookingDetails.items.map((item) => ({
        booking_id: booking.id,
        inventory_item_id: item.inventoryItemId,
        quantity: item.quantity,
        hours: bookingDetails.hours,
        price_per_hour: item.pricePerHour,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('booking_items')
        .insert(bookingItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking.id,
          amount: bookingDetails.totalAmount,
          status: 'completed',
          razorpay_payment_id: paymentMethod === 'upi' 
            ? `upi_${Date.now()}` 
            : `razorpay_${Date.now()}`,
        });

      if (paymentError) throw paymentError;

      setBookingId(booking.id);
      setPaymentComplete(true);
      clearCart();
      sessionStorage.removeItem('bookingDetails');

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
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gsx-success/10 animate-pulse">
                <CheckCircle className="h-10 w-10 text-gsx-success" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Booking Confirmed!</h1>
              <p className="mb-6 text-muted-foreground">
                Your booking has been successfully confirmed. You will receive a confirmation email shortly.
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
                  Browse More Schools
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
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">
                    {bookingDetails.startTime} - {bookingDetails.endTime}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {bookingDetails.hours} hour{bookingDetails.hours !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Items grouped by school */}
              <div className="space-y-4">
                <h4 className="font-medium">Items by School</h4>
                {Object.entries(itemsBySchool).map(([schoolName, items]) => (
                  <div key={schoolName} className="rounded-lg border p-3 space-y-2">
                    <p className="font-medium text-sm text-primary">{schoolName}</p>
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.itemName}
                        </span>
                        <span>₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="gsx-gradient-text">₹{bookingDetails.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'razorpay' | 'upi')}>
                <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Razorpay</p>
                      <p className="text-sm text-muted-foreground">Cards, Net Banking, Wallets</p>
                    </div>
                  </Label>
                </div>
                
                <div className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm, etc.</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Payment Info Box */}
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                {paymentMethod === 'upi' ? (
                  <>
                    <Smartphone className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <p className="font-medium">Pay via UPI</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Scan QR code or enter UPI ID
                    </p>
                  </>
                ) : (
                  <>
                    <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Click the button below to proceed with Razorpay payment
                    </p>
                  </>
                )}
              </div>

              <Button 
                className="w-full gsx-gradient text-lg py-6 transition-transform hover:scale-[1.02] active:scale-[0.98]" 
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
                    Pay ₹{bookingDetails.totalAmount}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {paymentMethod === 'upi' 
                  ? 'Secure UPI payment' 
                  : 'Secure payment powered by Razorpay'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payment;
