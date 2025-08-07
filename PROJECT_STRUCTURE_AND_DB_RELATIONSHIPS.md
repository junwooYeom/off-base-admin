# Off-Base Admin Project Structure & Database Relationships

## Project Overview
This is a real estate management platform with three main user roles:
- **Admin**: Full system access and management
- **Realtor**: Property management, lead tracking, client management
- **User/Landlord**: Property listing and management

## Technology Stack
- **Frontend**: Next.js 14+ with TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

## Database Schema Overview

### Core Tables

#### 1. **users** (Extended from Supabase Auth)
- **Purpose**: User authentication and role management
- **Key Fields**:
  - `user_type`: ENUM ('ADMIN', 'LANDLORD', 'REALTOR', 'USER')
  - `waiting_status`: ENUM ('PENDING', 'REJECTED', 'ALLOWED')
  - `verified_at`: Timestamp for account verification
- **Relationships**: Primary reference for all other tables

#### 2. **properties**
- **Purpose**: Real estate property listings
- **Key Fields**:
  - `status`: ENUM ('PENDING', 'APPROVED', 'REJECTED')
  - `user_id`: References users table
  - Property details (price, location, bedrooms, etc.)
- **Relationships**:
  - Has many: property_analytics, property_reports, open_houses
  - Referenced by: commissions

#### 3. **documents**
- **Purpose**: User verification documents
- **Key Fields**:
  - `status`: ENUM ('PENDING', 'APPROVED', 'REJECTED')
  - `user_id`: References users table
- **Features**: Document review system for admin approval

### Realtor-Specific Tables

#### 4. **leads**
- **Purpose**: Sales lead management for realtors
- **Key Fields**:
  - `status`: ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CLOSED', 'LOST')
  - `realtor_id`: References users table
- **Relationships**:
  - Has many: lead_interactions

#### 5. **clients**
- **Purpose**: Client relationship management
- **Key Fields**:
  - `type`: ENUM ('BUYER', 'SELLER', 'BOTH')
  - `status`: ENUM ('ACTIVE', 'INACTIVE')
  - `realtor_id`: References users table
- **Relationships**:
  - Has many: client_interactions
  - Referenced by: commissions

#### 6. **open_houses**
- **Purpose**: Open house event scheduling
- **Key Fields**:
  - `status`: ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED')
  - Links realtor to property
- **Relationships**:
  - References: properties, users (realtor)

#### 7. **commissions**
- **Purpose**: Sales commission tracking
- **Key Fields**:
  - Automatic commission calculations
  - Split tracking between realtor and brokerage
- **Relationships**:
  - References: properties, users (realtor), clients

### Analytics & Support Tables

#### 8. **property_analytics**
- **Purpose**: Track property performance metrics
- **Features**: Daily aggregation of views, clicks, inquiries
- **Relationships**: References properties

#### 9. **bulk_upload_history**
- **Purpose**: Track CSV/bulk data imports
- **Features**: Error tracking and success rates
- **Relationships**: References users (realtor)

#### 10. **property_reports**
- **Purpose**: User reporting system for problematic listings
- **Relationships**: References properties and reporter

## Application Features & Database Mappings

### Admin Features (`/admin/*`)

1. **User Management** (`/admin/users`)
   - Tables: users, documents
   - Features:
     - View all users with filtering by role
     - Approve/reject realtor applications
     - Review verification documents
     - Change user roles and status

2. **Property Management** (`/admin/properties`)
   - Tables: properties, property_reports
   - Features:
     - Review and approve/reject property listings
     - Handle property reports
     - Global property oversight

### Realtor Features (`/realtor/*`)

1. **Dashboard** (`/realtor`)
   - Tables: Multiple (aggregated stats)
   - Features: Overview of leads, clients, properties, commissions

2. **Lead Management** (`/realtor/leads`)
   - Tables: leads, lead_interactions
   - Features:
     - Lead pipeline visualization
     - Interaction tracking
     - Status updates

3. **Client Management** (`/realtor/clients`)
   - Tables: clients, client_interactions
   - Features:
     - Client database
     - Interaction history
     - Tag-based organization

4. **Open House Management** (`/realtor/open-house`)
   - Tables: open_houses, properties
   - Features:
     - Schedule open houses
     - Track visitor counts
     - Link to properties

5. **Commission Tracking** (`/realtor/commission`)
   - Tables: commissions, properties, clients
   - Features:
     - Automatic commission calculations
     - Split tracking
     - Historical records

6. **Analytics** (`/realtor/analytics`)
   - Tables: property_analytics
   - Features:
     - Property performance metrics
     - Trend analysis
     - ROI tracking

7. **Bulk Upload** (`/realtor/bulk-upload`)
   - Tables: bulk_upload_history, leads/clients
   - Features:
     - CSV import for leads/clients
     - Error handling and reporting

## Security & Access Control

### Row Level Security (RLS) Policies

1. **Admin Access**:
   - Full read/write access to all tables
   - Can manage user roles and approvals

2. **Realtor Access**:
   - Own data only (leads, clients, commissions)
   - Can create and manage properties
   - View analytics for own properties

3. **Public Access**:
   - View approved properties only
   - Can submit property reports

### Authentication Flow
1. Login via Supabase Auth (`/auth/login`)
2. Role-based redirection:
   - Admins → `/admin`
   - Realtors → `/realtor`
   - Others → `/` (public landing)
3. Middleware enforcement of access rules

## Key Relationships Diagram

```
users (auth)
  ├── properties (1:many)
  │   ├── property_analytics (1:many)
  │   ├── property_reports (1:many)
  │   ├── open_houses (1:many)
  │   └── commissions (1:many)
  ├── documents (1:many)
  ├── leads (1:many) [realtor only]
  │   └── lead_interactions (1:many)
  ├── clients (1:many) [realtor only]
  │   └── client_interactions (1:many)
  └── bulk_upload_history (1:many) [realtor only]
```

## Database Triggers & Functions

1. **update_updated_at_column()**: Auto-updates `updated_at` timestamp
2. **update_client_last_interaction()**: Updates client's last interaction time
3. **increment_property_view()**: Handles property analytics tracking
4. **is_admin()** / **is_realtor()**: Helper functions for RLS policies

## Environment Configuration
- Supabase Project ID: `dijtowiohxvwdnvgprud`
- API URL: `https://dijtowiohxvwdnvgprud.supabase.co`
- Uses environment variables for keys and configuration