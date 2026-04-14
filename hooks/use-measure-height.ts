"use client"

import { useState, useLayoutEffect, useRef, useEffect } from "react"

export function useMeasureHeight() {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    if (!ref.current) return

    // Set initial height
    setHeight(ref.current.offsetHeight)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === ref.current) {
          // Get the content height including padding
          const contentHeight = entry.contentRect.height
          setHeight(contentHeight)
        }
      }
    })

    resizeObserver.observe(ref.current)
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Update height whenever content changes
  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight)
    }
  })

  return { ref, height }
}
