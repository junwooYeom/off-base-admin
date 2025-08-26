# Supabase Branch Configuration

This project uses Supabase branches for development and production environments.

## Current Branches

### Main Branch (Production)
- **Project ID**: `dijtowiohxvwdnvgprud`  
- **URL**: https://dijtowiohxvwdnvgprud.supabase.co
- **Status**: Production database with migrations that may have issues
- **Use Case**: Production environment (use with caution due to migration issues)

### Master Branch (Development) ✅ Currently Active
- **Project ID**: `bjwhxrapqobyjccnviud`
- **URL**: https://bjwhxrapqobyjccnviud.supabase.co
- **Status**: Clean development branch with synced schema
- **Use Case**: Development and testing

## Switching Between Branches

### Method 1: Using the Script (Recommended)
```bash
# Run the branch switcher script
./scripts/switch-branch.sh
```

### Method 2: Manual Switch
```bash
# Switch to Main branch (Production)
cp .env.main .env.local

# Switch to Master branch (Development)
cp .env.master .env.local
```

After switching, restart your development server:
```bash
npm run dev
```

## Current Configuration
The application is currently configured to use the **Master branch** for development.

## Branch Schema Status
- **Master branch**: Fully synced with main branch schema (as of 2025-08-07)
  - All tables created
  - All constraints applied
  - All RLS policies configured
  - Ready for development

## Important Notes
1. The Master branch is a development branch and data will not persist to production
2. Always test migrations on the Master branch before applying to Main
3. The Main branch currently has status "MIGRATIONS_FAILED" - be careful when working with it
4. Environment variables are stored in:
   - `.env.local` - Current active configuration
   - `.env.main` - Main branch configuration
   - `.env.master` - Master branch configuration