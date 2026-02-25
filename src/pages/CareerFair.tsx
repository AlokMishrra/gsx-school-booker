import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Building2, Filter, Circle, Trash2, Loader2, LogIn, UserPlus, LogOut } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTracking } from '@/hooks/useTracking';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface School {
  id: string;
  name: string;
  location: string;
  state: string;
  address: string;
  email: string;
  schoolFee: string;
  averageFee: string;
  tier: number;
  studentStrength: number;
  imageUrl?: string;
}

interface Session {
  id: string;
  school_id: string;
  session_type: 'physical' | 'career_fair';
  slot_number: number;
  is_booked: boolean;
  session_date: string;
  start_time: string;
  end_time: string;
}

const CareerFair = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [myBookings, setMyBookings] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const { trackBooking, trackFormSubmit } = useTracking();
  
  // Form state
  const [bookingForm, setBookingForm] = useState({
    collegeName: '',
    userName: '',
    phoneNumber: '',
    email: ''
  });

  // Fetch schools and sessions from database
  useEffect(() => {
    fetchSchoolsAndSessions();
  }, []);

  // Fetch user's existing bookings when user changes
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    if (!user) return;
    
    try {
      // Get college_id for current user
      const { data: collegeData } = await supabase
        .from('colleges')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!collegeData) return;
      
      // Fetch user's bookings
      const { data: userBookings, error } = await supabase
        .from('career_fair_sessions' as any)
        .select('*')
        .eq('booked_by_college_id', collegeData.id)
        .eq('is_booked', true);
      
      if (error) {
        console.error('Error fetching user bookings:', error);
        return;
      }
      
      // Convert to Set for easy lookup
      const bookingSet = new Set<string>();
      (userBookings || []).forEach((booking: any) => {
        const cellKey = `${booking.school_id}|${booking.session_type}|${booking.slot_number - 1}`;
        bookingSet.add(cellKey);
      });
      
      setMyBookings(bookingSet);
      
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  const fetchSchoolsAndSessions = async () => {
    try {
      setLoading(true);
      console.log('Fetching schools and sessions...');
      
      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .eq('is_active', true);
      
      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        throw schoolsError;
      }
      
      console.log('Schools fetched:', schoolsData?.length);
      
      // Transform schools data
      const transformedSchools: School[] = (schoolsData || []).map((school: any) => ({
        id: school.id,
        name: school.name,
        location: school.city || 'Unknown',
        state: school.state || 'Unknown',
        address: school.address || '',
        email: school.contact_email || '',
        schoolFee: school.school_fee || '₹0',
        averageFee: school.average_fee || '₹0',
        tier: school.tier || 2,
        studentStrength: school.student_strength || 0,
        imageUrl: school.image_url
      }));
      
      setSchools(transformedSchools);
      
      // Fetch all sessions using raw query
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('career_fair_sessions' as any)
        .select('*');
      
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        console.log('This might mean the career_fair_sessions table does not exist yet.');
        console.log('Please run the migration: supabase/migrations/20260223000002_cleanup_and_recreate.sql');
        throw sessionsError;
      }
      
      console.log('Sessions fetched:', sessionsData?.length);
      
      setSessions((sessionsData as any) || []);
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMsg = error?.message || 'Failed to load schools and sessions';
      toast.error(errorMsg);
      
      // If table doesn't exist, show helpful message
      if (error?.message?.includes('relation') || error?.code === '42P01') {
        toast.error('Database table not found. Please run the migration first.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get booking data from sessions
  const getBookingData = () => {
    const data: Record<string, { physical: boolean[]; career: boolean[] }> = {};
    
    schools.forEach(school => {
      data[school.id] = {
        physical: Array(9).fill(false),
        career: Array(20).fill(false)
      };
    });
    
    // If no sessions loaded (table doesn't exist), return empty data
    if (!sessions || sessions.length === 0) {
      return data;
    }
    
    sessions.forEach(session => {
      if (data[session.school_id]) {
        const index = session.slot_number - 1; // slot_number is 1-based
        if (session.session_type === 'physical' && index >= 0 && index < 9) {
          data[session.school_id].physical[index] = session.is_booked;
        } else if (session.session_type === 'career_fair' && index >= 0 && index < 20) {
          data[session.school_id].career[index] = session.is_booked;
        }
      }
    });
    
    return data;
  };

  const bookingData = getBookingData();

  // Check if user has already booked this school (either physical or career fair)
  const hasUserBookedSchool = (schoolId: string): { physical: boolean; career: boolean } => {
    const physicalBooked = Array.from(myBookings).some(key => 
      key.startsWith(`${schoolId}|physical|`)
    );
    const careerBooked = Array.from(myBookings).some(key => 
      key.startsWith(`${schoolId}|career_fair|`)
    );
    
    return { physical: physicalBooked, career: careerBooked };
  };

  // Check if school should be disabled (user has booked both types)
  const isSchoolFullyBooked = (schoolId: string): boolean => {
    const bookings = hasUserBookedSchool(schoolId);
    return bookings.physical && bookings.career;
  };

  const handleCellClick = (schoolId: string, type: 'physical' | 'career', index: number) => {
    // Check if school is selected in checkbox
    if (!selectedSchools.has(schoolId)) {
      return; // Don't allow booking if school not selected
    }
    
    // Convert 'career' to 'career_fair' to match database
    const dbType = type === 'career' ? 'career_fair' : type;
    const cellKey = `${schoolId}|${dbType}|${index}`; // Use | instead of - to avoid UUID conflicts
    
    // Check if already confirmed by user
    if (myBookings.has(cellKey)) return;
    
    // Check if this school has a confirmed booking of THIS TYPE - if yes, disable further bookings of this type
    const hasBookingOfThisType = Array.from(myBookings).some(key => key.startsWith(`${schoolId}|${dbType}|`));
    if (hasBookingOfThisType) return;
    
    // Check if booked by others (not available)
    if (type === 'physical' && bookingData[schoolId].physical[index]) return;
    if (type === 'career' && bookingData[schoolId].career[index]) return;

    setSelectedCells(prev => {
      const newSet = new Set(prev);
      
      // If clicking to deselect
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
        return newSet;
      }
      
      // Check if school already has a selection of this type
      const hasPhysicalSelection = Array.from(newSet).some(key => 
        key.startsWith(`${schoolId}|physical|`)
      );
      const hasCareerSelection = Array.from(newSet).some(key => 
        key.startsWith(`${schoolId}|career_fair|`)
      );

      // If trying to select another physical when one is already selected
      if (type === 'physical' && hasPhysicalSelection) {
        // Remove the old physical selection and add the new one
        Array.from(newSet).forEach(key => {
          if (key.startsWith(`${schoolId}|physical|`)) {
            newSet.delete(key);
          }
        });
      }
      
      // If trying to select another career when one is already selected
      if (type === 'career' && hasCareerSelection) {
        // Remove the old career selection and add the new one
        Array.from(newSet).forEach(key => {
          if (key.startsWith(`${schoolId}|career_fair|`)) {
            newSet.delete(key);
          }
        });
      }
      
      newSet.add(cellKey);
      return newSet;
    });
  };

  const handleSchoolToggle = (schoolId: string) => {
    // Don't allow selecting if school is fully booked by user
    if (isSchoolFullyBooked(schoolId)) {
      toast.error('You have already booked both session types for this school');
      return;
    }
    
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schoolId)) {
        newSet.delete(schoolId);
        
        // Clear all session selections for this school
        setSelectedCells(prevCells => {
          const newCells = new Set(prevCells);
          Array.from(newCells).forEach(cellKey => {
            if (cellKey.startsWith(`${schoolId}|`)) {
              newCells.delete(cellKey);
            }
          });
          return newCells;
        });
      } else {
        newSet.add(schoolId);
      }
      return newSet;
    });
  };

  const handleRemoveSchool = (schoolId: string) => {
    // Remove school from selected schools
    setSelectedSchools(prev => {
      const newSet = new Set(prev);
      newSet.delete(schoolId);
      return newSet;
    });
    
    // Remove all selections for this school
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      Array.from(newSet).forEach(cellKey => {
        if (cellKey.startsWith(`${schoolId}|`)) {
          newSet.delete(cellKey);
        }
      });
      return newSet;
    });
  };

  const handleSelectAllSchools = () => {
    if (selectedSchools.size === filteredSchools.length) {
      setSelectedSchools(new Set());
    } else {
      setSelectedSchools(new Set(filteredSchools.map(s => s.id)));
    }
  };

  const handleSelectRow = (schoolId: string, type: 'physical' | 'career') => {
    // Check if school is selected in checkbox
    if (!selectedSchools.has(schoolId)) {
      return; // Don't allow if school not selected
    }
    
    // Convert 'career' to 'career_fair' to match database
    const dbType = type === 'career' ? 'career_fair' : type;
    
    // Check if this school has a confirmed booking of THIS TYPE - if yes, disable further bookings of this type
    const hasBookingOfThisType = Array.from(myBookings).some(key => key.startsWith(`${schoolId}|${dbType}|`));
    if (hasBookingOfThisType) return;
    
    const length = type === 'physical' ? 9 : 20;
    const newCells = new Set(selectedCells);
    
    // Remove any existing selection for this school and type
    Array.from(newCells).forEach(cellKey => {
      if (cellKey.startsWith(`${schoolId}|${dbType}|`)) {
        newCells.delete(cellKey);
      }
    });
    
    // Find ANY available cell for this school and type (not just first one)
    for (let i = 0; i < length; i++) {
      const cellKey = `${schoolId}|${dbType}|${i}`;
      const isBooked = type === 'physical' ? bookingData[schoolId].physical[i] : bookingData[schoolId].career[i];
      if (!myBookings.has(cellKey) && !isBooked) {
        newCells.add(cellKey);
        break; // Only add ONE cell
      }
    }
    setSelectedCells(newCells);
  };

  const handleSelectColumn = (type: 'physical' | 'career', index: number) => {
    const newCells = new Set(selectedCells);
    const length = type === 'physical' ? 9 : 20;
    
    // Convert 'career' to 'career_fair' to match database
    const dbType = type === 'career' ? 'career_fair' : type;
    
    filteredSchools.forEach(school => {
      // Check if school is selected in checkbox
      if (!selectedSchools.has(school.id)) return;
      
      // Check if this school has a confirmed booking of THIS TYPE - if yes, skip
      const hasBookingOfThisType = Array.from(myBookings).some(key => key.startsWith(`${school.id}|${dbType}|`));
      if (hasBookingOfThisType) return;
      
      const cellKey = `${school.id}|${dbType}|${index}`;
      const isBooked = type === 'physical' ? bookingData[school.id].physical[index] : bookingData[school.id].career[index];
      
      // Remove any existing selection for this school and type
      Array.from(newCells).forEach(key => {
        if (key.startsWith(`${school.id}|${dbType}|`)) {
          newCells.delete(key);
        }
      });
      
      // If the specific column slot is available, select it
      if (!myBookings.has(cellKey) && !isBooked) {
        newCells.add(cellKey);
      } else {
        // If not available, find ANY available slot for this school and type
        for (let i = 0; i < length; i++) {
          const altCellKey = `${school.id}|${dbType}|${i}`;
          const altIsBooked = type === 'physical' ? bookingData[school.id].physical[i] : bookingData[school.id].career[i];
          if (!myBookings.has(altCellKey) && !altIsBooked) {
            newCells.add(altCellKey);
            break; // Only add ONE cell
          }
        }
      }
    });
    setSelectedCells(newCells);
  };

  const handleBookingClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = async () => {
    // Validate form
    if (!bookingForm.collegeName || !bookingForm.userName || !bookingForm.phoneNumber || !bookingForm.email) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to book');
      return;
    }
    
    try {
      console.log('Starting booking process...');
      console.log('Selected cells:', Array.from(selectedCells));
      console.log('Available sessions:', sessions.length);
      
      // Get college_id for current user
      let collegeId: string;
      const { data: collegeData, error: collegeError } = await supabase
        .from('colleges')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (collegeError || !collegeData) {
        console.error('College profile error:', collegeError);
        
        // Try to create college profile if it doesn't exist
        const { data: newCollege, error: createError } = await supabase
          .from('colleges')
          .insert({
            user_id: user.id,
            name: bookingForm.collegeName,
            contact_person: bookingForm.userName,
            email: bookingForm.email,
            phone: bookingForm.phoneNumber,
            address: 'Not provided'
          })
          .select()
          .single();
        
        if (createError || !newCollege) {
          console.error('Failed to create college profile:', createError);
          toast.error('Unable to create your profile. Please try again or contact support.');
          return;
        }
        
        // Use the newly created college
        collegeId = newCollege.id;
      } else {
        collegeId = collegeData.id;
      }
      
      // Track form submission
      trackFormSubmit('booking-form', {
        collegeName: bookingForm.collegeName,
        sessionsCount: selectedCells.size,
      });
      
      // Book each selected session in the database
      const bookingPromises = Array.from(selectedCells).map(async (cellKey) => {
        const [schoolId, type, index] = cellKey.split('|'); // Use | delimiter
        const slotNumber = parseInt(index) + 1; // Convert to 1-based
        const sessionType = type === 'physical' ? 'physical' : 'career_fair';
        
        console.log(`Looking for session: schoolId=${schoolId}, type=${sessionType}, slot=${slotNumber}`);
        
        // Find the session
        const session = sessions.find(
          s => s.school_id === schoolId && 
               s.session_type === sessionType && 
               s.slot_number === slotNumber
        );
        
        if (!session) {
          console.error(`Session not found for: ${cellKey}`);
          console.log('Available sessions for school:', sessions.filter(s => s.school_id === schoolId));
          throw new Error(`Session not found: ${cellKey} (school: ${schoolId}, type: ${sessionType}, slot: ${slotNumber})`);
        }
        
        console.log(`Found session:`, session);
        
        // Update session to mark as booked
        const { data, error } = await supabase
          .from('career_fair_sessions' as any)
          .update({
            is_booked: true,
            booked_by_college_id: collegeId,  // Link to college
            booking_data: {
              college_name: bookingForm.collegeName,
              user_name: bookingForm.userName,
              phone_number: bookingForm.phoneNumber,
              email: bookingForm.email,
              booked_at: new Date().toISOString()
            }
          })
          .eq('id', session.id)
          .eq('is_booked', false) // Only update if not already booked
          .select();
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn('No rows updated for session:', session.id);
          console.warn('This might mean the session was already booked');
        } else {
          console.log('Booking successful for:', cellKey, 'Updated rows:', data.length);
        }
        
        return cellKey;
      });
      
      const results = await Promise.all(bookingPromises);
      console.log('All bookings completed:', results);
      
      // Track booking
      trackBooking({
        collegeName: bookingForm.collegeName,
        userName: bookingForm.userName,
        sessionsBooked: Array.from(selectedCells),
        totalSessions: selectedCells.size,
      });
      
      // Refresh sessions and user bookings from database
      await fetchSchoolsAndSessions();
      await fetchUserBookings();  // Refresh user's bookings
      
      setSelectedCells(new Set());
      setShowConfirmDialog(false);
      
      // Reset form
      setBookingForm({
        collegeName: '',
        userName: '',
        phoneNumber: '',
        email: ''
      });
      
      // Show success message
      toast.success(`Successfully booked ${results.length} session(s)!`);
      
    } catch (error: any) {
      console.error('Error booking sessions:', error);
      const errorMessage = error?.message || 'Failed to confirm booking. Please try again.';
      toast.error(errorMessage);
    }
  };

  const getCellStatus = (schoolId: string, type: 'physical' | 'career', index: number) => {
    // Convert 'career' to 'career_fair' to match database
    const dbType = type === 'career' ? 'career_fair' : type;
    const cellKey = `${schoolId}|${dbType}|${index}`;
    if (myBookings.has(cellKey)) return 'selected';
    
    // Check if school is selected in checkbox
    if (!selectedSchools.has(schoolId)) return 'not-selected';
    
    // Check if this school has a confirmed booking of THIS TYPE - if yes, mark as disabled
    const hasBookingOfThisType = Array.from(myBookings).some(key => key.startsWith(`${schoolId}|${dbType}|`));
    if (hasBookingOfThisType) return 'disabled';
    
    // Check if available (true in bookingData means NOT available/booked)
    const isAvailable = type === 'physical' 
      ? !bookingData[schoolId].physical[index]  // false = available (green), true = booked (red)
      : !bookingData[schoolId].career[index];
    
    if (!isAvailable) return 'booked'; // Show as red
    return 'available'; // Show as green
  };

  const filteredSchools = schools.filter(school => {
    if (locationFilter !== 'all' && school.state !== locationFilter) return false;
    if (tierFilter !== 'all' && school.tier !== parseInt(tierFilter)) return false;
    return true;
  });

  // Get unique states for filter dropdown
  const uniqueStates = Array.from(new Set(schools.map(s => s.state).filter(s => s !== 'Unknown'))).sort();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {loading ? (
        <div className="container py-8 max-w-[1600px] flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading schools and sessions...</p>
          </div>
        </div>
      ) : (
        <div className="container py-8 max-w-[1600px]">
          {/* User Dashboard Section */}
          {user && (
            <Card className="mb-6 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">My Dashboard</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Welcome back! Here's your booking summary
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {myBookings.size} Bookings
                    </Badge>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        navigate('/');
                      }}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {myBookings.size > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Your Confirmed Bookings</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {Array.from(myBookings).map(cellKey => {
                        const [schoolId, type, index] = cellKey.split('|');
                        const school = schools.find(s => s.id === schoolId);
                        const slotNumber = parseInt(index) + 1;
                        const sessionType = type === 'physical' ? 'Physical Session' : 'Career Fair';
                        const sessionLabel = type === 'physical' ? `P${slotNumber}` : `CF${slotNumber}`;
                        
                        return (
                          <Card key={cellKey} className="border-blue-200 bg-blue-50/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{school?.name}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">{school?.location}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={type === 'physical' ? 'default' : 'secondary'} className="text-xs">
                                      {sessionLabel}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{sessionType}</span>
                                  </div>
                                </div>
                                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-lg mb-2">No Bookings Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start by selecting schools below and booking your sessions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">School Session Booking</h1>
            <p className="text-muted-foreground">Select schools and book physical sessions or career fairs</p>
          </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Select Schools & Book Sessions</CardTitle>
              <div className="flex gap-3">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {uniqueStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="1">Tier 1</SelectItem>
                    <SelectItem value="2">Tier 2</SelectItem>
                    <SelectItem value="3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  onClick={handleSelectAllSchools}
                >
                  {selectedSchools.size === filteredSchools.length ? 'Deselect All' : 'Select All Schools'}
                </Button>
                <Button 
                  className="gsx-gradient"
                  disabled={selectedCells.size === 0}
                  onClick={handleBookingClick}
                >
                  Confirm Booking ({selectedCells.size})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Booking Calendar</h3>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="p-3 text-left font-semibold bg-muted/50 sticky left-0 z-10 border-r-2">
                        <input
                          type="checkbox"
                          checked={selectedSchools.size === filteredSchools.length && filteredSchools.length > 0}
                          onChange={handleSelectAllSchools}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th colSpan={10} className="p-3 text-center font-semibold bg-blue-100 border-x-2 border-blue-300">
                        <div className="flex items-center justify-center gap-2">
                          <Building2 className="h-5 w-5" />
                          <span>PHYSICAL SESSIONS</span>
                        </div>
                      </th>
                      <th colSpan={21} className="p-3 text-center font-semibold bg-purple-100 border-l-2 border-purple-300">
                        <div className="flex items-center justify-center gap-2">
                          <Building2 className="h-5 w-5" />
                          <span>CAREER FAIRS</span>
                        </div>
                      </th>
                    </tr>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-2 text-xs bg-muted/50 sticky left-0 z-10 border-r-2">School</th>
                      <th className="p-2 text-xs font-medium bg-blue-50 border-r">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => {
                            filteredSchools.forEach(school => {
                              handleSelectRow(school.id, 'physical');
                            });
                          }}
                        >
                          <Circle className="h-4 w-4" />
                        </Button>
                      </th>
                      {Array.from({ length: 9 }, (_, i) => (
                        <th key={`p${i}`} className="p-2 text-xs font-medium bg-blue-50 border-r">
                          <div className="flex flex-col items-center gap-1">
                            <span>P{i + 1}</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-5 w-5 p-0 rounded-full"
                              onClick={() => handleSelectColumn('physical', i)}
                            >
                              {filteredSchools.some(school => 
                                selectedSchools.has(school.id) && 
                                Array.from(selectedCells).some(key => key === `${school.id}|physical|${i}`)
                              ) ? (
                                <div className="h-3 w-3 rounded-full bg-blue-500 flex items-center justify-center">
                                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                                </div>
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </th>
                      ))}
                      <th className="p-2 text-xs font-medium bg-purple-50 border-l-2 border-r border-purple-300">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => {
                            filteredSchools.forEach(school => {
                              handleSelectRow(school.id, 'career');
                            });
                          }}
                        >
                          <Circle className="h-4 w-4" />
                        </Button>
                      </th>
                      {Array.from({ length: 20 }, (_, i) => (
                        <th key={`cf${i}`} className="p-2 text-xs font-medium bg-purple-50 border-r">
                          <div className="flex flex-col items-center gap-1">
                            <span>CF{i + 1}</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-5 w-5 p-0 rounded-full"
                              onClick={() => handleSelectColumn('career', i)}
                            >
                              {filteredSchools.some(school => 
                                selectedSchools.has(school.id) && 
                                Array.from(selectedCells).some(key => key === `${school.id}|career_fair|${i}`)
                              ) ? (
                                <div className="h-3 w-3 rounded-full bg-purple-500 flex items-center justify-center">
                                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                                </div>
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.map((school) => (
                      <tr key={school.id} className={cn(
                        "border-b border-border hover:bg-muted/30 transition-colors",
                        isSchoolFullyBooked(school.id) && "opacity-50 bg-muted/50"
                      )}>
                        <td className="p-3 font-medium bg-muted/30 sticky left-0 z-10 border-r-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedSchools.has(school.id)}
                                onChange={() => handleSchoolToggle(school.id)}
                                disabled={isSchoolFullyBooked(school.id)}
                                className={cn(
                                  "w-4 h-4",
                                  isSchoolFullyBooked(school.id) ? "cursor-not-allowed" : "cursor-pointer"
                                )}
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-help">
                                      <Building2 className="h-4 w-4 text-primary" />
                                      <div className="flex-1">
                                        <div className="text-sm flex items-center gap-2">
                                          <span>{school.name}</span>
                                          <Badge variant="outline" className="text-xs">
                                            Tier {school.tier}
                                          </Badge>
                                          {isSchoolFullyBooked(school.id) && (
                                            <Badge variant="destructive" className="text-xs">
                                              Fully Booked
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{school.location}</div>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-3">
                                    <div className="space-y-1.5">
                                      <p className="font-semibold text-sm">{school.name}</p>
                                      {isSchoolFullyBooked(school.id) && (
                                        <p className="text-xs text-destructive font-medium">
                                          You have already booked both session types for this school
                                        </p>
                                      )}
                                      <p className="text-xs">
                                        <span className="font-medium">Tier {school.tier}:</span>{' '}
                                        {school.tier === 1 && 'Premium schools with excellent infrastructure and high fees'}
                                        {school.tier === 2 && 'Quality schools with good facilities and moderate fees'}
                                        {school.tier === 3 && 'Standard schools with basic facilities and affordable fees'}
                                      </p>
                                      <p className="text-xs"><span className="font-medium">Student Strength:</span> {school.studentStrength}</p>
                                      <p className="text-xs"><span className="font-medium">School Fee:</span> {school.schoolFee}</p>
                                      <p className="text-xs"><span className="font-medium">Average Fee:</span> {school.averageFee}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            {selectedSchools.has(school.id) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveSchool(school.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="p-1 bg-blue-50/30 border-r">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-full p-0 rounded-full relative"
                            onClick={() => handleSelectRow(school.id, 'physical')}
                            disabled={!selectedSchools.has(school.id)}
                          >
                            {Array.from(selectedCells).some(key => key.startsWith(`${school.id}|physical|`)) ? (
                              <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              </div>
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        {Array.from({ length: 9 }, (_, i) => {
                          const status = getCellStatus(school.id, 'physical', i);
                          const cellKey = `${school.id}|physical|${i}`; // Use pipe delimiter
                          const isAvailable = !bookingData[school.id].physical[i]; // false = available
                          const hasBookingOfThisType = Array.from(myBookings).some(key => key.startsWith(`${school.id}|physical|`));
                          const isSchoolSelected = selectedSchools.has(school.id);
                          const isDisabled = hasBookingOfThisType || !isAvailable || !isSchoolSelected;
                          return (
                            <td key={`p${i}`} className="p-1 border-r bg-blue-50/10">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => !isDisabled && handleCellClick(school.id, 'physical', i)}
                                      disabled={isDisabled}
                                      className={cn(
                                        'w-full h-12 rounded transition-all flex items-center justify-center font-medium text-xs',
                                        isAvailable && status === 'available' && isSchoolSelected && !hasBookingOfThisType && 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 cursor-pointer shadow-sm',
                                        !isAvailable && 'bg-red-500 cursor-not-allowed text-white font-semibold',
                                        status === 'selected' && 'bg-blue-600 text-white shadow-lg scale-105',
                                        selectedCells.has(cellKey) && isAvailable && 'bg-blue-500 text-white shadow-md',
                                        status === 'disabled' && 'bg-gray-300 cursor-not-allowed text-gray-500',
                                        status === 'not-selected' && isAvailable && 'bg-green-500 text-white cursor-not-allowed'
                                      )}
                                    >
                                      {status === 'selected' && <CheckCircle className="h-5 w-5" />}
                                      {isAvailable && !selectedCells.has(cellKey) && (status === 'available' || status === 'not-selected') && 'P' + (i + 1)}
                                      {selectedCells.has(cellKey) && isAvailable && '✓'}
                                      {!isAvailable && 'P' + (i + 1)}
                                      {status === 'disabled' && 'P' + (i + 1)}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {status === 'not-selected' && <p className="text-xs">Please select the school first</p>}
                                    {!isAvailable && <p className="text-xs">This slot is booked</p>}
                                    {status === 'available' && isSchoolSelected && !hasBookingOfThisType && <p className="text-xs">Click to select this slot</p>}
                                    {status === 'disabled' && hasBookingOfThisType && <p className="text-xs">You already have a booking for this type</p>}
                                    {status === 'selected' && <p className="text-xs">Your confirmed booking</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                          );
                        })}
                        <td className="p-1 bg-purple-50/30 border-l-2 border-r border-purple-300">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-full p-0 rounded-full"
                            onClick={() => handleSelectRow(school.id, 'career')}
                            disabled={!selectedSchools.has(school.id)}
                          >
                            {Array.from(selectedCells).some(key => key.startsWith(`${school.id}|career_fair|`)) ? (
                              <div className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              </div>
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        {Array.from({ length: 20 }, (_, i) => {
                          const status = getCellStatus(school.id, 'career', i);
                          const cellKey = `${school.id}|career_fair|${i}`; // Use pipe delimiter - match database
                          const isAvailable = !bookingData[school.id].career[i]; // false = available
                          const hasBookingOfThisType = Array.from(myBookings).some(key => key.startsWith(`${school.id}|career_fair|`));
                          const isSchoolSelected = selectedSchools.has(school.id);
                          const isDisabled = hasBookingOfThisType || !isAvailable || !isSchoolSelected;
                          return (
                            <td key={`cf${i}`} className="p-1 border-r bg-purple-50/10">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => !isDisabled && handleCellClick(school.id, 'career', i)}
                                      disabled={isDisabled}
                                      className={cn(
                                        'w-full h-12 rounded transition-all flex items-center justify-center font-medium text-xs',
                                        isAvailable && status === 'available' && isSchoolSelected && !hasBookingOfThisType && 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 cursor-pointer shadow-sm',
                                        !isAvailable && 'bg-red-500 cursor-not-allowed text-white font-semibold',
                                        status === 'selected' && 'bg-blue-600 text-white shadow-lg scale-105',
                                        selectedCells.has(cellKey) && isAvailable && 'bg-blue-500 text-white shadow-md',
                                        status === 'disabled' && 'bg-gray-300 cursor-not-allowed text-gray-500',
                                        status === 'not-selected' && isAvailable && 'bg-green-500 text-white cursor-not-allowed'
                                      )}
                                    >
                                      {status === 'selected' && <CheckCircle className="h-5 w-5" />}
                                      {isAvailable && !selectedCells.has(cellKey) && (status === 'available' || status === 'not-selected') && 'CF' + (i + 1)}
                                      {selectedCells.has(cellKey) && isAvailable && '✓'}
                                      {!isAvailable && 'CF' + (i + 1)}
                                      {status === 'disabled' && 'CF' + (i + 1)}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {status === 'not-selected' && <p className="text-xs">Please select the school first</p>}
                                    {!isAvailable && <p className="text-xs">This slot is booked</p>}
                                    {status === 'available' && isSchoolSelected && !hasBookingOfThisType && <p className="text-xs">Click to select this slot</p>}
                                    {status === 'disabled' && hasBookingOfThisType && <p className="text-xs">You already have a booking for this type</p>}
                                    {status === 'selected' && <p className="text-xs">Your confirmed booking</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded shadow-sm"></div>
                  <span className="font-medium">Available (Darker)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded"></div>
                  <span>Booked (Red)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded shadow-md flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded shadow-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">My Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <span>Disabled (Already Booked)</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  disabled={selectedCells.size === 0}
                  onClick={() => setSelectedCells(new Set())}
                >
                  Clear Selection
                </Button>
                <Button 
                  className="gsx-gradient"
                  disabled={selectedCells.size === 0}
                  onClick={handleBookingClick}
                >
                  Confirm Booking ({selectedCells.size})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirm Booking</DialogTitle>
              <DialogDescription>
                Please provide your details
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-3 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">College Name</label>
                <input
                  type="text"
                  value={bookingForm.collegeName}
                  onChange={(e) => setBookingForm({ ...bookingForm, collegeName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter college name"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Your Name</label>
                <input
                  type="text"
                  value={bookingForm.userName}
                  onChange={(e) => setBookingForm({ ...bookingForm, userName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={bookingForm.phoneNumber}
                  onChange={(e) => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter email"
                  required
                />
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-1.5">Selected Sessions ({selectedCells.size}):</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {Array.from(selectedCells).map(cellKey => {
                    const [schoolId, type, index] = cellKey.split('|'); // Use | delimiter
                    const school = schools.find(s => s.id === schoolId);
                    return (
                      <div key={cellKey} className="text-xs text-blue-800 flex items-center gap-1">
                        <span className="font-medium">{school?.name}</span>
                        <span>-</span>
                        <span>{type === 'physical' ? 'P' : 'CF'}{parseInt(index) + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking} className="zs-gradient text-white flex-1">
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Authentication Required</DialogTitle>
              <DialogDescription className="text-center pt-2">
                Please login or register to book sessions
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <Button 
                className="w-full gsx-gradient h-12 text-base"
                onClick={() => navigate('/login')}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login to Your Account
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <Button 
                variant="outline"
                className="w-full h-12 text-base"
                onClick={() => navigate('/register')}
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Create New Account
              </Button>
            </div>
            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setShowAuthDialog(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      )}
    </div>
  );
};

export default CareerFair;

