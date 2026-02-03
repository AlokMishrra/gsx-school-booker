-- Add city and state columns to schools table
ALTER TABLE public.schools 
ADD COLUMN city TEXT,
ADD COLUMN state TEXT;

-- Create index for location-based queries
CREATE INDEX idx_schools_city_state ON public.schools(city, state);

-- Insert sample schools with locations and inventory
INSERT INTO public.schools (name, address, city, state, contact_email, contact_phone, description) VALUES
('Delhi Public School', '123 Sector 21, Dwarka', 'Delhi', 'Delhi', 'dps.dwarka@example.com', '9876543210', 'Premier educational institution with state-of-the-art facilities including sports complex, auditorium, and labs.'),
('St. Xavier''s High School', '45 Linking Road, Bandra', 'Mumbai', 'Maharashtra', 'stxaviers.mumbai@example.com', '9876543211', 'Historic school with excellent sports facilities and modern equipment.'),
('Bangalore International School', '78 Whitefield Main Road', 'Bangalore', 'Karnataka', 'bis.bangalore@example.com', '9876543212', 'International curriculum school with Olympic-size pool and indoor stadium.'),
('Chennai Public School', '234 Anna Nagar', 'Chennai', 'Tamil Nadu', 'cps.chennai@example.com', '9876543213', 'Leading school with cricket ground, basketball courts, and science labs.'),
('Kolkata Modern School', '567 Salt Lake City', 'Kolkata', 'West Bengal', 'kms.kolkata@example.com', '9876543214', 'Well-equipped school with football field and performing arts center.'),
('Hyderabad Grammar School', '89 Jubilee Hills', 'Hyderabad', 'Telangana', 'hgs.hyderabad@example.com', '9876543215', 'Premium school with tennis courts and robotics lab.'),
('Pune Central School', '12 Koregaon Park', 'Pune', 'Maharashtra', 'pcs.pune@example.com', '9876543216', 'Modern school with swimming pool and music studio.'),
('Jaipur Royal Academy', '345 C-Scheme', 'Jaipur', 'Rajasthan', 'jra.jaipur@example.com', '9876543217', 'Heritage school with polo ground and art gallery.'),
('Ahmedabad Science School', '678 SG Highway', 'Ahmedabad', 'Gujarat', 'ass.ahmedabad@example.com', '9876543218', 'STEM-focused school with advanced labs and maker space.'),
('Lucknow Model School', '90 Gomti Nagar', 'Lucknow', 'Uttar Pradesh', 'lms.lucknow@example.com', '9876543219', 'Comprehensive school with badminton courts and theater.');

-- Get school IDs and insert inventory items
DO $$
DECLARE
  school_rec RECORD;
BEGIN
  FOR school_rec IN SELECT id, name FROM public.schools LOOP
    -- Add facilities
    INSERT INTO public.inventory_items (school_id, name, description, item_type, price_per_hour, quantity_available) VALUES
    (school_rec.id, 'Auditorium', 'Large air-conditioned auditorium with 500 seats, stage, and sound system', 'facility', 2500, 1),
    (school_rec.id, 'Computer Lab', 'Modern computer lab with 40 workstations and high-speed internet', 'facility', 1500, 1),
    (school_rec.id, 'Sports Ground', 'Multi-purpose sports ground for cricket, football, and athletics', 'facility', 2000, 1),
    (school_rec.id, 'Conference Room', 'Fully equipped conference room with projector and video conferencing', 'facility', 800, 2);
    
    -- Add equipment
    INSERT INTO public.inventory_items (school_id, name, description, item_type, price_per_hour, quantity_available) VALUES
    (school_rec.id, 'Projector', 'HD projector with screen and HDMI connectivity', 'equipment', 200, 5),
    (school_rec.id, 'PA System', 'Professional PA system with wireless microphones', 'equipment', 350, 3),
    (school_rec.id, 'Sports Kit', 'Complete sports equipment kit including balls, bats, and nets', 'equipment', 150, 10),
    (school_rec.id, 'Science Lab Kit', 'Portable science lab equipment for experiments', 'equipment', 250, 4);
  END LOOP;
END $$;