-- =====================================================
-- ADD SCHOOLS FROM ALL INDIAN STATES
-- This script adds schools from all 28 states and 8 UTs
-- =====================================================

-- Clear existing schools (optional - comment out if you want to keep existing data)
-- DELETE FROM public.schools;

-- =====================================================
-- NORTHERN STATES
-- =====================================================

-- DELHI
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'New Delhi', 'Delhi', 1, 2500, '₹50,000', '₹45,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Mathura Road, New Delhi', 'dps.delhi@school.edu', '+91-9876543210', 'Premier educational institution', true),
    ('Modern School', 'New Delhi', 'Delhi', 1, 2200, '₹48,000', '₹46,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Barakhamba Road, New Delhi', 'modern.delhi@school.edu', '+91-9876543211', 'Premier educational institution', true),
    ('Sanskriti School', 'New Delhi', 'Delhi', 2, 1800, '₹40,000', '₹38,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Chanakyapuri, New Delhi', 'sanskriti@school.edu', '+91-9876543212', 'Quality educational institution', true);

-- PUNJAB
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Doon School Ludhiana', 'Ludhiana', 'Punjab', 1, 2000, '₹45,000', '₹42,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Civil Lines, Ludhiana', 'doon.ludhiana@school.edu', '+91-9876543213', 'Premier educational institution', true),
    ('Sacred Heart Convent', 'Amritsar', 'Punjab', 2, 1600, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Mall Road, Amritsar', 'shc.amritsar@school.edu', '+91-9876543214', 'Quality educational institution', true);

-- HARYANA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('The Heritage School', 'Gurgaon', 'Haryana', 1, 3200, '₹70,000', '₹68,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Sector 62, Gurgaon', 'heritage.gurgaon@school.edu', '+91-9876543215', 'Premier educational institution', true),
    ('DAV Public School', 'Faridabad', 'Haryana', 2, 1900, '₹38,000', '₹36,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Sector 14, Faridabad', 'dav.faridabad@school.edu', '+91-9876543216', 'Quality educational institution', true);

-- UTTAR PRADESH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('La Martiniere College', 'Lucknow', 'Uttar Pradesh', 1, 2400, '₹42,000', '₹40,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Hazratganj, Lucknow', 'lamartiniere.lucknow@school.edu', '+91-9876543217', 'Premier educational institution', true),
    ('City Montessori School', 'Lucknow', 'Uttar Pradesh', 2, 5000, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Gomti Nagar, Lucknow', 'cms.lucknow@school.edu', '+91-9876543218', 'Quality educational institution', true),
    ('St. Joseph College', 'Allahabad', 'Uttar Pradesh', 2, 1700, '₹32,000', '₹30,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Civil Lines, Allahabad', 'stjoseph.allahabad@school.edu', '+91-9876543219', 'Quality educational institution', true);

-- RAJASTHAN
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Mayo College', 'Ajmer', 'Rajasthan', 1, 1800, '₹55,000', '₹52,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Mayo Link Road, Ajmer', 'mayo.ajmer@school.edu', '+91-9876543220', 'Premier educational institution', true),
    ('Maharani Gayatri Devi School', 'Jaipur', 'Rajasthan', 1, 2000, '₹48,000', '₹46,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Rambagh Circle, Jaipur', 'mgd.jaipur@school.edu', '+91-9876543221', 'Premier educational institution', true);

-- HIMACHAL PRADESH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Bishop Cotton School', 'Shimla', 'Himachal Pradesh', 1, 1500, '₹60,000', '₹58,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Chotta Shimla, Shimla', 'bcs.shimla@school.edu', '+91-9876543222', 'Premier educational institution', true),
    ('St. Edwards School', 'Shimla', 'Himachal Pradesh', 2, 1200, '₹45,000', '₹43,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Chharabra, Shimla', 'stedwards.shimla@school.edu', '+91-9876543223', 'Quality educational institution', true);

-- JAMMU & KASHMIR
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Tyndale Biscoe School', 'Srinagar', 'Jammu & Kashmir', 2, 1400, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Bund, Srinagar', 'tyndale.srinagar@school.edu', '+91-9876543224', 'Quality educational institution', true),
    ('Delhi Public School', 'Jammu', 'Jammu & Kashmir', 1, 1800, '₹40,000', '₹38,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Jammu Cantt, Jammu', 'dps.jammu@school.edu', '+91-9876543225', 'Premier educational institution', true);

-- =====================================================
-- WESTERN STATES
-- =====================================================

-- MAHARASHTRA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Cathedral & John Connon School', 'Mumbai', 'Maharashtra', 1, 2800, '₹65,000', '₹62,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Fort, Mumbai', 'cathedral.mumbai@school.edu', '+91-9876543226', 'Premier educational institution', true),
    ('Campion School', 'Mumbai', 'Maharashtra', 1, 2400, '₹58,000', '₹56,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Cooperage, Mumbai', 'campion.mumbai@school.edu', '+91-9876543227', 'Premier educational institution', true),
    ('Symbiosis International School', 'Pune', 'Maharashtra', 1, 2200, '₹52,000', '₹50,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Viman Nagar, Pune', 'symbiosis.pune@school.edu', '+91-9876543228', 'Premier educational institution', true),
    ('Vibgyor High School', 'Pune', 'Maharashtra', 2, 1900, '₹42,000', '₹40,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Balewadi, Pune', 'vibgyor.pune@school.edu', '+91-9876543229', 'Quality educational institution', true);

-- GUJARAT
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Udgam School', 'Ahmedabad', 'Gujarat', 1, 2100, '₹48,000', '₹46,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Thaltej, Ahmedabad', 'udgam.ahmedabad@school.edu', '+91-9876543230', 'Premier educational institution', true),
    ('Zebar School', 'Ahmedabad', 'Gujarat', 2, 1800, '₹40,000', '₹38,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Satellite, Ahmedabad', 'zebar.ahmedabad@school.edu', '+91-9876543231', 'Quality educational institution', true),
    ('Delhi Public School', 'Vadodara', 'Gujarat', 1, 2000, '₹45,000', '₹43,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Manjalpur, Vadodara', 'dps.vadodara@school.edu', '+91-9876543232', 'Premier educational institution', true);

-- GOA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Sharada Mandir School', 'Panaji', 'Goa', 2, 1500, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Miramar, Panaji', 'sharada.panaji@school.edu', '+91-9876543233', 'Quality educational institution', true),
    ('Carmel School', 'Margao', 'Goa', 2, 1300, '₹32,000', '₹30,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Nuvem, Margao', 'carmel.margao@school.edu', '+91-9876543234', 'Quality educational institution', true);

-- =====================================================
-- SOUTHERN STATES
-- =====================================================

-- KARNATAKA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Bishop Cotton Boys School', 'Bangalore', 'Karnataka', 1, 2300, '₹55,000', '₹52,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'St. Marks Road, Bangalore', 'bcbs.bangalore@school.edu', '+91-9876543235', 'Premier educational institution', true),
    ('National Public School', 'Bangalore', 'Karnataka', 1, 2600, '₹58,000', '₹56,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Koramangala, Bangalore', 'nps.bangalore@school.edu', '+91-9876543236', 'Premier educational institution', true),
    ('Inventure Academy', 'Bangalore', 'Karnataka', 1, 1900, '₹62,000', '₹60,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Whitefield, Bangalore', 'inventure.bangalore@school.edu', '+91-9876543237', 'Premier educational institution', true);

-- TAMIL NADU
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Padma Seshadri Bala Bhavan', 'Chennai', 'Tamil Nadu', 1, 2400, '₹48,000', '₹46,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Nungambakkam, Chennai', 'psbb.chennai@school.edu', '+91-9876543238', 'Premier educational institution', true),
    ('Chettinad Vidyashram', 'Chennai', 'Tamil Nadu', 1, 2100, '₹52,000', '₹50,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'RA Puram, Chennai', 'chettinad.chennai@school.edu', '+91-9876543239', 'Premier educational institution', true),
    ('Kendriya Vidyalaya', 'Coimbatore', 'Tamil Nadu', 2, 1600, '₹28,000', '₹26,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Peelamedu, Coimbatore', 'kv.coimbatore@school.edu', '+91-9876543240', 'Quality educational institution', true);

-- KERALA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Rajagiri Public School', 'Kochi', 'Kerala', 1, 2000, '₹45,000', '₹43,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Kalamassery, Kochi', 'rajagiri.kochi@school.edu', '+91-9876543241', 'Premier educational institution', true),
    ('Chinmaya Vidyalaya', 'Thiruvananthapuram', 'Kerala', 2, 1700, '₹38,000', '₹36,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Vazhuthacaud, Thiruvananthapuram', 'chinmaya.tvm@school.edu', '+91-9876543242', 'Quality educational institution', true);

-- ANDHRA PRADESH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Oakridge International School', 'Hyderabad', 'Andhra Pradesh', 1, 2200, '₹65,000', '₹62,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Gachibowli, Hyderabad', 'oakridge.hyderabad@school.edu', '+91-9876543243', 'Premier educational institution', true),
    ('Chirec International School', 'Hyderabad', 'Andhra Pradesh', 1, 1900, '₹58,000', '₹56,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Kondapur, Hyderabad', 'chirec.hyderabad@school.edu', '+91-9876543244', 'Premier educational institution', true);

-- TELANGANA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Hyderabad', 'Telangana', 1, 2500, '₹55,000', '₹52,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Nacharam, Hyderabad', 'dps.hyderabad@school.edu', '+91-9876543245', 'Premier educational institution', true),
    ('Glendale Academy', 'Hyderabad', 'Telangana', 2, 1800, '₹42,000', '₹40,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Patancheru, Hyderabad', 'glendale.hyderabad@school.edu', '+91-9876543246', 'Quality educational institution', true);

-- =====================================================
-- EASTERN STATES
-- =====================================================

-- WEST BENGAL
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('La Martiniere for Boys', 'Kolkata', 'West Bengal', 1, 2300, '₹48,000', '₹46,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Loudon Street, Kolkata', 'lamartiniere.kolkata@school.edu', '+91-9876543247', 'Premier educational institution', true),
    ('St. Xaviers Collegiate School', 'Kolkata', 'West Bengal', 1, 2500, '₹52,000', '₹50,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Park Street, Kolkata', 'stxaviers.kolkata@school.edu', '+91-9876543248', 'Premier educational institution', true),
    ('South Point High School', 'Kolkata', 'West Bengal', 2, 2000, '₹40,000', '₹38,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Ballygunge, Kolkata', 'southpoint.kolkata@school.edu', '+91-9876543249', 'Quality educational institution', true);

-- ODISHA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('DAV Public School', 'Bhubaneswar', 'Odisha', 2, 1800, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Chandrasekharpur, Bhubaneswar', 'dav.bhubaneswar@school.edu', '+91-9876543250', 'Quality educational institution', true),
    ('Delhi Public School', 'Bhubaneswar', 'Odisha', 1, 2000, '₹42,000', '₹40,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Kalinga Nagar, Bhubaneswar', 'dps.bhubaneswar@school.edu', '+91-9876543251', 'Premier educational institution', true);

-- BIHAR
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Patna', 'Bihar', 1, 2100, '₹38,000', '₹36,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Patliputra Colony, Patna', 'dps.patna@school.edu', '+91-9876543252', 'Premier educational institution', true),
    ('Notre Dame Academy', 'Patna', 'Bihar', 2, 1600, '₹32,000', '₹30,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Digha, Patna', 'notredame.patna@school.edu', '+91-9876543253', 'Quality educational institution', true);

-- JHARKHAND
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Ranchi', 'Jharkhand', 1, 1900, '₹40,000', '₹38,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Mecon Colony, Ranchi', 'dps.ranchi@school.edu', '+91-9876543254', 'Premier educational institution', true),
    ('DAV Public School', 'Jamshedpur', 'Jharkhand', 2, 1700, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Bistupur, Jamshedpur', 'dav.jamshedpur@school.edu', '+91-9876543255', 'Quality educational institution', true);

-- =====================================================
-- NORTHEASTERN STATES
-- =====================================================

-- ASSAM
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Guwahati', 'Assam', 1, 1800, '₹38,000', '₹36,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Boragaon, Guwahati', 'dps.guwahati@school.edu', '+91-9876543256', 'Premier educational institution', true),
    ('Don Bosco School', 'Guwahati', 'Assam', 2, 1500, '₹32,000', '₹30,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Panbazar, Guwahati', 'donbosco.guwahati@school.edu', '+91-9876543257', 'Quality educational institution', true);

-- MEGHALAYA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('St. Edmunds School', 'Shillong', 'Meghalaya', 2, 1200, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Laitumkhrah, Shillong', 'stedmunds.shillong@school.edu', '+91-9876543258', 'Quality educational institution', true),
    ('Pine Mount School', 'Shillong', 'Meghalaya', 2, 1000, '₹30,000', '₹28,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Mawkhar, Shillong', 'pinemount.shillong@school.edu', '+91-9876543259', 'Quality educational institution', true);

-- MANIPUR
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Kendriya Vidyalaya', 'Imphal', 'Manipur', 2, 1300, '₹28,000', '₹26,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Langjing, Imphal', 'kv.imphal@school.edu', '+91-9876543260', 'Quality educational institution', true);

-- TRIPURA
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Ramakrishna Mission Vidyalaya', 'Agartala', 'Tripura', 2, 1400, '₹30,000', '₹28,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Kunjaban, Agartala', 'rkmv.agartala@school.edu', '+91-9876543261', 'Quality educational institution', true);

-- NAGALAND
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Kendriya Vidyalaya', 'Kohima', 'Nagaland', 2, 1200, '₹28,000', '₹26,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Kohima Village, Kohima', 'kv.kohima@school.edu', '+91-9876543262', 'Quality educational institution', true);

-- MIZORAM
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Kendriya Vidyalaya', 'Aizawl', 'Mizoram', 2, 1100, '₹28,000', '₹26,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Chaltlang, Aizawl', 'kv.aizawl@school.edu', '+91-9876543263', 'Quality educational institution', true);

-- ARUNACHAL PRADESH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Kendriya Vidyalaya', 'Itanagar', 'Arunachal Pradesh', 2, 1000, '₹28,000', '₹26,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Naharlagun, Itanagar', 'kv.itanagar@school.edu', '+91-9876543264', 'Quality educational institution', true);

-- SIKKIM
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Tashi Namgyal Academy', 'Gangtok', 'Sikkim', 2, 1300, '₹32,000', '₹30,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Development Area, Gangtok', 'tna.gangtok@school.edu', '+91-9876543265', 'Quality educational institution', true);

-- =====================================================
-- CENTRAL STATES
-- =====================================================

-- MADHYA PRADESH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Indore', 'Madhya Pradesh', 1, 2200, '₹42,000', '₹40,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'AB Road, Indore', 'dps.indore@school.edu', '+91-9876543266', 'Premier educational institution', true),
    ('Choithram School', 'Indore', 'Madhya Pradesh', 2, 1900, '₹38,000', '₹36,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Manik Bagh Road, Indore', 'choithram.indore@school.edu', '+91-9876543267', 'Quality educational institution', true),
    ('Campion School', 'Bhopal', 'Madhya Pradesh', 2, 1700, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Arera Colony, Bhopal', 'campion.bhopal@school.edu', '+91-9876543268', 'Quality educational institution', true);

-- CHHATTISGARH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Raipur', 'Chhattisgarh', 1, 1900, '₹38,000', '₹36,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Mowa, Raipur', 'dps.raipur@school.edu', '+91-9876543269', 'Premier educational institution', true),
    ('DAV Public School', 'Bhilai', 'Chhattisgarh', 2, 1600, '₹32,000', '₹30,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Sector 6, Bhilai', 'dav.bhilai@school.edu', '+91-9876543270', 'Quality educational institution', true);

-- UTTARAKHAND
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('The Doon School', 'Dehradun', 'Uttarakhand', 1, 1800, '₹75,000', '₹72,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Mall Road, Dehradun', 'doonschool.dehradun@school.edu', '+91-9876543271', 'Premier educational institution', true),
    ('Welham Girls School', 'Dehradun', 'Uttarakhand', 1, 1500, '₹68,000', '₹65,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Dalanwala, Dehradun', 'welham.dehradun@school.edu', '+91-9876543272', 'Premier educational institution', true),
    ('Woodstock School', 'Mussoorie', 'Uttarakhand', 1, 1200, '₹70,000', '₹68,000', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', 'Landour, Mussoorie', 'woodstock.mussoorie@school.edu', '+91-9876543273', 'Premier educational institution', true);

-- =====================================================
-- UNION TERRITORIES
-- =====================================================

-- CHANDIGARH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Delhi Public School', 'Chandigarh', 'Chandigarh', 1, 2300, '₹48,000', '₹46,000', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400', 'Sector 40, Chandigarh', 'dps.chandigarh@school.edu', '+91-9876543274', 'Premier educational institution', true),
    ('St. Johns High School', 'Chandigarh', 'Chandigarh', 2, 1900, '₹40,000', '₹38,000', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400', 'Sector 26, Chandigarh', 'stjohns.chandigarh@school.edu', '+91-9876543275', 'Quality educational institution', true);

-- PUDUCHERRY
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Petit Seminaire Higher Secondary School', 'Puducherry', 'Puducherry', 2, 1600, '₹35,000', '₹33,000', 'https://images.unsplash.com/photo-1562774053-701939374585?w=400', 'Mission Street, Puducherry', 'petitseminaire.puducherry@school.edu', '+91-9876543276', 'Quality educational institution', true);

-- ANDAMAN & NICOBAR ISLANDS
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Kendriya Vidyalaya', 'Port Blair', 'Andaman & Nicobar Islands', 2, 1200, '₹28,000', '₹26,000', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400', 'Haddo, Port Blair', 'kv.portblair@school.edu', '+91-9876543277', 'Quality educational institution', true);

-- DADRA & NAGAR HAVELI AND DAMAN & DIU
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Kendriya Vidyalaya', 'Silvassa', 'Dadra & Nagar Haveli and Daman & Diu', 2, 1100, '₹28,000', '₹26,000', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400', 'Khanvel, Silvassa', 'kv.silvassa@school.edu', '+91-9876543278', 'Quality educational institution', true);

-- LAKSHADWEEP
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Kendriya Vidyalaya', 'Kavaratti', 'Lakshadweep', 2, 800, '₹25,000', '₹23,000', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400', 'Kavaratti Island', 'kv.kavaratti@school.edu', '+91-9876543279', 'Quality educational institution', true);

-- LADAKH
INSERT INTO public.schools (name, city, state, tier, student_strength, school_fee, average_fee, image_url, address, contact_email, contact_phone, description, is_active)
VALUES
    ('Lamdon Model School', 'Leh', 'Ladakh', 2, 1000, '₹30,000', '₹28,000', 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400', 'Choglamsar, Leh', 'lamdon.leh@school.edu', '+91-9876543280', 'Quality educational institution', true);


-- =====================================================
-- CREATE SESSIONS FOR ALL NEW SCHOOLS
-- =====================================================

-- This will create 9 physical sessions and 20 career fair sessions for each school
DO $$
DECLARE
    school_record RECORD;
    i INTEGER;
BEGIN
    FOR school_record IN SELECT id FROM public.schools WHERE is_active = true LOOP
        -- Create 9 physical session slots (P1-P9)
        FOR i IN 1..9 LOOP
            INSERT INTO public.career_fair_sessions (
                school_id, session_type, slot_number, 
                session_date, start_time, end_time, is_booked
            ) VALUES (
                school_record.id,
                'physical',
                i,
                CURRENT_DATE + (i % 30),
                '09:00:00',
                '17:00:00',
                false
            )
            ON CONFLICT (school_id, session_type, slot_number) DO NOTHING;
        END LOOP;
        
        -- Create 20 career fair slots (CF1-CF20)
        FOR i IN 1..20 LOOP
            INSERT INTO public.career_fair_sessions (
                school_id, session_type, slot_number,
                session_date, start_time, end_time, is_booked
            ) VALUES (
                school_record.id,
                'career_fair',
                i,
                CURRENT_DATE + (i % 60),
                '10:00:00',
                '16:00:00',
                false
            )
            ON CONFLICT (school_id, session_type, slot_number) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count schools by state
SELECT 
    state,
    COUNT(*) as total_schools,
    SUM(CASE WHEN tier = 1 THEN 1 ELSE 0 END) as tier1_schools,
    SUM(CASE WHEN tier = 2 THEN 1 ELSE 0 END) as tier2_schools,
    SUM(CASE WHEN tier = 3 THEN 1 ELSE 0 END) as tier3_schools
FROM public.schools
WHERE is_active = true
GROUP BY state
ORDER BY state;

-- Count total schools
SELECT COUNT(*) as total_schools FROM public.schools WHERE is_active = true;

-- Count sessions created
SELECT 
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE session_type = 'physical') as physical_sessions,
    COUNT(*) FILTER (WHERE session_type = 'career_fair') as career_fair_sessions
FROM public.career_fair_sessions;

-- List all unique states
SELECT DISTINCT state 
FROM public.schools 
WHERE is_active = true 
ORDER BY state;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    v_total_schools INTEGER;
    v_total_states INTEGER;
    v_total_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_schools FROM public.schools WHERE is_active = true;
    SELECT COUNT(DISTINCT state) INTO v_total_states FROM public.schools WHERE is_active = true;
    SELECT COUNT(*) INTO v_total_sessions FROM public.career_fair_sessions;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ALL STATES SCHOOLS ADDED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Total Schools: %', v_total_schools;
    RAISE NOTICE '📍 Total States/UTs: %', v_total_states;
    RAISE NOTICE '📅 Total Sessions: %', v_total_sessions;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 COVERAGE:';
    RAISE NOTICE '✅ All 28 States covered';
    RAISE NOTICE '✅ All 8 Union Territories covered';
    RAISE NOTICE '✅ Sessions created for all schools';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- NOTES
-- =====================================================

/*
STATES COVERED (28):
1. Andhra Pradesh
2. Arunachal Pradesh
3. Assam
4. Bihar
5. Chhattisgarh
6. Goa
7. Gujarat
8. Haryana
9. Himachal Pradesh
10. Jharkhand
11. Karnataka
12. Kerala
13. Madhya Pradesh
14. Maharashtra
15. Manipur
16. Meghalaya
17. Mizoram
18. Nagaland
19. Odisha
20. Punjab
21. Rajasthan
22. Sikkim
23. Tamil Nadu
24. Telangana
25. Tripura
26. Uttar Pradesh
27. Uttarakhand
28. West Bengal

UNION TERRITORIES COVERED (8):
1. Andaman & Nicobar Islands
2. Chandigarh
3. Dadra & Nagar Haveli and Daman & Diu
4. Delhi
5. Jammu & Kashmir
6. Ladakh
7. Lakshadweep
8. Puducherry

TOTAL: 36 States/UTs covered
*/
