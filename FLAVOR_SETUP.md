# Flavor Configuration Guide

## Overview

This project supports two flavors/environments:
- **Development (dev)**: Uses the `master` branch on Supabase
- **Production/Release**: Uses the `main` branch on Supabase

## Environment Files

### Development Environment (`.env.development`)
- **Supabase Project**: bjwhxrapqobyjccnviud (master branch)
- **Features**: Debug mode enabled, analytics disabled
- **Use Case**: Active development and testing

### Production Environment (`.env.production`)
- **Supabase Project**: dijtowiohxvwdnvgprud (main branch)
- **Features**: Debug mode disabled, analytics enabled
- **Use Case**: Production release

## Quick Start

### Switching Flavors

#### Method 1: Using npm scripts
```bash
# Switch to development flavor (master branch)
npm run flavor:dev

# Switch to production/release flavor (main branch)
npm run flavor:release
```

#### Method 2: Direct commands for running the app
```bash
# Run development server with dev flavor
npm run dev:development

# Run development server with production flavor
npm run dev:production

# Build with specific flavor
npm run build:development
npm run build:production

# Start production server with specific flavor
npm run start:development
npm run start:production
```

## File Structure

```
off-base-admin/
├── .env.development      # Dev environment (master branch)
├── .env.production       # Production environment (main branch)
├── .env.local           # Active environment (auto-generated, git-ignored)
├── src/
│   ├── config/
│   │   └── flavor.ts    # Flavor configuration helper
│   └── components/
│       └── EnvironmentBadge.tsx  # Visual indicator of current environment
```

## Configuration Details

### Environment Variables

| Variable | Development | Production |
|----------|------------|------------|
| NEXT_PUBLIC_SUPABASE_URL | bjwhxrapqobyjccnviud.supabase.co | dijtowiohxvwdnvgprud.supabase.co |
| NEXT_PUBLIC_ENVIRONMENT | development | production |
| NEXT_PUBLIC_SUPABASE_BRANCH | master | main |
| NEXT_PUBLIC_ENABLE_DEBUG | true | false |
| NEXT_PUBLIC_ENABLE_ANALYTICS | false | true |

### Using Flavor Config in Code

```typescript
import { flavorConfig, isDevelopment, isProduction } from '@/config/flavor'

// Check current environment
if (isDevelopment()) {
  console.log('Running in development mode')
}

// Access configuration
const supabaseUrl = flavorConfig.supabaseUrl
const projectId = flavorConfig.projectId

// Conditional features
if (flavorConfig.enableDebug) {
  // Show debug information
}
```

## Visual Indicators

### Environment Badge
A badge appears in the bottom-right corner showing:
- Current environment (development/production)
- Active Supabase branch (master/main)
- Debug mode status (in development)

The badge colors:
- **Yellow**: Development environment
- **Green**: Production environment

## Deployment

### Local Development
```bash
# For development work
npm run flavor:dev
npm run dev
```

### Testing Production Build Locally
```bash
# Test production build
npm run flavor:release
npm run build
npm run start
```

### Vercel Deployment

For Vercel deployments, set the environment variables directly in the Vercel dashboard:

1. **Development/Preview Deployments**:
   - Use values from `.env.development`
   - Set for Preview environment

2. **Production Deployment**:
   - Use values from `.env.production`
   - Set for Production environment

## Best Practices

1. **Always verify** the current flavor before making database changes
2. **Use development flavor** for all development work
3. **Test in production flavor** before deploying
4. **Never commit** `.env.local` file
5. **Keep environment files** in sync with Supabase projects

## Troubleshooting

### Wrong Database Connected
If you're connected to the wrong database:
```bash
# Check current environment
cat .env.local | grep SUPABASE_BRANCH

# Switch to correct flavor
npm run flavor:dev  # or flavor:release
```

### Environment Badge Not Showing
- Check if you're in production mode (badge hidden by default in production)
- Verify `EnvironmentBadge` component is imported in layout

### Build Errors After Switching
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Security Notes

- **Different JWT secrets** for each environment
- **Production keys** should never be used in development
- **Environment files** should not contain sensitive service keys
- **Service role keys** should only be set in secure environments (Vercel, server-side)

## Migration Between Environments

When promoting changes from development to production:

1. Test thoroughly in development (master branch)
2. Apply migrations to production (main branch)
3. Switch to production flavor and verify
4. Deploy to production

## Support

For issues with flavor configuration:
1. Verify correct environment file exists
2. Check if `.env.local` is properly generated
3. Ensure Supabase projects are accessible
4. Verify project IDs match your Supabase dashboard