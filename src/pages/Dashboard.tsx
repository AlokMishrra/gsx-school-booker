import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Calendar, Clock, Building2, User } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, collegeId, loading: authLoading } = useAuth();

  const { data: college } = useQuery({
    queryKey: ['college', collegeId],
    queryFn: async () => {
      if (!collegeId) return null;
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', collegeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!collegeId,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', collegeId],
    queryFn: async () => {
      if (!collegeId) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          booking_items (
            *,
            inventory_items (
              name,
              schools (name)
            )
          )
        `)
        .eq('college_id', collegeId)
        .order('booking_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!collegeId,
  });

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

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

  const upcomingBookings = bookings?.filter(b => 
    new Date(b.booking_date) >= new Date() && b.status !== 'cancelled'
  ) || [];

  const pastBookings = bookings?.filter(b => 
    new Date(b.booking_date) < new Date() || b.status === 'cancelled'
  ) || [];

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Welcome, <span className="gsx-gradient-text">{college?.name || 'College'}</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your bookings and view your history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg gsx-gradient">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pastBookings.length}</p>
                <p className="text-sm text-muted-foreground">Past Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Building2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Card */}
        {college && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                College Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{college.contact_person}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{college.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{college.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{college.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Bookings */}
        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Upcoming Bookings</h2>
          {bookingsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking: any) => (
                <Card key={booking.id}>
                  <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {format(new Date(booking.booking_date), 'PPP')}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.start_time} - {booking.end_time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.booking_items?.length || 0} items • ₹{booking.total_amount}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Button className="mt-4 gsx-gradient" onClick={() => navigate('/schools')}>
                  Browse Schools
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Past Bookings</h2>
            <div className="space-y-4">
              {pastBookings.slice(0, 5).map((booking: any) => (
                <Card key={booking.id} className="opacity-75">
                  <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {format(new Date(booking.booking_date), 'PPP')}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.start_time} - {booking.end_time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.booking_items?.length || 0} items • ₹{booking.total_amount}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
