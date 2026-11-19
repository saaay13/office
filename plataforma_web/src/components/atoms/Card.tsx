import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`glass-card rounded-xl p-6 ${className}`}>
      {children}
    </section>
  )
}
