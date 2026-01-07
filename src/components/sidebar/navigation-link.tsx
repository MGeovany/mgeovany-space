import Link from 'next/link'
import React, { ElementType, useContext } from 'react'

import { GlobalNavigationContext } from '../providers'

export function NavigationLink({
  link: {
    href,
    label,
    icon: Icon,
    trailingAccessory: Accessory,
    trailingAction: Action,
    isActive,
    isExternal,
  },
}: {
  link: {
    href: string
    label: string
    icon: ElementType
    trailingAccessory?: ElementType | null
    trailingAction?: ElementType | null
    isActive: boolean
    isExternal: boolean
  }
}) {
  const { setIsOpen } = useContext(GlobalNavigationContext)

  return (
    <li
      className="flex items-stretch space-x-1"
      onClick={() => setIsOpen(false)}
    >
      <Link
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`flex flex-1 items-center space-x-3 rounded-md px-2 py-1.5 text-sm font-medium ${
          isActive
            ? 'bg-neutral-800 text-white hover:bg-neutral-800 hover:text-white'
            : 'text-neutral-200 hover:bg-neutral-900 hover:text-neutral-50'
        }`}
      >
        <span className="flex w-4 items-center justify-center">
          <Icon />
        </span>
        <span className="flex-1">{label}</span>
        {Accessory && (
          <span className="flex w-4 items-center justify-center text-neutral-500">
            <Accessory />
          </span>
        )}
      </Link>
      {Action && <Action />}
    </li>
  )
}
