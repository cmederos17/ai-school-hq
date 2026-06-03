import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Forwardist',
  description: 'Build real things with AI — apps, agents, and automation for regular people ready to move forward.',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
