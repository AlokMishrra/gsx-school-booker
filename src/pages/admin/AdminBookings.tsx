import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar, Building2, Users, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminBookings = () => {
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-career-fair-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_fair_sessions' as any)
        .select('*')
        .eq('is_booked', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch school details for each booking
      const schoolIds = [...new Set(data?.map((b: any) => b.school_id))];
      const { data: schools } = await supabase
        .from('schools')
        .select('*')
        .in('id', schoolIds);
      
      // Merge school data with bookings
      return data?.map((booking: any) => ({
        ...booking,
        school: schools?.find((s: any) => s.id === booking.school_id)
      }));
    },
  });

  const filteredBookings = bookings?.filter((booking: any) => {
    const matchesType = sessionTypeFilter === 'all' || booking.session_type === sessionTypeFilter;
    const matchesSearch = !searchQuery || 
      booking.school?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_data?.college_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_data?.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const stats = {
    total: bookings?.length || 0,
    physical: bookings?.filter((b: any) => b.session_type === 'physical').length || 0,
    careerFair: bookings?.filter((b: any) => b.session_type === 'career_fair').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Career Fair Bookings</h1>
          <p className="text-muted-foreground">View all session bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Physical Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.physical}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Career Fairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.careerFair}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Search by school, college, or user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="physical">Physical Sessions</SelectItem>
              <SelectItem value="career_fair">Career Fairs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : filteredBookings && filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{booking.school?.name || 'Unknown School'}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.school?.city || booking.school?.address || 'Unknown Location'}</span>
                      </div>
                    </div>
                    <Badge className={booking.session_type === 'physical' ? 'bg-blue-500' : 'bg-purple-500'}>
                      {booking.session_type === 'physical' ? 'Physical Session' : 'Career Fair'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Slot Number</p>
                      <p className="font-medium text-lg">
                        {booking.session_type === 'physical' ? 'P' : 'CF'}{booking.slot_number}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Session Date</p>
                      <p className="font-medium">
                        {format(new Date(booking.session_date), 'PPP')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">College</p>
                      <p className="font-medium">{booking.booking_data?.college_name || 'N/A'}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{booking.booking_data?.user_name || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="text-sm">{booking.booking_data?.email || 'N/A'}</p>
                      <p className="text-sm">{booking.booking_data?.phone_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Booked on: {format(new Date(booking.booking_data?.booked_at || booking.created_at), 'PPp')}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No bookings found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || sessionTypeFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Bookings will appear here once users make reservations'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
