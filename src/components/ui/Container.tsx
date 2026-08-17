import type { ReactNode } from 'react'

type Width = 'page' | 'prose' | 'wide'

const WIDTHS: Record<Width, string> = {
  page: 'max-w-(--container-page)',
  prose: 'max-w-(--container-prose)',
  wide: 'max-w-[92rem]',
}

export function Container({
  children,
  width = 'page',
  className = '',
}: {
  children: ReactNode
  width?: Width
  className?: string
}) {
  return (
    <div className={`mx-auto w-full px-6 sm:px-8 lg:px-12 ${WIDTHS[width]} ${className}`}>
      {children}
    </div>
  )
}
