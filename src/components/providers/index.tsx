'use client'
import { MantineProvider } from '@mantine/core'
import { createContext, useState } from 'react'

import { SEO } from './seo'
import { Toast } from './toaster'

interface Props {
  children?: any
}

const globalNavigationContext = {
  isOpen: false,
  setIsOpen: (val: boolean) => {},
}

export const GlobalNavigationContext = createContext(globalNavigationContext)

export function Providers({ children }: Props) {
  const initialState = {
    isOpen: false,
    setIsOpen,
  }

  const [state, setState] = useState(initialState)

  function setIsOpen(isOpen: any) {
    return setState({ ...state, isOpen })
  }

  return (
    <>
      <MantineProvider defaultColorScheme="dark">
        <SEO />
        <Toast />
        <GlobalNavigationContext.Provider value={state}>
          {children}
        </GlobalNavigationContext.Provider>
      </MantineProvider>
    </>
  )
}
