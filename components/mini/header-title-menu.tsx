'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const voices = [
  { id: 'warm', name: '温柔女声' },
  { id: 'calm', name: '沉稳男声' },
  { id: 'kind', name: '亲切童声' },
]

/** 顶栏居中标题 drugene，点开为「语音播报 / 音色选择」小菜单（参考元宝小程序）。 */
export function HeaderTitleMenu() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'main' | 'voice'>('main')
  const [speak, setSpeak] = useState(false)
  const [voice, setVoice] = useState(voices[0].id)
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

  const voiceName = voices.find((v) => v.id === voice)?.name

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setView('main')
          setOpen((v) => !v)
        }}
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
          className="absolute left-1/2 top-full z-50 mt-1.5 w-52 -translate-x-1/2 rounded-2xl bg-white p-1.5 shadow-[0_12px_32px_#1e3a8a24] ring-1 ring-border"
        >
          {view === 'main' ? (
            <>
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
                  className={cn(
                    'relative h-6 w-10 rounded-full transition-colors',
                    speak ? 'bg-primary' : 'bg-border',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
                      speak ? 'translate-x-[18px]' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => setView('voice')}
                className="flex h-11 w-full items-center justify-between rounded-xl px-3 text-left active:bg-secondary/60"
              >
                <span className="text-[14px] text-foreground">音色选择</span>
                <span className="flex items-center gap-0.5 text-[12px] text-muted-foreground">
                  {voiceName}
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setView('main')}
                className="flex h-9 w-full items-center gap-1 rounded-xl px-2 text-[13px] text-muted-foreground active:bg-secondary/60"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
                音色选择
              </button>
              {voices.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={voice === v.id}
                  onClick={() => {
                    setVoice(v.id)
                    setView('main')
                  }}
                  className="flex h-11 w-full items-center justify-between rounded-xl px-3 text-left active:bg-secondary/60"
                >
                  <span className={cn('text-[14px]', voice === v.id ? 'font-medium text-primary' : 'text-foreground')}>
                    {v.name}
                  </span>
                  {voice === v.id && <Check aria-hidden="true" className="size-4 text-primary" />}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
