'use client'

import { ArrowLeft, Menu, X } from 'lucide-react'
import Link from 'next/link'
import {
  MutableRefObject,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { GlobalNavigationContext } from '../providers'

interface TitleBarProps {
  title: string
  globalMenu?: boolean
  backButton?: boolean
  backButtonHref?: string
  magicTitle?: boolean
  titleRef?: RefObject<HTMLParagraphElement> | null
  scrollContainerRef?: MutableRefObject<HTMLElement | null>
  children?: ReactNode
  leadingAccessory?: ReactNode
  trailingAccessory?: ReactNode
}

export function TitleBar({
  title,
  globalMenu = true,
  backButton = false,
  backButtonHref,
  magicTitle = false,
  titleRef = null,
  scrollContainerRef,
  leadingAccessory = null,
  trailingAccessory = null,
  children,
}: TitleBarProps) {
  const { isOpen, setIsOpen } = useContext(GlobalNavigationContext)
  const [offset, setOffset] = useState(200)
  const [opacity, _setOpacity] = useState(0)
  const [currentScrollOffset, _setCurrentScrollOffset] = useState(0)

  const [initialTitleOffsets, _setInitialTitleOffsets] = useState({
    top: 0,
    bottom: 0,
  })

  const initialTitleOffsetsRef = useRef(initialTitleOffsets)
  const setInitialTitleOffsets = (data: any) => {
    initialTitleOffsetsRef.current = data
    _setInitialTitleOffsets(data)
  }

  const opacityRef = useRef(opacity)
  const setOpacity = (data: any) => {
    opacityRef.current = data
    _setOpacity(data)
  }

  const currentScrollOffsetRef = useRef(currentScrollOffset)
  const setCurrentScrollOffset = (data: any) => {
    currentScrollOffsetRef.current = data
    _setCurrentScrollOffset(data)
  }

  const handler = useCallback(() => {
    // MODIFIED CODE
    if (!scrollContainerRef?.current) return

    const shadowOpacity = Math.min(
      scrollContainerRef.current.scrollTop / 200,
      0.12
    )

    setCurrentScrollOffset(shadowOpacity)

    if (!titleRef?.current || !initialTitleOffsetsRef?.current) return

    const titleTop = titleRef.current.getBoundingClientRect().top - 48
    const titleBottom = titleRef.current.getBoundingClientRect().bottom - 56
    const initialOffsets = initialTitleOffsetsRef.current

    let offsetAmount =
      parseFloat((titleBottom / initialOffsets.bottom).toFixed(2)) * 100

    let opacityOffset =
      parseFloat((titleTop / initialOffsets.top).toFixed(2)) * -1

    setOffset(Math.min(Math.max(offsetAmount, 0), 100))
    setOpacity(opacityOffset)
  }, [title, titleRef, scrollContainerRef])

  useEffect(() => {
    scrollContainerRef?.current?.addEventListener('scroll', handler)
    return () =>
      scrollContainerRef?.current?.removeEventListener('scroll', handler)
  }, [title, titleRef, scrollContainerRef])

  useEffect(() => {
    if (!titleRef?.current || !scrollContainerRef?.current) return
    scrollContainerRef.current.scrollTop = 0
    setOpacity(0)
    setInitialTitleOffsets({
      bottom: titleRef.current.getBoundingClientRect().bottom - 56,
      top: titleRef.current.getBoundingClientRect().top - 48,
    })
  }, [title, titleRef, scrollContainerRef])

  return (
    <>
      <div
        style={{
          background: `rgba(50,50,50) ,${
            currentScrollOffset === 0
              ? currentScrollOffset
              : currentScrollOffset + 0.5
          })`,
          boxShadow: `0 1px 3px rgba(0,0,0,${currentScrollOffset})`,
          minHeight: '48px',
        }}
        className="filter-blur sticky top-0 z-10 flex flex-col justify-center px-3 py-2"
      >
        <div className="flex flex-none items-center justify-between">
          <span className="flex items-center space-x-3">
            {globalMenu && (
              <span
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-gray-200 dark:hover:bg-gray-800 flex cursor-pointer items-center justify-center rounded-md p-2 lg:hidden"
              >
                {isOpen ? (
                  <X size={16} className="text-primary" />
                ) : (
                  <Menu size={16} className="text-primary" />
                )}
              </span>
            )}

            {backButton && (
              <Link
                href={backButtonHref ?? ''}
                className="hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center rounded-md p-2 text-primary"
                aria-label="Back"
              >
                <ArrowLeft size={16} className="text-primary" />
              </Link>
            )}
            {leadingAccessory && <>{leadingAccessory}</>}
            <h2
              style={
                magicTitle
                  ? {
                      transform: `translateY(${offset}%)`,
                      opacity: `${opacity}`,
                    }
                  : {}
              }
              className="line-clamp-1 transform-gpu text-sm font-bold text-primary"
            >
              {title}
            </h2>
          </span>

          {trailingAccessory && <>{trailingAccessory}</>}
        </div>

        <div>{children}</div>
      </div>
    </>
  )
}
