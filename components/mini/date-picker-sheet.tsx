'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const ITEM_H = 40
const VISIBLE = 5
const PAD = ((VISIBLE - 1) / 2) * ITEM_H

const pad2 = (n: number) => String(n).padStart(2, '0')
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate()

type Props = {
  value: string
  max: string
  minYear?: number
  defaultValue?: string
  title?: string
  onCancel: () => void
  onConfirm: (value: string) => void
}

export function DatePickerSheet({
  value,
  max,
  minYear = 1920,
  defaultValue = '1990-01-01',
  title = '选择出生日期',
  onCancel,
  onConfirm,
}: Props) {
  const [maxY, maxM, maxD] = max.split('-').map(Number)
  const [iy, im, id] = (value || defaultValue).split('-').map(Number)
  const [year, setYear] = useState(iy)
  const [month, setMonth] = useState(im)
  const [day, setDay] = useState(id)

  const years = Array.from({ length: maxY - minYear + 1 }, (_, i) => minYear + i)
  const monthCount = year === maxY ? maxM : 12
  const months = Array.from({ length: monthCount }, (_, i) => i + 1)
  const dayCount = year === maxY && month === maxM ? maxD : daysIn(year, month)
  const days = Array.from({ length: dayCount }, (_, i) => i + 1)

  const m = Math.min(month, monthCount)
  const d = Math.min(day, dayCount)

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-labelledby="date-picker-title">
      <button
        type="button"
        aria-label="关闭"
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 motion-safe:animate-in motion-safe:fade-in"
      />
      <div className="relative rounded-t-2xl bg-white pb-6 motion-safe:animate-in motion-safe:slide-in-from-bottom">
        <div className="flex h-12 items-center justify-between border-b border-border px-2">
          <button type="button" onClick={onCancel} className="h-9 px-3 text-body text-muted-foreground">
            取消
          </button>
          <h2 id="date-picker-title" className="text-title font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onConfirm(`${year}-${pad2(m)}-${pad2(d)}`)}
            className="h-9 px-3 text-body font-medium text-primary"
          >
            确定
          </button>
        </div>

        <div className="relative flex px-4 pt-2" style={{ height: VISIBLE * ITEM_H + 8 }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 rounded-lg bg-muted"
            style={{ top: 8 + PAD, height: ITEM_H }}
          />
          <WheelColumn label="年" items={years} value={year} onChange={setYear} format={(v) => `${v}年`} />
          <WheelColumn label="月" items={months} value={m} onChange={setMonth} format={(v) => `${v}月`} />
          <WheelColumn label="日" items={days} value={d} onChange={setDay} format={(v) => `${v}日`} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-2 h-20 bg-gradient-to-b from-white to-white/0"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-white/0"
          />
        </div>
      </div>
    </div>
  )
}

function WheelColumn({
  label,
  items,
  value,
  onChange,
  format,
}: {
  label: string
  items: number[]
  value: number
  onChange: (v: number) => void
  format: (v: number) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const index = Math.max(0, items.indexOf(value))

  useLayoutEffect(() => {
    const el = ref.current
    if (el && Math.abs(el.scrollTop - index * ITEM_H) > 1) el.scrollTop = index * ITEM_H
  }, [index, items.length])

  const handleScroll = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const i = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)))
      if (items[i] !== value) onChange(items[i])
    }, 90)
  }

  const step = (delta: number) => {
    const i = Math.min(items.length - 1, Math.max(0, index + delta))
    onChange(items[i])
  }

  return (
    <div
      ref={ref}
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={`wheel-${label}-${value}`}
      onScroll={handleScroll}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          step(1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          step(-1)
        }
      }}
      className="relative flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-primary/30 [&::-webkit-scrollbar]:hidden"
      style={{ paddingTop: PAD, paddingBottom: PAD }}
    >
      {items.map((v) => (
        <div
          key={v}
          id={`wheel-${label}-${v}`}
          role="option"
          aria-selected={v === value}
          onClick={() => onChange(v)}
          className={cn(
            'flex snap-center items-center justify-center text-title tabular-nums transition-colors',
            v === value ? 'font-semibold text-foreground' : 'text-faint',
          )}
          style={{ height: ITEM_H }}
        >
          {format(v)}
        </div>
      ))}
    </div>
  )
}
