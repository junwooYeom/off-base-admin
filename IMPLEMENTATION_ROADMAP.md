# Off-Base Admin Implementation Roadmap

## 📋 Executive Summary
This document outlines all unimplemented features in the Off-Base Admin platform based on analysis of the codebase and database schema.

## 🎯 Implementation Priority Matrix

### 🔴 Critical Priority (Week 1-2)
These features are essential for basic platform functionality.

#### 1. Admin Dashboard (`/admin`)
- **Current**: Placeholder page with "관리자 대시보드 준비 중"
- **Required Implementation**:
  ```typescript
  - Total users count by type (ADMIN, REALTOR, TENANT, LANDLORD)
  - Pending property approvals count
  - Pending user verifications count
  - Recent activity feed
  - Quick action buttons (approve properties, verify users)
  ```

#### 2. Property Media Management
- **Database Ready**: `property_media` table exists
- **Required Implementation**:
  ```typescript
  - Image upload component for properties
  - Multiple image support with drag-and-drop
  - Set primary image functionality
  - Image gallery viewer
  - Delete/reorder images
  ```

#### 3. Property Document Management
- **Database Ready**: `property_documents` table exists
- **Required Implementation**:
  ```typescript
  - Document upload interface
  - Document type selection (PROPERTY_OWNERSHIP, CONTRACT, etc.)
  - Admin verification workflow
  - Document preview/download
  ```

### 🟡 High Priority (Week 3-4)
Important features for complete functionality.

#### 4. Realtor Analytics Integration (`/realtor/analytics`)
- **Current**: Static UI with hardcoded zeros
- **Required Implementation**:
  ```typescript
  - Connect to property_analytics table
  - Implement get_property_detail_with_media() function
  - Real-time metrics updates
  - Chart.js or Recharts integration for visualizations
  - Export analytics reports
  ```

#### 5. Client Management System (`/realtor/clients`)
- **Current**: UI complete, no backend
- **Required Implementation**:
  ```typescript
  - CRUD operations for clients table
  - Client interaction tracking
  - Transaction history
  - Tag management system
  - Search and filter functionality
  ```

#### 6. Bulk Upload Processing (`/realtor/bulk-upload`)
- **Current**: UI only, no processing
- **Required Implementation**:
  ```typescript
  - CSV parser implementation
  - Data validation logic
  - Error handling and reporting
  - Progress tracking
  - Save to bulk_upload_history table
  ```

### 🟢 Medium Priority (Week 5-6)
Features that enhance user experience.

#### 7. Open House Calendar (`/realtor/open-house`)
- **Current**: List view only
- **Required Implementation**:
  ```typescript
  - Calendar component integration (FullCalendar or similar)
  - Event creation/editing
  - Visitor registration system
  - Automated reminders
  - QR code for visitor check-in
  ```

#### 8. User Favorites System
- **Database Ready**: `user_favorites` table exists
- **Required Implementation**:
  ```typescript
  - Add to favorites button on properties
  - Favorites page for users
  - Favorite status in property listings
  - Notification for price changes
  ```

#### 9. Property Reporting System
- **Database Ready**: `property_reports` table with functions
- **Required Implementation**:
  ```typescript
  - Report property button
  - Admin review interface
  - Report status tracking
  - Use existing functions:
    - create_property_report()
    - get_property_reports()
    - update_report_status()
  ```

### 🔵 Low Priority (Week 7-8)
Nice-to-have features for enhanced functionality.

#### 10. Commission History & Reports (`/realtor/commission`)
- **Current**: Calculator only
- **Required Implementation**:
  ```typescript
  - Save calculations to commissions table
  - Commission history page
  - Monthly/yearly reports
  - Export to Excel/PDF
  - Commission trends analytics
  ```

#### 11. Lead Interaction System (`/realtor/leads`)
- **Current**: Basic CRUD only
- **Required Implementation**:
  ```typescript
  - Lead detail page
  - Interaction logging (calls, emails, meetings)
  - Lead scoring algorithm
  - Conversion tracking
  - Lead source analytics
  ```

#### 12. Realtor Company Management
- **Database Ready**: `realtor_companies` table
- **Required Implementation**:
  ```typescript
  - Company registration page
  - Company verification by admin
  - Company profile management
  - Associate realtors with companies
  - Company statistics dashboard
  ```

## 📊 Database Tables Usage Status

| Table | UI Exists | Fully Implemented | Priority |
|-------|-----------|-------------------|----------|
| users | ✅ | ✅ | - |
| properties | ✅ | ⚠️ (missing media) | Critical |
| property_media | ❌ | ❌ | Critical |
| property_documents | ❌ | ❌ | Critical |
| user_verification_documents | ⚠️ | ⚠️ | High |
| realtor_companies | ❌ | ❌ | Low |
| user_favorites | ❌ | ❌ | Medium |
| property_reports | ❌ | ❌ | Medium |
| open_houses | ⚠️ | ❌ | High |
| clients | ⚠️ | ❌ | High |
| leads | ⚠️ | ⚠️ | High |
| commissions | ⚠️ | ❌ | Low |
| property_analytics | ⚠️ | ❌ | High |
| bulk_upload_history | ⚠️ | ❌ | High |

## 🛠️ Technical Implementation Details

### API Endpoints to Create

```typescript
// Property Media
POST   /api/properties/:id/media
DELETE /api/properties/:id/media/:mediaId
PUT    /api/properties/:id/media/:mediaId/primary

// Property Documents
POST   /api/properties/:id/documents
GET    /api/properties/:id/documents
PUT    /api/documents/:id/verify
DELETE /api/documents/:id

// Analytics
GET    /api/analytics/properties/:id
GET    /api/analytics/dashboard
GET    /api/analytics/trends

// Bulk Upload
POST   /api/bulk-upload/process
GET    /api/bulk-upload/template
GET    /api/bulk-upload/history

// Favorites
POST   /api/favorites
DELETE /api/favorites/:propertyId
GET    /api/users/:id/favorites

// Reports
POST   /api/reports
GET    /api/reports
PUT    /api/reports/:id/status
```

### Supabase Functions to Utilize

Already defined in database:
- `get_property_detail_with_media(property_id)`
- `create_property_report(property_id, reason, description)`
- `get_property_reports(property_id)`
- `update_report_status(report_id, status, admin_response)`
- `has_user_reported_property(property_id)`
- `get_user_reports()`
- `get_all_reports(status, page, page_size)`

### Missing Supabase RLS Policies

Need to verify/create:
- property_media: insert/delete policies for property owners
- property_documents: verification policies for admins
- user_favorites: user-specific access policies
- property_reports: anonymous reporting capability

## 📱 UI Components to Build

### Reusable Components Needed
```typescript
// components/
├── ImageUploader.tsx        // Drag-drop multi-image upload
├── DocumentUploader.tsx     // Document upload with type selection
├── CalendarView.tsx        // Full calendar for open houses
├── AnalyticsChart.tsx      // Reusable chart component
├── CSVUploader.tsx         // CSV file processor
├── MediaGallery.tsx        // Image/video gallery viewer
├── ReportModal.tsx         // Property reporting interface
├── InteractionLogger.tsx   // Log client/lead interactions
└── ExportButton.tsx        // Export data to Excel/PDF
```

## 🚀 Implementation Schedule

### Week 1-2: Foundation
- [ ] Admin dashboard with real metrics
- [ ] Property media upload system
- [ ] Property document management

### Week 3-4: Core Features
- [ ] Analytics backend integration
- [ ] Client management CRUD
- [ ] Bulk upload processing

### Week 5-6: Enhanced Features
- [ ] Open house calendar
- [ ] Favorites system
- [ ] Property reporting

### Week 7-8: Polish
- [ ] Commission history
- [ ] Lead interactions
- [ ] Company management

## 📈 Success Metrics

- **Admin Efficiency**: Reduce property approval time by 50%
- **Data Completeness**: 90% of properties with images
- **User Engagement**: 60% of users using favorites
- **Realtor Productivity**: 30% increase in lead conversion tracking
- **System Usage**: Daily active users increase by 40%

## 🔄 Next Steps

1. **Immediate Actions**:
   - Set up file upload infrastructure (Supabase Storage)
   - Create reusable upload components
   - Implement admin dashboard queries

2. **Backend Setup**:
   - Create missing API endpoints
   - Verify RLS policies
   - Set up storage buckets for media

3. **Testing Requirements**:
   - Unit tests for upload components
   - Integration tests for CRUD operations
   - E2E tests for critical workflows

## 📝 Notes

- All monetary values use Korean Won (₩)
- Dates should support Korean format (YYYY-MM-DD)
- Consider mobile responsiveness for all new features
- Implement proper error handling and loading states
- Add proper TypeScript types for all new features