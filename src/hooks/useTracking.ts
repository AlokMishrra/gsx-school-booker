import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackingService } from '@/services/trackingService';

export const useTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackingService.trackPageView();
  }, [location]);

  return {
    trackClick: trackingService.trackClick.bind(trackingService),
    trackBooking: trackingService.trackBooking.bind(trackingService),
    trackFormSubmit: trackingService.trackFormSubmit.bind(trackingService),
  };
};
