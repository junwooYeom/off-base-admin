-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'LANDLORD', 'REALTOR', 'USER');
CREATE TYPE waiting_status AS ENUM ('PENDING', 'REJECTED', 'ALLOWED');
CREATE TYPE property_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CLOSED', 'LOST');
CREATE TYPE open_house_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE client_type AS ENUM ('BUYER', 'SELLER', 'BOTH');
CREATE TYPE client_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE interaction_type AS ENUM ('CALL', 'EMAIL', 'MEETING', 'SHOWING', 'OTHER');

-- Update users table (assuming it exists from auth)
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type user_role DEFAULT 'USER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS waiting_status waiting_status DEFAULT 'PENDING';
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  location TEXT NOT NULL,
  status property_status DEFAULT 'PENDING',
  images TEXT[],
  bedrooms INTEGER,
  bathrooms DECIMAL,
  area DECIMAL,
  address TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  status property_status DEFAULT 'PENDING',
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  realtor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status lead_status DEFAULT 'NEW',
  source TEXT,
  property_interest TEXT,
  budget DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lead_interactions table
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create open_houses table
CREATE TABLE IF NOT EXISTS open_houses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  realtor_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  visitor_count INTEGER DEFAULT 0,
  status open_house_status DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  realtor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  type client_type NOT NULL,
  status client_status DEFAULT 'ACTIVE',
  tags TEXT[],
  notes TEXT,
  last_interaction TIMESTAMPTZ,
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create client_interactions table
CREATE TABLE IF NOT EXISTS client_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  realtor_id UUID REFERENCES auth.users(id),
  property_id UUID REFERENCES properties(id),
  client_id UUID REFERENCES clients(id),
  sale_price DECIMAL NOT NULL,
  commission_rate DECIMAL NOT NULL,
  split_rate DECIMAL NOT NULL,
  referral_fee DECIMAL DEFAULT 0,
  total_commission DECIMAL NOT NULL,
  realtor_commission DECIMAL NOT NULL,
  brokerage_commission DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_analytics table
CREATE TABLE IF NOT EXISTS property_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  UNIQUE(property_id, date)
);

-- Create bulk_upload_history table
CREATE TABLE IF NOT EXISTS bulk_upload_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  realtor_id UUID REFERENCES auth.users(id),
  filename TEXT,
  total_rows INTEGER,
  successful_rows INTEGER,
  failed_rows INTEGER,
  errors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_reports table
CREATE TABLE IF NOT EXISTS property_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_leads_realtor_status ON leads(realtor_id, status);
CREATE INDEX idx_property_analytics_date ON property_analytics(property_id, date DESC);
CREATE INDEX idx_open_houses_date ON open_houses(realtor_id, date);
CREATE INDEX idx_clients_realtor ON clients(realtor_id, status);
CREATE INDEX idx_commissions_realtor ON commissions(realtor_id, created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update client last interaction
CREATE OR REPLACE FUNCTION update_client_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients 
  SET last_interaction = NOW()
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_interaction_time
  AFTER INSERT ON client_interactions
  FOR EACH ROW EXECUTE FUNCTION update_client_last_interaction();

-- Create function to increment property analytics
CREATE OR REPLACE FUNCTION increment_property_view(
  p_property_id UUID,
  p_view_type TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO property_analytics (property_id, date, views, clicks, inquiries)
  VALUES (
    p_property_id,
    CURRENT_DATE,
    CASE WHEN p_view_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_view_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN p_view_type = 'inquiry' THEN 1 ELSE 0 END
  )
  ON CONFLICT (property_id, date)
  DO UPDATE SET
    views = property_analytics.views + CASE WHEN p_view_type = 'view' THEN 1 ELSE 0 END,
    clicks = property_analytics.clicks + CASE WHEN p_view_type = 'click' THEN 1 ELSE 0 END,
    inquiries = property_analytics.inquiries + CASE WHEN p_view_type = 'inquiry' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql;