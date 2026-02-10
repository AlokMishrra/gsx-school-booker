import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar, Check, X } from 'lucide-react';

const AdminBookings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          colleges (name, email, phone),
          booking_items (
            *,
            inventory_items (
              name,
              schools (name)
            )
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast({ title: 'Booking status updated' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-gsx-success text-gsx-success-foreground';
      case 'pending':
        return 'bg-gsx-warning text-gsx-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return '';
    }
  };

  const filteredBookings = bookings?.filter((booking: any) => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bookings Management</h1>
            <p className="text-muted-foreground">View and manage all bookings</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : filteredBookings && filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{booking.colleges?.name || 'Unknown College'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {booking.colleges?.email} • {booking.colleges?.phone}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {format(new Date(booking.booking_date), 'PPP')}
                      </p>
                      <p className="text-sm">{booking.start_time} - {booking.end_time}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Items</p>
                      <div className="space-y-1">
                        {booking.booking_items?.slice(0, 3).map((item: any) => (
                          <p key={item.id} className="text-sm">
                            {item.quantity}x {item.inventory_items?.name}
                          </p>
                        ))}
                        {booking.booking_items?.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{booking.booking_items.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold gsx-gradient-text">₹{booking.total_amount}</p>
                    </div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="gsx-gradient"
                        onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No bookings found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
