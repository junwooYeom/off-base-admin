# Installation and Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account with project created

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Required Packages
The following packages are required and should already be installed:
- `next` - Next.js framework
- `react` & `react-dom` - React
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-nextjs` - Supabase Auth helpers
- `lucide-react` - Icon library
- `tailwindcss` - CSS framework

If any are missing, install them:
```bash
npm install lucide-react @supabase/auth-helpers-nextjs
```

### 3. Environment Variables
Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Storage Setup
The following storage buckets should exist in your Supabase project:
- `property-media` - For property images/videos
  - Path structure: `properties/[PROPERTY_ID]/photos/[MEDIA_ID]`
- `users` - For user profile images and documents
  - Profile: `users/[USER_ID]/profile_image/[filename]`
  - Documents: `users/[USER_ID]/documentation/[document_type]`

### 5. Database Tables Required
Ensure these tables exist in your Supabase database:
- `users` - User accounts with verification status
- `properties` - Property listings
- `property_media` - Property images/videos
- `property_documents` - Property verification documents
- `user_verification_documents` - User/Realtor verification documents
- `realtor_companies` - Realtor company information
- `user_favorites` - User favorite properties
- `property_reports` - Property abuse reports

## Common Issues and Fixes

### Issue 1: Module not found - @/components/ui/card
**Fix**: The Card component has been created at `src/components/ui/card.tsx`

### Issue 2: lucide-react icons not working
**Fix**: Install lucide-react:
```bash
npm install lucide-react
```

### Issue 3: Image component errors
**Fix**: Ensure you're using Next.js Image component correctly:
```tsx
import Image from 'next/image'
```

### Issue 4: Supabase authentication errors
**Fix**: Check that your environment variables are set correctly and that RLS policies are configured.

### Issue 5: TypeScript errors
**Fix**: Run type checking:
```bash
npx tsc --noEmit
```

## Running the Application

### Development
```bash
npm run dev
```
Visit http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Project Structure
```
src/
├── app/
│   ├── admin/
│   │   ├── verification/
│   │   │   ├── realtors/    # Realtor verification
│   │   │   └── properties/  # Property verification
│   │   ├── users/           # User management
│   │   └── properties/      # Property management
│   └── realtor/             # Realtor dashboard
├── components/
│   ├── ui/                 # UI components (Card, etc.)
│   ├── ImageUploader.tsx   # Property image upload
│   ├── DocumentUploader.tsx # Document upload
│   └── ProfileImageUploader.tsx # Profile image upload
├── lib/
│   └── supabase.ts         # Supabase client
└── types/
    ├── database.types.ts   # Generated DB types
    └── supabase.ts        # Type exports

```

## Key Features

### Admin Features
1. **Realtor Verification** (`/admin/verification/realtors`)
   - Review realtor documents
   - Approve/Reject with reasons
   - Batch approval

2. **Property Verification** (`/admin/verification/properties`)
   - Review property documents and images
   - Approve/Reject properties
   - Document verification

3. **Dashboard** (`/admin`)
   - Real-time statistics
   - Quick actions
   - Verification center

### File Upload Features
- **Property Images**: Multi-image upload with drag-and-drop
- **Documents**: PDF/Image document upload with type selection
- **Profile Images**: User profile image management

## Troubleshooting

### Build Errors
1. Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

2. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Type Errors
1. Regenerate database types:
```bash
npx supabase gen types typescript --project-id your_project_id > src/types/database.types.ts
```

### Storage Errors
1. Check storage bucket policies in Supabase dashboard
2. Ensure buckets are public or have appropriate RLS policies
3. Verify file size limits (5MB for images, 10MB for documents)

## Support
For issues specific to this project, check:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
- Project README for additional setup instructions