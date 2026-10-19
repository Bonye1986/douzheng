'use client'

import { useRef, useState, type PointerEvent } from 'react'
import { Sparkles } from 'lucide-react'

const EDGE_GAP = 12
const TOP_SAFE = 96
const BOTTOM_SAFE = 84
const DRAG_THRESHOLD = 5

type Position = { left: number; top: number }

export function FloatingAiButton({ onClick }: { onClick: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ startX: number; startY: number; originLeft: number; originTop: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const lastPosition = useRef<Position | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const [dragging, setDragging] = useState(false)

  const clamp = (left: number, top: number): Position => {
    const button = buttonRef.current
    const parent = button?.offsetParent as HTMLElement | null
    if (!button || !parent) return { left, top }
    const maxLeft = parent.clientWidth - button.offsetWidth - EDGE_GAP
    const maxTop = parent.clientHeight - button.offsetHeight - BOTTOM_SAFE
    return {
      left: Math.min(Math.max(left, EDGE_GAP), maxLeft),
      top: Math.min(Math.max(top, TOP_SAFE), maxTop),
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (!button) return
    suppressClick.current = false
    button.setPointerCapture(event.pointerId)
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originLeft: button.offsetLeft,
      originTop: button.offsetTop,
      moved: false,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = drag.current
    if (!state) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    state.moved = true
    setDragging(true)
    const next = clamp(state.originLeft + dx, state.originTop + dy)
    lastPosition.current = next
    setPosition(next)
  }

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const state = drag.current
    const button = buttonRef.current
    drag.current = null
    setDragging(false)
    if (button?.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId)
    if (!state?.moved || !button) return
    suppressClick.current = true
    const parent = button.offsetParent as HTMLElement | null
    if (!parent) return
    const current = lastPosition.current ?? { left: button.offsetLeft, top: button.offsetTop }
    const centerX = current.left + button.offsetWidth / 2
    const snapLeft = centerX < parent.clientWidth / 2 ? EDGE_GAP : parent.clientWidth - button.offsetWidth - EDGE_GAP
    setPosition(clamp(snapLeft, current.top))
  }

  const handleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    onClick()
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="打开 AI 咨询（可拖动调整位置）"
      style={position ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' } : undefined}
      className={`absolute bottom-[92px] right-3 z-20 flex size-11 touch-none select-none items-center justify-center rounded-full bg-brand-strong text-white shadow-[0_6px_14px_#3a82e440] ring-2 ring-white/90 ${
        dragging ? 'scale-110 cursor-grabbing' : 'cursor-grab transition-[left,top,transform] duration-200 ease-out active:scale-95'
      }`}
    >
      <Sparkles className="size-4.5" strokeWidth={2.2} />
    </button>
  )
}
