import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { SimpleSchoolCard } from '@/components/schools/SimpleSchoolCard';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Building2, X, ArrowRight, CheckCircle, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Schools = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('zs_onboarding_complete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('gsx_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, address, city, state')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Extract unique states and cities
  const { states, citiesByState } = useMemo(() => {
    if (!schools) return { states: [], citiesByState: {} };
    
    const stateSet = new Set<string>();
    const cityMap: Record<string, Set<string>> = {};
    
    schools.forEach(school => {
      if (school.state) {
        stateSet.add(school.state);
        if (!cityMap[school.state]) {
          cityMap[school.state] = new Set();
        }
        if (school.city) {
          cityMap[school.state].add(school.city);
        }
      }
    });
    
    const citiesByState: Record<string, string[]> = {};
    Object.entries(cityMap).forEach(([state, cities]) => {
      citiesByState[state] = Array.from(cities).sort();
    });
    
    return {
      states: Array.from(stateSet).sort(),
      citiesByState,
    };
  }, [schools]);

  const availableCities = selectedState !== 'all' ? citiesByState[selectedState] || [] : [];

  const filteredSchools = useMemo(() => {
    if (!schools) return [];
    
    return schools.filter((school) => {
      const matchesSearch = 
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (school.city?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (school.state?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesState = selectedState === 'all' || school.state === selectedState;
      const matchesCity = selectedCity === 'all' || school.city === selectedCity;
      
      return matchesSearch && matchesState && matchesCity;
    });
  }, [schools, searchQuery, selectedState, selectedCity]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity('all');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedState('all');
    setSelectedCity('all');
  };

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      }
      return [...prev, schoolId];
    });
  };

  const handleProceedToBooking = () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to book schools',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (selectedSchools.length === 0) {
      toast({
        title: 'No schools selected',
        description: 'Please select at least one school to continue',
        variant: 'destructive',
      });
      return;
    }

    // Store selected schools in session storage
    const selectedSchoolData = schools?.filter(s => selectedSchools.includes(s.id)) || [];
    sessionStorage.setItem('selectedSchools', JSON.stringify(selectedSchoolData));
    navigate('/payment');
  };

  const hasActiveFilters = searchQuery || selectedState !== 'all' || selectedCity !== 'all';

  // Select all visible schools
  const handleSelectAll = () => {
    const allVisibleIds = filteredSchools.map(s => s.id);
    const allSelected = allVisibleIds.every(id => selectedSchools.includes(id));
    
    if (allSelected) {
      // Deselect all visible
      setSelectedSchools(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      // Select all visible
      setSelectedSchools(prev => [...new Set([...prev, ...allVisibleIds])]);
    }
  };

  const allVisibleSelected = filteredSchools.length > 0 && 
    filteredSchools.every(s => selectedSchools.includes(s.id));

  return (
    <MainLayout>
      {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
      
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="mb-2 text-3xl font-bold">Select Schools</h1>
          <p className="text-muted-foreground">
            Choose schools to book and proceed directly to payment
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm animate-slide-up">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* State Filter */}
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger>
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select 
              value={selectedCity} 
              onValueChange={setSelectedCity}
              disabled={selectedState === 'all'}
            >
              <SelectTrigger>
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 animate-scale-in">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedState !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedState}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleStateChange('all')} />
                </Badge>
              )}
              {selectedCity !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCity}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCity('all')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count & Selection Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''}
            </p>
            {filteredSchools.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-8 gap-2"
              >
                {allVisibleSelected ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    Select All ({filteredSchools.length})
                  </>
                )}
              </Button>
            )}
          </div>
          {selectedSchools.length > 0 && (
            <Badge variant="secondary" className="animate-scale-in border border-primary">
              <CheckCircle className="mr-1 h-3 w-3" />
              {selectedSchools.length} selected
            </Badge>
          )}
        </div>

        {/* Schools Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : filteredSchools && filteredSchools.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchools.map((school, index) => (
              <div 
                key={school.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <SimpleSchoolCard 
                  school={school} 
                  isSelected={selectedSchools.includes(school.id)}
                  onSelect={handleSchoolSelect}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center animate-fade-in">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {hasActiveFilters 
                ? 'No schools found matching your filters.' 
                : 'No schools available at the moment.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Floating Action Bar */}
        {selectedSchools.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
            <Card className="shadow-lg border-foreground/20 bg-card">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="text-sm">
                  <span className="font-semibold">{selectedSchools.length}</span>
                  <span className="text-muted-foreground ml-1">
                    school{selectedSchools.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button onClick={handleProceedToBooking}>
                  Proceed to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Schools;
