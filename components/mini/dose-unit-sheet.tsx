'use client'

import { useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const COMMON_UNITS = ['片', '粒', '袋', 'mg', 'ml'] as const

export const UNIT_GROUPS: { title: string; units: string[] }[] = [
  { title: '片剂 / 胶囊 / 包装', units: ['片', '粒', '丸', '袋', '包', '支', '瓶'] },
  { title: '重量', units: ['mg', 'g', 'μg'] },
  { title: '液体', units: ['ml', '滴', '勺'] },
  { title: '外用 / 吸入', units: ['贴', '喷', '揿', '吸', '枚'] },
  { title: '效价', units: ['IU', '单位', '万单位'] },
]

export function DoseUnitSheet({
  value,
  onSelect,
  onClose,
}: {
  value: string
  onSelect: (unit: string) => void
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const UnitButton = ({ u }: { u: string }) => {
    const active = u === value
    return (
      <button
        type="button"
        onClick={() => onSelect(u)}
        aria-pressed={active}
        className={cn(
          'relative flex h-9 items-center justify-center rounded-xl border text-body transition-colors',
          active ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border text-foreground',
        )}
      >
        {u}
        {active && <Check className="absolute right-1.5 top-1.5 size-3" aria-hidden="true" />}
      </button>
    )
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button type="button" aria-label="关闭" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-foreground/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dose-unit-title"
        className="relative flex max-h-[75%] flex-col rounded-t-3xl bg-white"
      >
        <header className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 id="dose-unit-title" className="text-title font-semibold text-foreground">
            选择剂量单位
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-6 [scrollbar-width:none]">
          <section aria-label="常用单位">
            <p className="text-caption text-muted-foreground">常用</p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {COMMON_UNITS.map((u) => (
                <UnitButton key={u} u={u} />
              ))}
            </div>
          </section>

          {UNIT_GROUPS.map((g) => (
            <section key={g.title} aria-label={g.title} className="mt-4">
              <p className="text-caption text-muted-foreground">{g.title}</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {g.units.map((u) => (
                  <UnitButton key={u} u={u} />
                ))}
              </div>
            </section>
          ))}

          <p className="mt-4 text-caption leading-relaxed text-faint">请按药品说明书或医嘱选择单位，如有疑问请咨询医生或药师</p>
        </div>
      </div>
    </div>
  )
}
