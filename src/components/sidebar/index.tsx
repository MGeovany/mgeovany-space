'use client'

import { useContext, useRef } from 'react'

import { TitleBar } from '../list-detail/title-bar'
import { GlobalNavigationContext } from '../providers'
import { SidebarNavigation } from './navigation'
import { SidebarOverlay } from './overlay'

export function Sidebar() {
  const { isOpen } = useContext(GlobalNavigationContext)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  return (
    <>
      <nav
        ref={scrollContainerRef}
        className={`${
          isOpen
            ? 'absolute inset-y-0 left-0 translate-x-0 shadow-lg'
            : 'absolute -translate-x-full'
        } 3xl:w-80 z-30 flex h-full max-h-screen min-h-screen w-3/4 flex-none transform flex-col overflow-y-auto border-r border-neutral-800 bg-neutral-950 pb-10 transition duration-200 ease-in-out sm:w-1/2 sm:pb-0 md:w-1/3 lg:relative lg:z-auto lg:w-56 lg:translate-x-0 2xl:w-72`}
      >
        <TitleBar
          scrollContainerRef={scrollContainerRef}
          leadingAccessory={null}
          title="mgeovany"
        />
        <SidebarNavigation />
      </nav>

      <SidebarOverlay />
    </>
  )
}
