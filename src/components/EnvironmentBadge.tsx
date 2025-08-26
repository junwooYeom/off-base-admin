'use client'

import { flavorConfig, getEnvironmentBadgeColor } from '@/config/flavor'
import { Server, GitBranch } from 'lucide-react'

export default function EnvironmentBadge() {
  // Only show in development or if explicitly enabled
  if (flavorConfig.environment === 'production' && !flavorConfig.enableDebug) {
    return null
  }

  const badgeColor = getEnvironmentBadgeColor()
  const isDevEnvironment = flavorConfig.environment === 'development'

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${badgeColor} border`}>
      <Server className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase">
          {flavorConfig.environment}
        </span>
        <div className="flex items-center space-x-1 text-xs opacity-75">
          <GitBranch className="h-3 w-3" />
          <span>{flavorConfig.supabaseBranch} branch</span>
        </div>
      </div>
      {isDevEnvironment && (
        <div className="ml-2 pl-2 border-l border-current opacity-50">
          <span className="text-xs">Debug: {flavorConfig.enableDebug ? 'ON' : 'OFF'}</span>
        </div>
      )}
    </div>
  )
}