import { supabase } from '@/integrations/supabase/client';

export interface TrackingEvent {
  event_type: 'page_view' | 'click' | 'booking' | 'form_submit' | 'session_start' | 'session_end';
  page_url?: string;
  element_id?: string;
  element_text?: string;
  metadata?: Record<string, any>;
}

class TrackingService {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initializeTracking();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('zs_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('zs_session_id', sessionId);
    }
    return sessionId;
  }

  private async initializeTracking() {
    // Track session start
    await this.track({
      event_type: 'session_start',
      page_url: window.location.href,
      metadata: {
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer,
      },
    });

    // Track page views on navigation
    this.trackPageView();

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.track({
        event_type: 'session_end',
        page_url: window.location.href,
      });
    });
  }

  async track(event: TrackingEvent) {
    try {
      const { error } = await supabase.from('user_tracking').insert({
        session_id: this.sessionId,
        user_id: this.userId,
        event_type: event.event_type,
        page_url: event.page_url || window.location.href,
        element_id: event.element_id,
        element_text: event.element_text,
        metadata: event.metadata,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('Tracking error:', error);
      }
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }

  trackPageView() {
    this.track({
      event_type: 'page_view',
      page_url: window.location.href,
      metadata: {
        title: document.title,
      },
    });
  }

  trackClick(elementId: string, elementText?: string, metadata?: Record<string, any>) {
    this.track({
      event_type: 'click',
      element_id: elementId,
      element_text: elementText,
      metadata,
    });
  }

  trackBooking(bookingData: Record<string, any>) {
    this.track({
      event_type: 'booking',
      metadata: bookingData,
    });
  }

  trackFormSubmit(formName: string, formData?: Record<string, any>) {
    this.track({
      event_type: 'form_submit',
      element_id: formName,
      metadata: formData,
    });
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const trackingService = new TrackingService();
