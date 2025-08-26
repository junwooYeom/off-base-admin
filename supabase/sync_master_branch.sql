-- Complete schema sync from main branch to master branch
-- Generated on 2025-08-07

-- Drop existing objects if they exist (to ensure clean sync)
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.user_verification_documents CASCADE;
DROP TABLE IF EXISTS public.property_reports CASCADE;
DROP TABLE IF EXISTS public.property_media CASCADE;
DROP TABLE IF EXISTS public.property_documents CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.realtor_companies CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS public.direction CASCADE;
DROP TYPE IF EXISTS public.direction_type CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.media_type CASCADE;
DROP TYPE IF EXISTS public.property_type CASCADE;
DROP TYPE IF EXISTS public.region_type CASCADE;
DROP TYPE IF EXISTS public.report_reason CASCADE;
DROP TYPE IF EXISTS public.status CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.user_type CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;

-- Create custom types
CREATE TYPE public.direction AS ENUM ('SOUTH', 'NORTH', 'EAST', 'WEST', 'SOUTHEAST', 'SOUTHWEST', 'NORTHEAST', 'NORTHWEST');
CREATE TYPE public.direction_type AS ENUM ('SOUTH', 'NORTH', 'EAST', 'WEST', 'SOUTHEAST', 'SOUTHWEST', 'NORTHEAST', 'NORTHWEST');
CREATE TYPE public.document_type AS ENUM ('PROPERTY_OWNERSHIP', 'BUSINESS_LICENSE', 'ID_CARD', 'CONTRACT', 'OTHER');
CREATE TYPE public.media_type AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE public.property_type AS ENUM ('APARTMENT', 'OFFICETEL', 'VILLA', 'HOUSE', 'STUDIO');
CREATE TYPE public.region_type AS ENUM ('HUMPREYS', 'OSAN');
CREATE TYPE public.report_reason AS ENUM ('SPAM', 'FAKE_LISTING', 'INAPPROPRIATE_CONTENT', 'WRONG_INFORMATION', 'DUPLICATE', 'OTHER');
CREATE TYPE public.status AS ENUM ('PENDING', 'REJECTED', 'ALLOWED');
CREATE TYPE public.transaction_type AS ENUM ('SALE', 'JEONSE', 'MONTHLY_RENT');
CREATE TYPE public.user_type AS ENUM ('REALTOR', 'TENANT', 'LANDLORD', 'ADMIN');
CREATE TYPE public.verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create tables
CREATE TABLE IF NOT EXISTS public.admins (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    email varchar(255) NOT NULL, 
    password_hash varchar(255) NOT NULL, 
    status varchar(20) DEFAULT 'PENDING'::character varying, 
    created_at timestamptz DEFAULT now(), 
    updated_at timestamptz DEFAULT now(), 
    approved_at timestamptz, 
    approved_by uuid
);

CREATE TABLE IF NOT EXISTS public.realtor_companies (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    company_name text NOT NULL, 
    business_license text NOT NULL, 
    phone_number text NOT NULL, 
    address text, 
    is_verified boolean DEFAULT false, 
    created_at timestamptz DEFAULT now(), 
    updated_at timestamptz DEFAULT now(), 
    business_registration_number text, 
    ceo_name text, 
    verification_status varchar(20) DEFAULT 'PENDING'::character varying, 
    rejection_reason text, 
    name text, 
    registration_number text, 
    representative_name text, 
    phone text, 
    business_license_url text, 
    verified_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL DEFAULT auth.uid(), 
    username varchar(255) NOT NULL, 
    full_name varchar(255) NOT NULL, 
    email varchar(255) NOT NULL, 
    phone_number varchar(50), 
    profile_image_url text, 
    user_type user_type NOT NULL, 
    verification_status verification_status DEFAULT 'PENDING'::verification_status, 
    realtor_company_id uuid, 
    properties_count integer DEFAULT 0, 
    kakao_id varchar(50), 
    whatsapp_number varchar(20), 
    is_active boolean DEFAULT true, 
    last_login_at timestamptz, 
    created_at timestamptz DEFAULT now(), 
    updated_at timestamptz DEFAULT now(), 
    realtor_registration_number text, 
    realtor_license_url text, 
    verified_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.properties (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    owner_id uuid NOT NULL, 
    landlord_id uuid, 
    landlord_name varchar(100), 
    landlord_phone varchar(20), 
    landlord_email varchar(255), 
    landlord_kakao_id varchar(50), 
    landlord_whatsapp varchar(20), 
    landlord_notes text, 
    creator_realtor_id uuid, 
    realtor_company_id uuid, 
    title varchar(200) NOT NULL, 
    description text, 
    road_address varchar(500) NOT NULL, 
    detail_address varchar(200), 
    jibun_address varchar(500), 
    zonecode varchar(10), 
    sido varchar(50), 
    sigungu varchar(50), 
    latitude numeric(10,8), 
    longitude numeric(11,8), 
    region region_type, 
    property_type property_type NOT NULL, 
    transaction_type transaction_type NOT NULL, 
    size_info numeric(10,2) NOT NULL, 
    total_floors integer, 
    floor_number integer, 
    room_count integer, 
    bathroom_count integer, 
    parking_spaces varchar(50), 
    direction direction_type, 
    move_in_date varchar(50), 
    approval_date varchar(50), 
    contact_info varchar(20), 
    is_active boolean DEFAULT true, 
    is_featured boolean DEFAULT false, 
    view_count integer DEFAULT 0, 
    thumbnail_url text, 
    created_at timestamptz DEFAULT now(), 
    updated_at timestamptz DEFAULT now(), 
    kakao_id text, 
    whatsapp_number text, 
    is_furnished boolean DEFAULT false, 
    pets_allowed boolean DEFAULT false, 
    amenities jsonb DEFAULT '[]'::jsonb, 
    nearby_facilities jsonb DEFAULT '[]'::jsonb, 
    current_floor integer, 
    is_negotiable boolean DEFAULT false, 
    price bigint NOT NULL DEFAULT 0, 
    deposit bigint, 
    monthly_rent bigint, 
    management_fee bigint, 
    status varchar(20) DEFAULT 'PENDING'::character varying
);

CREATE TABLE IF NOT EXISTS public.property_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    property_id uuid NOT NULL, 
    document_url text NOT NULL, 
    document_type document_type NOT NULL, 
    document_name varchar(255), 
    file_size bigint, 
    verification_status verification_status DEFAULT 'PENDING'::verification_status, 
    verified_at timestamptz, 
    rejection_reason text, 
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_media (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    property_id uuid NOT NULL, 
    media_url text NOT NULL, 
    media_type media_type NOT NULL, 
    file_name varchar(255), 
    file_size bigint, 
    display_order integer DEFAULT 0, 
    is_main_image boolean DEFAULT false, 
    alt_text varchar(500), 
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    property_id uuid NOT NULL, 
    reporter_id uuid NOT NULL, 
    reason report_reason NOT NULL, 
    description text, 
    status varchar(20) DEFAULT 'PENDING'::character varying, 
    admin_notes text, 
    resolved_at timestamptz, 
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_favorites (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    user_id uuid NOT NULL, 
    property_id uuid NOT NULL, 
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_verification_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(), 
    user_id uuid NOT NULL, 
    document_url text NOT NULL, 
    document_type document_type NOT NULL, 
    document_name varchar(255), 
    file_size bigint, 
    verification_status verification_status DEFAULT 'PENDING'::verification_status, 
    verified_at timestamptz, 
    rejection_reason text, 
    created_at timestamptz DEFAULT now()
);

-- Add primary keys
ALTER TABLE public.admins ADD CONSTRAINT admins_pkey PRIMARY KEY (id);
ALTER TABLE public.realtor_companies ADD CONSTRAINT realtor_companies_pkey PRIMARY KEY (id);
ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE public.properties ADD CONSTRAINT properties_pkey PRIMARY KEY (id);
ALTER TABLE public.property_documents ADD CONSTRAINT property_documents_pkey PRIMARY KEY (id);
ALTER TABLE public.property_media ADD CONSTRAINT property_media_pkey PRIMARY KEY (id);
ALTER TABLE public.property_reports ADD CONSTRAINT property_reports_pkey PRIMARY KEY (id);
ALTER TABLE public.user_favorites ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (id);
ALTER TABLE public.user_verification_documents ADD CONSTRAINT user_verification_documents_pkey PRIMARY KEY (id);

-- Add unique constraints
ALTER TABLE public.admins ADD CONSTRAINT admins_email_key UNIQUE (email);
ALTER TABLE public.realtor_companies ADD CONSTRAINT realtor_companies_business_license_key UNIQUE (business_license);
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE public.users ADD CONSTRAINT users_id_key UNIQUE (id);
ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE public.user_favorites ADD CONSTRAINT user_favorites_user_id_property_id_key UNIQUE (user_id, property_id);

-- Add foreign key constraints
ALTER TABLE public.admins ADD CONSTRAINT admins_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.admins(id);
ALTER TABLE public.users ADD CONSTRAINT fk_users_realtor_company FOREIGN KEY (realtor_company_id) REFERENCES public.realtor_companies(id);
ALTER TABLE public.properties ADD CONSTRAINT properties_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);
ALTER TABLE public.properties ADD CONSTRAINT properties_landlord_id_fkey FOREIGN KEY (landlord_id) REFERENCES public.users(id);
ALTER TABLE public.properties ADD CONSTRAINT properties_creator_realtor_id_fkey FOREIGN KEY (creator_realtor_id) REFERENCES public.users(id);
ALTER TABLE public.properties ADD CONSTRAINT properties_realtor_company_id_fkey FOREIGN KEY (realtor_company_id) REFERENCES public.realtor_companies(id);
ALTER TABLE public.property_documents ADD CONSTRAINT property_documents_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
ALTER TABLE public.property_media ADD CONSTRAINT property_media_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
ALTER TABLE public.property_reports ADD CONSTRAINT property_reports_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);
ALTER TABLE public.property_reports ADD CONSTRAINT property_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);
ALTER TABLE public.user_favorites ADD CONSTRAINT user_favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
ALTER TABLE public.user_favorites ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_verification_documents ADD CONSTRAINT user_verification_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtor_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verification_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users table policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update user status" ON public.users FOR UPDATE USING (true);

-- Properties table policies
CREATE POLICY "Properties are viewable by everyone" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING (auth.uid() = owner_id);

-- Realtor companies policies
CREATE POLICY "Realtor companies are viewable by everyone" ON public.realtor_companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create companies" ON public.realtor_companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can update realtor companies" ON public.realtor_companies FOR UPDATE USING (true);

-- Property media policies
CREATE POLICY "Property media viewable by everyone" ON public.property_media FOR SELECT USING (true);
CREATE POLICY "Property owners can manage media" ON public.property_media FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties WHERE properties.id = property_media.property_id AND properties.owner_id = auth.uid())
);

-- Property documents policies
CREATE POLICY "Property documents viewable by everyone" ON public.property_documents FOR SELECT USING (true);
CREATE POLICY "Property owners can manage documents" ON public.property_documents FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties WHERE properties.id = property_documents.property_id AND properties.owner_id = auth.uid())
);

-- User favorites policies
CREATE POLICY "Users can view own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- User verification documents policies
CREATE POLICY "Users can view own documents" ON public.user_verification_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload documents" ON public.user_verification_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.user_verification_documents FOR UPDATE USING (auth.uid() = user_id);

-- Property reports policies
CREATE POLICY "Admins can view all reports" ON public.property_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.user_type = 'ADMIN')
);
CREATE POLICY "Users can create reports" ON public.property_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins table policies
CREATE POLICY "Admins can view all admins" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Admins can update admin status" ON public.admins FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.id = auth.uid() AND admins.status = 'APPROVED')
);