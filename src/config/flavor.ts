/**
 * Flavor configuration for different environments
 * - Development: Uses master branch on Supabase
 * - Production: Uses main branch on Supabase
 */

export type Environment = 'development' | 'production'

interface FlavorConfig {
  environment: Environment
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseBranch: string
  projectId: string
  enableDebug: boolean
  enableAnalytics: boolean
}

// Get environment from Next.js or default to development
const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as Environment

// Flavor configuration
export const flavorConfig: FlavorConfig = {
  environment,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseBranch: process.env.NEXT_PUBLIC_SUPABASE_BRANCH || 'master',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
}

// Helper functions
export const isDevelopment = () => environment === 'development'
export const isProduction = () => environment === 'production'

// Get the appropriate Supabase project URL based on flavor
export const getSupabaseUrl = () => flavorConfig.supabaseUrl

// Get the appropriate project name for display
export const getProjectName = () => {
  switch (environment) {
    case 'development':
      return 'Off-Base Admin (Dev)'
    case 'production':
      return 'Off-Base Admin'
    default:
      return 'Off-Base Admin'
  }
}

// Get environment badge color for UI
export const getEnvironmentBadgeColor = () => {
  switch (environment) {
    case 'development':
      return 'bg-yellow-100 text-yellow-800'
    case 'production':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Log configuration (only in development)
if (isDevelopment() && flavorConfig.enableDebug) {
  console.log('🔧 Flavor Configuration:', {
    environment: flavorConfig.environment,
    branch: flavorConfig.supabaseBranch,
    projectId: flavorConfig.projectId,
    debug: flavorConfig.enableDebug,
    analytics: flavorConfig.enableAnalytics,
  })
}