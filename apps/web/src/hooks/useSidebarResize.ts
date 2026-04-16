import { useState, useRef, useEffect } from 'react'

const MIN_WIDTH = 160
const MAX_WIDTH = 320

export function useSidebarResize(initial = 220) {
  const [width, setWidth] = useState(initial)
  const [hovered, setHovered] = useState(false)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const delta = e.clientX - startX.current
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta)))
    }
    const onUp = () => {
      if (isResizing.current) {
        isResizing.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const onDividerMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return { sidebarWidth: width, dividerHovered: hovered, setDividerHovered: setHovered, onDividerMouseDown }
}
