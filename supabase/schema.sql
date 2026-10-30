-- ==============================================================================
-- DOMINION INTERNATIONAL SCHOOL MANAGEMENT SYSTEM (DIS-SMS)
-- Complete PostgreSQL Schema & Initial Data for Supabase
-- Project: Dominion International School (Ajao Estate, Ikeja, Lagos)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES / USERS (Linked to Clerk Authentication user_id)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'org:admin', 'org:member')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 2. STUDENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_no TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    dob DATE NOT NULL,
    class_level TEXT NOT NULL,
    arm TEXT NOT NULL DEFAULT 'Unassigned' CHECK (arm IN ('Emerald', 'Diamond', 'Gold', 'Unassigned')),
    house TEXT NOT NULL DEFAULT 'Unassigned' CHECK (house IN ('Emerald', 'Sapphire', 'Ruby', 'Topaz', 'Unassigned')),
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    guardian_email TEXT,
    address TEXT,
    blood_group TEXT DEFAULT 'O+',
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Alumni')),
    admission_status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (admission_status IN ('Pending Review', 'Ready for Class', 'Enrolled', 'Active')),
    assigned_teacher_id UUID,
    bus_route_id UUID,
    avatar_url TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 3. TEACHERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    assigned_class TEXT,
    assigned_arm TEXT,
    subjects TEXT[] DEFAULT '{}',
    qualification TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 4. SUBJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Core', 'Sciences', 'Arts', 'Vocational', 'Languages')),
    curriculum TEXT NOT NULL CHECK (curriculum IN ('Blended', 'Cambridge', 'Nigerian')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 5. ATTENDANCE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Late', 'Absent', 'Excused')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE (student_id, date)
);

-- ------------------------------------------------------------------------------
-- 6. CONTINUOUS ASSESSMENT & GRADES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    term TEXT NOT NULL CHECK (term IN ('1st Term', '2nd Term', '3rd Term')),
    session TEXT NOT NULL DEFAULT '2026/2027',
    ca1 NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (ca1 >= 0 AND ca1 <= 20),
    ca2 NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (ca2 >= 0 AND ca2 <= 20),
    exam NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (exam >= 0 AND exam <= 60),
    total NUMERIC(5, 2) GENERATED ALWAYS AS (ca1 + ca2 + exam) STORED,
    grade TEXT NOT NULL,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 7. FEE INVOICES & BURSARY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no TEXT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    session TEXT NOT NULL DEFAULT '2026/2027',
    tuition_fee NUMERIC(12, 2) NOT NULL,
    development_levy NUMERIC(12, 2) NOT NULL DEFAULT 35000,
    ict_robotics NUMERIC(12, 2) NOT NULL DEFAULT 30000,
    laboratory_fee NUMERIC(12, 2) DEFAULT 0,
    bus_fee NUMERIC(12, 2) DEFAULT 0,
    lunch_fee NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Partial', 'Unpaid')),
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 8. TRANSPORTATION & FLEET TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bus_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone TEXT NOT NULL,
    route_title TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    vehicle_no TEXT NOT NULL,
    capacity INT NOT NULL,
    registered_students INT NOT NULL DEFAULT 0,
    fee NUMERIC(12, 2) NOT NULL DEFAULT 85000,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance')),
    stops TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 9. ANNOUNCEMENTS & NOTICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    author TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academic', 'Sports', 'Administrative', 'Event')),
    content TEXT NOT NULL,
    target_role TEXT NOT NULL DEFAULT 'All' CHECK (target_role IN ('All', 'Teachers', 'Parents', 'Students')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) - STRICT ROLE & IDENTITY ACCESS POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Helper: Get current user role from profiles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE clerk_id = auth.jwt() ->> 'sub'),
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() ->> 'role',
    'student'
  );
$$;

-- Drop legacy permissive policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read on students" ON public.students;
    DROP POLICY IF EXISTS "Allow auth all on students" ON public.students;
    DROP POLICY IF EXISTS "Allow public read on fee_invoices" ON public.fee_invoices;
    DROP POLICY IF EXISTS "Allow auth all on fee_invoices" ON public.fee_invoices;
    DROP POLICY IF EXISTS "Allow public read on grades" ON public.grades;
    DROP POLICY IF EXISTS "Allow auth all on grades" ON public.grades;
    DROP POLICY IF EXISTS "Allow public read on attendance" ON public.attendance;
    DROP POLICY IF EXISTS "Allow auth all on attendance" ON public.attendance;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- 10.1 PROFILES POLICIES
CREATE POLICY "Users can read profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (clerk_id = auth.jwt() ->> 'sub');

-- 10.2 STUDENTS POLICIES (Role-Segmented)
-- Admin: Full Access
CREATE POLICY "Admin full access on students" ON public.students
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin')
    WITH CHECK (public.current_user_role() = 'admin');

-- Teachers: Can view assigned students and available unassigned claim pool
CREATE POLICY "Teacher view students" ON public.students
    FOR SELECT TO authenticated
    USING (
      public.current_user_role() = 'teacher' 
      AND (admission_status = 'Ready for Class' OR assigned_teacher_id IS NOT NULL)
    );

CREATE POLICY "Teacher claim students" ON public.students
    FOR UPDATE TO authenticated
    USING (public.current_user_role() = 'teacher')
    WITH CHECK (public.current_user_role() = 'teacher');

-- Parents: Can only view their own ward
CREATE POLICY "Parent view own ward" ON public.students
    FOR SELECT TO authenticated
    USING (
      public.current_user_role() = 'parent' 
      AND guardian_email = auth.jwt() ->> 'email'
    );

-- 10.3 GRADES POLICIES
CREATE POLICY "Admin full access on grades" ON public.grades
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Teacher insert and update grades" ON public.grades
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'teacher');

CREATE POLICY "Parent view ward grades" ON public.grades
    FOR SELECT TO authenticated
    USING (
      public.current_user_role() = 'parent'
      AND student_id IN (
        SELECT id FROM public.students WHERE guardian_email = auth.jwt() ->> 'email'
      )
    );

CREATE POLICY "Student view own grades" ON public.grades
    FOR SELECT TO authenticated
    USING (
      public.current_user_role() = 'student'
      AND student_id IN (
        SELECT id FROM public.students WHERE guardian_email = auth.jwt() ->> 'email' OR admission_no = auth.jwt() ->> 'preferred_username'
      )
    );

-- 10.4 FEE INVOICES POLICIES (Protected from students & teachers)
CREATE POLICY "Admin full access on fees" ON public.fee_invoices
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Parent view and pay ward fees" ON public.fee_invoices
    FOR SELECT TO authenticated
    USING (
      public.current_user_role() = 'parent'
      AND student_id IN (
        SELECT id FROM public.students WHERE guardian_email = auth.jwt() ->> 'email'
      )
    );

-- 10.5 ATTENDANCE POLICIES
CREATE POLICY "Admin full access on attendance" ON public.attendance
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Teacher manage class attendance" ON public.attendance
    FOR ALL TO authenticated
    USING (public.current_user_role() = 'teacher');

CREATE POLICY "Parent view ward attendance" ON public.attendance
    FOR SELECT TO authenticated
    USING (
      public.current_user_role() = 'parent'
      AND student_id IN (
        SELECT id FROM public.students WHERE guardian_email = auth.jwt() ->> 'email'
      )
    );

-- 10.6 GENERAL REFERENCE TABLES (Read-only for all, managed by admin)
CREATE POLICY "Everyone read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.current_user_role() = 'admin');

CREATE POLICY "Everyone read bus_routes" ON public.bus_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage bus_routes" ON public.bus_routes FOR ALL TO authenticated USING (public.current_user_role() = 'admin');

CREATE POLICY "Everyone read announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.current_user_role() = 'admin');

CREATE POLICY "Everyone read teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage teachers" ON public.teachers FOR ALL TO authenticated USING (public.current_user_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 11. STORAGE BUCKETS SETUP
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-avatars', 'student-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('report-cards', 'report-cards', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('bursary-receipts', 'bursary-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 12. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- Seed Subjects
INSERT INTO public.subjects (code, name, category, curriculum)
VALUES
    ('MTH101', 'Mathematics', 'Core', 'Blended'),
    ('ENG101', 'English Language', 'Core', 'Blended'),
    ('PHY201', 'Physics', 'Sciences', 'Cambridge'),
    ('CHM201', 'Chemistry', 'Sciences', 'Cambridge'),
    ('BIO201', 'Biology', 'Sciences', 'Blended'),
    ('ROB101', 'Robotics & STEM', 'Vocational', 'Blended'),
    ('CIV101', 'Civic & Social Education', 'Arts', 'Nigerian'),
    ('FRN101', 'French Language', 'Languages', 'Cambridge')
ON CONFLICT (code) DO NOTHING;

-- Seed Bus Routes
INSERT INTO public.bus_routes (zone, route_title, driver_name, driver_phone, vehicle_no, capacity, registered_students, stops)
VALUES
    ('Zone A', 'Ajao Estate - Airport Road - Chivita Axis', 'Mr. Kenneth Obi', '+234 803 234 5678', 'JJJ-842-EK (Coaster 1)', 32, 28, ARRAY['Asa Afariogun', 'Stella Sholanke', 'Chivita Junction', 'Ajao Roundabout']),
    ('Zone B', 'Mafoluku - Oshodi - Airport Junction', 'Mr. Lateef Sanusi', '+234 802 345 6789', 'KJA-512-AB (Coaster 2)', 32, 24, ARRAY['Airport View Cres', 'Mafoluku Rd', 'Oshodi Bus Terminal', 'Murtala Muhammed Way']),
    ('Zone C', 'Isolo - Ago Palace Way - Okota Axis', 'Mr. Paul Agbo', '+234 809 456 7890', 'LSR-329-XY (Toyota HiAce)', 18, 17, ARRAY['Ago Palace Way', 'Century Roundabout', 'Isolo Bus Stop', 'Oke-Afa'])
ON CONFLICT DO NOTHING;

-- Seed Announcements
INSERT INTO public.announcements (title, author, category, content, target_role)
VALUES
    ('Inter-House Sports Championship 2026 Kickoff', 'Sports Directorate (Coach Williams)', 'Sports', 'The 2026 Annual Inter-House Track & Field Heats will commence this Friday at the Main Sports Pavilion. All house masters (Emerald, Sapphire, Ruby, Topaz) must ensure students are in their correct house jerseys.', 'All'),
    ('Cambridge Checkpoint & BECE Mock Registrations', 'Vice Principal (Academics)', 'Academic', 'Mock examination timetables for JSS 3 and SSS 3 have been uploaded. Parents are requested to confirm candidate passport photos with the examination officer.', 'Parents'),
    ('Robotics & STEM Exhibition Showcase', 'Head of ICT & STEM', 'Event', 'Dominion students will showcase their autonomous warehouse rover and AI greenhouse project in the Central Auditorium on Parents Visiting Day.', 'All')
ON CONFLICT DO NOTHING;
