-- Create user_tracking table for analytics
CREATE TABLE IF NOT EXISTS user_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'click', 'booking', 'form_submit', 'session_start', 'session_end')),
  page_url TEXT,
  element_id TEXT,
  element_text TEXT,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_tracking_session_id ON user_tracking(session_id);
CREATE INDEX idx_user_tracking_user_id ON user_tracking(user_id);
CREATE INDEX idx_user_tracking_event_type ON user_tracking(event_type);
CREATE INDEX idx_user_tracking_timestamp ON user_tracking(timestamp DESC);
CREATE INDEX idx_user_tracking_created_at ON user_tracking(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert tracking data
CREATE POLICY "Anyone can insert tracking data"
  ON user_tracking
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only admins can view tracking data
CREATE POLICY "Admins can view all tracking data"
  ON user_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM colleges
      WHERE colleges.id = auth.uid()
      AND colleges.role = 'admin'
    )
  );

-- Create a view for analytics summary
CREATE OR REPLACE VIEW tracking_analytics AS
SELECT 
  DATE(timestamp) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM user_tracking
GROUP BY DATE(timestamp), event_type
ORDER BY date DESC, event_count DESC;

-- Grant access to the view
GRANT SELECT ON tracking_analytics TO authenticated;
