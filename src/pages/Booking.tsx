import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

const Booking = () => {
  const navigate = useNavigate();
  const { user, collegeId } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [date, setDate] = useState<Date>();
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  if (!user || !collegeId) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSlotToggle = (slot: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      }
      return [...prev, slot].sort();
    });
  };

  const calculateHours = () => {
    return selectedSlots.length;
  };

  const totalAmount = subtotal * calculateHours();

  const handleProceedToPayment = () => {
    if (!date || selectedSlots.length === 0) return;

    // Store booking details in session storage for payment page
    const bookingDetails = {
      date: format(date, 'yyyy-MM-dd'),
      startTime: selectedSlots[0],
      endTime: `${parseInt(selectedSlots[selectedSlots.length - 1].split(':')[0]) + 1}:00`,
      hours: calculateHours(),
      totalAmount,
      items: items.map(item => ({
        inventoryItemId: item.inventoryItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        pricePerHour: item.pricePerHour,
        subtotal: item.pricePerHour * item.quantity * calculateHours(),
      })),
    };

    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    navigate('/payment');
  };

  const isValid = date && selectedSlots.length > 0;

  return (
    <MainLayout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cart')} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <h1 className="mb-8 text-3xl font-bold">Select Date & Time</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Date & Time Selection */}
          <div className="space-y-6 lg:col-span-2">
            {/* Date Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Select Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Select one or more consecutive hourly slots
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlots.includes(slot) ? 'default' : 'outline'}
                      className={cn(
                        'transition-all',
                        selectedSlots.includes(slot) && 'gsx-gradient'
                      )}
                      onClick={() => handleSlotToggle(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
                {selectedSlots.length > 0 && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Selected: {selectedSlots[0]} - {parseInt(selectedSlots[selectedSlots.length - 1].split(':')[0]) + 1}:00 
                    ({calculateHours()} hour{calculateHours() !== 1 ? 's' : ''})
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Date & Time */}
                <div className="space-y-2 rounded-lg bg-muted p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {date ? format(date, 'PPP') : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">
                      {selectedSlots.length > 0
                        ? `${selectedSlots[0]} - ${parseInt(selectedSlots[selectedSlots.length - 1].split(':')[0]) + 1}:00`
                        : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {calculateHours()} hour{calculateHours() !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="font-medium">Items</h4>
                  {items.map((item) => (
                    <div key={item.inventoryItemId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.itemName}
                      </span>
                      <span>
                        ₹{item.pricePerHour * item.quantity * calculateHours()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="gsx-gradient-text">₹{totalAmount}</span>
                  </div>
                </div>

                <Button 
                  className="w-full gsx-gradient" 
                  disabled={!isValid}
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Booking;
