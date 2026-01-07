import { Compass } from 'lucide-react'
import Link from 'next/link'
import { forwardRef, ReactNode } from 'react'

import { LoadingSpinner } from '../loading-spinner'
import { TitleBar } from './title-bar'

function ContentContainer(props: any) {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-12 pb-10 md:px-8"
      {...props}
    />
  )
}

interface DetailContainerProps {
  children: ReactNode
}

const Container = forwardRef<HTMLDivElement, DetailContainerProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        id="main"
        className="relative flex max-h-screen w-full flex-col overflow-y-auto bg-neutral-950"
        {...props}
      />
    )
  }
)

function Header(props: any) {
  return <div className="space-y-3" {...props} />
}

interface TitleProps {
  children: ReactNode
}

const Title = forwardRef<HTMLHeadingElement, TitleProps>((props, ref) => {
  return (
    <h1
      ref={ref}
      className="font-sans text-2xl font-bold text-primary xl:text-3xl"
      {...props}
    />
  )
})

function Loading() {
  return (
    <Container>
      <div className="flex flex-1 flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    </Container>
  )
}

function Null() {
  return (
    <Container>
      <TitleBar title="Not found" />
      <div className="flex flex-1 flex-col items-center justify-center space-y-6 px-8 text-center lg:px-16">
        <Compass className="text-secondary" size={32} />
        <div className="flex flex-col space-y-1">
          <p className="font-semibold text-primary">
            What you seek does not exist.
          </p>
          <p className="text-tertiary">
            Maybe this link is broken. Maybe something was deleted, or moved. In
            any case, there’s nothing to see here...
          </p>
        </div>
        <Link href="/" className="font-extrabold text-white">
          Go home
        </Link>
      </div>
    </Container>
  )
}

export const Detail = {
  Container,
  ContentContainer,
  Header,
  Title,
  Loading,
  Null,
}
