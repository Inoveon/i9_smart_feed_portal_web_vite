export const helpMapping: Record<string, string> = {
  '/': 'dashboard.md',
  '/dashboard': 'dashboard.md',
  '/campaigns': 'campaigns.md',
  '/campaigns/new': 'campaigns-new.md',
  '/campaigns/:id/edit': 'campaigns-edit.md',
  '/campaigns/:id/images': 'campaigns-images.md',
  '/branches': 'branches.md',
  '/stations': 'stations.md',
  '/activities': 'activities.md',
  '/analytics': 'analytics.md',
  '/settings': 'settings.md',
  '/profile': 'profile.md',
}

export function getHelpFile(pathname: string): string {
  // Tentar match exato primeiro
  if (helpMapping[pathname]) {
    return helpMapping[pathname]
  }
  
  // Tentar match com parâmetros
  for (const [pattern, file] of Object.entries(helpMapping)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
      if (regex.test(pathname)) {
        return file
      }
    }
  }
  
  return 'default.md'
}