import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, ArrowRight, ArrowLeft, Sun, Moon, MapPin } from 'lucide-react';

interface SelectedSchool {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  state?: string | null;
}

const shifts = [
  {
    id: 'shift1',
    name: 'Shift 1 - First Half',
    description: '8:00 AM - 1:00 PM (5 hours)',
    icon: Sun,
    startTime: '08:00',
    endTime: '13:00',
    hours: 5,
  },
  {
    id: 'shift2',
    name: 'Shift 2 - Second Half',
    description: '2:00 PM - 7:00 PM (5 hours)',
    icon: Moon,
    startTime: '14:00',
    endTime: '19:00',
    hours: 5,
  },
];

const Booking = () => {
  const navigate = useNavigate();
  const { user, collegeId } = useAuth();
  const [date, setDate] = useState<Date>();
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [selectedSchools, setSelectedSchools] = useState<SelectedSchool[]>([]);

  // Load selected schools from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedSchools');
    if (stored) {
      setSelectedSchools(JSON.parse(stored));
    } else {
      navigate('/schools');
    }
  }, [navigate]);

  // Fetch school prices
  const { data: schoolPrices } = useQuery({
    queryKey: ['school-prices', selectedSchools.map(s => s.id)],
    queryFn: async () => {
      if (selectedSchools.length === 0) return {};
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('school_id, price_per_hour')
        .in('school_id', selectedSchools.map(s => s.id))
        .eq('is_active', true);

      if (error) throw error;

      // Get minimum price per school (or you can sum them)
      const priceMap: Record<string, number> = {};
      data.forEach(item => {
        if (!priceMap[item.school_id] || Number(item.price_per_hour) < priceMap[item.school_id]) {
          priceMap[item.school_id] = Number(item.price_per_hour);
        }
      });

      return priceMap;
    },
    enabled: selectedSchools.length > 0,
  });

  if (!user || !collegeId) {
    navigate('/login');
    return null;
  }

  if (selectedSchools.length === 0) {
    return null;
  }

  const shift = shifts.find(s => s.id === selectedShift);
  
  const calculateTotal = () => {
    if (!shift || !schoolPrices) return 0;
    return selectedSchools.reduce((total, school) => {
      const price = schoolPrices[school.id] || 0;
      return total + (price * shift.hours);
    }, 0);
  };

  const totalAmount = calculateTotal();

  const handleProceedToPayment = () => {
    if (!date || !selectedShift || !shift) return;

    const bookingDetails = {
      date: format(date, 'yyyy-MM-dd'),
      startTime: shift.startTime,
      endTime: shift.endTime,
      shift: shift.name,
      hours: shift.hours,
      totalAmount,
      schools: selectedSchools.map(school => ({
        schoolId: school.id,
        schoolName: school.name,
        location: [school.city, school.state].filter(Boolean).join(', '),
        pricePerHour: schoolPrices?.[school.id] || 0,
        subtotal: (schoolPrices?.[school.id] || 0) * shift.hours,
      })),
    };

    sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    navigate('/payment');
  };

  const isValid = date && selectedShift;

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

        <h1 className="mb-8 text-3xl font-bold animate-fade-in">Select Date & Shift</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Date & Shift Selection */}
          <div className="space-y-6 lg:col-span-2">
            {/* Date Picker */}
            <Card className="animate-slide-up">
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

            {/* Shift Selection */}
            <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Select Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedShift} onValueChange={setSelectedShift}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {shifts.map((s) => (
                      <div key={s.id}>
                        <RadioGroupItem
                          value={s.id}
                          id={s.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={s.id}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-lg border-2 p-6 cursor-pointer transition-all hover:border-primary/50",
                            selectedShift === s.id
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                        >
                          <s.icon className={cn(
                            "h-10 w-10 mb-3 transition-colors",
                            selectedShift === s.id ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-sm text-muted-foreground mt-1">
                            {s.description}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Shift Info */}
                <div className="space-y-2 rounded-lg bg-muted p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {date ? format(date, 'PPP') : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shift</span>
                    <span className="font-medium">
                      {shift?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {shift?.hours || 0} hours
                    </span>
                  </div>
                </div>

                {/* Selected Schools */}
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Schools ({selectedSchools.length})</h4>
                  {selectedSchools.map((school) => (
                    <div key={school.id} className="flex justify-between text-sm p-2 rounded-md bg-muted/50">
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[school.city, school.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <span className="text-primary font-medium">
                        ₹{((schoolPrices?.[school.id] || 0) * (shift?.hours || 0)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
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
