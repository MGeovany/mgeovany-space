import { useEffect, useRef } from 'react'

export function ListContainer({ children, onRef, ...rest }: any) {
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    onRef(scrollContainerRef)
  }, [scrollContainerRef])

  return (
    <div
      ref={scrollContainerRef}
      className="relative h-full max-h-screen min-h-screen w-full flex-none overflow-y-auto border-r border-neutral-800 bg-neutral-950 lg:w-80 xl:w-96"
      {...rest}
    >
      {children}
    </div>
  )
}
