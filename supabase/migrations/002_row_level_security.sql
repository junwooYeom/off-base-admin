-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND user_type = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is realtor
CREATE OR REPLACE FUNCTION is_realtor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND user_type = 'REALTOR'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMIN POLICIES

-- Admins can view and manage all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (is_admin());

-- Admins can view and manage all properties
CREATE POLICY "Admins can view all properties" ON properties
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update properties" ON properties
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete properties" ON properties
  FOR DELETE USING (is_admin());

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" ON documents
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update documents" ON documents
  FOR UPDATE USING (is_admin());

-- REALTOR POLICIES

-- Realtors can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Realtors can manage their own leads
CREATE POLICY "Realtors can view own leads" ON leads
  FOR SELECT USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can create own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = realtor_id);

CREATE POLICY "Realtors can update own leads" ON leads
  FOR UPDATE USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can delete own leads" ON leads
  FOR DELETE USING (auth.uid() = realtor_id);

-- Lead interactions
CREATE POLICY "Realtors can view own lead interactions" ON lead_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = lead_interactions.lead_id 
      AND leads.realtor_id = auth.uid()
    )
  );

CREATE POLICY "Realtors can create lead interactions" ON lead_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = lead_interactions.lead_id 
      AND leads.realtor_id = auth.uid()
    )
  );

-- Realtors can manage their own properties
CREATE POLICY "Realtors can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Realtors can create properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Realtors can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

-- Open houses
CREATE POLICY "Realtors can view own open houses" ON open_houses
  FOR SELECT USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can create open houses" ON open_houses
  FOR INSERT WITH CHECK (auth.uid() = realtor_id);

CREATE POLICY "Realtors can update own open houses" ON open_houses
  FOR UPDATE USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can delete own open houses" ON open_houses
  FOR DELETE USING (auth.uid() = realtor_id);

-- Clients
CREATE POLICY "Realtors can view own clients" ON clients
  FOR SELECT USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can create clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = realtor_id);

CREATE POLICY "Realtors can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = realtor_id);

-- Client interactions
CREATE POLICY "Realtors can view own client interactions" ON client_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_interactions.client_id 
      AND clients.realtor_id = auth.uid()
    )
  );

CREATE POLICY "Realtors can create client interactions" ON client_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_interactions.client_id 
      AND clients.realtor_id = auth.uid()
    )
  );

-- Commissions
CREATE POLICY "Realtors can view own commissions" ON commissions
  FOR SELECT USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can create commissions" ON commissions
  FOR INSERT WITH CHECK (auth.uid() = realtor_id);

-- Property analytics (realtors can view analytics for their properties)
CREATE POLICY "Realtors can view own property analytics" ON property_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_analytics.property_id 
      AND properties.user_id = auth.uid()
    )
  );

-- Bulk upload history
CREATE POLICY "Realtors can view own upload history" ON bulk_upload_history
  FOR SELECT USING (auth.uid() = realtor_id);

CREATE POLICY "Realtors can create upload history" ON bulk_upload_history
  FOR INSERT WITH CHECK (auth.uid() = realtor_id);

-- PUBLIC POLICIES

-- Anyone can view approved properties
CREATE POLICY "Public can view approved properties" ON properties
  FOR SELECT USING (status = 'APPROVED');

-- Authenticated users can report properties
CREATE POLICY "Users can report properties" ON property_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Property owners can view reports on their properties
CREATE POLICY "Property owners can view reports" ON property_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reports.property_id 
      AND properties.user_id = auth.uid()
    )
  );