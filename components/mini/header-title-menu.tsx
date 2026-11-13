'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** 顶栏居中标题 drugene，点开为「语音播报」开关小菜单（参考元宝小程序）。 */
export function HeaderTitleMenu() {
  const [open, setOpen] = useState(false)
  const [speak, setSpeak] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-0.5 rounded-full px-2 active:bg-white/70"
      >
        <span className="text-[17px] font-semibold tracking-tight text-foreground">drugene</span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-50 mt-1.5 w-48 -translate-x-1/2 rounded-2xl bg-white p-1.5 shadow-[0_12px_32px_#1e3a8a24] ring-1 ring-border"
        >
          <div className="flex h-11 items-center justify-between rounded-xl px-3">
            <span id="speak-label" className="text-[14px] text-foreground">
              语音播报
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={speak}
              aria-labelledby="speak-label"
              onClick={() => setSpeak((v) => !v)}
              className={cn('relative h-6 w-10 rounded-full transition-colors', speak ? 'bg-primary' : 'bg-border')}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
                  speak ? 'translate-x-[18px]' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
