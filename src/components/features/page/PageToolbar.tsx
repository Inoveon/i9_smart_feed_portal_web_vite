import { ReactNode } from 'react'

export function PageToolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
      {children}
    </div>
  )
}

