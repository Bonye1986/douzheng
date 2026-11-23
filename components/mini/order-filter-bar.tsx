'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ListFilter, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OrderTypeFilter = 'all' | 'self' | 'site'

const typeOptions: { key: OrderTypeFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'self', label: '自采样' },
  { key: 'site', label: '定点采样' },
]

type Option<K extends string> = { key: K; label: string }

export function OrderFilterBar<S extends string>({
  keyword,
  onKeywordChange,
  type,
  onTypeChange,
  status,
  statusOptions,
  onStatusChange,
  isStatusAvailable,
}: {
  keyword: string
  onKeywordChange: (value: string) => void
  type: OrderTypeFilter
  onTypeChange: (value: OrderTypeFilter) => void
  status: S
  statusOptions: Option<S>[]
  onStatusChange: (value: S) => void
  isStatusAvailable?: (status: S, type: OrderTypeFilter) => boolean
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const defaultStatus = statusOptions[0].key
  const activeCount = (type !== 'all' ? 1 : 0) + (status !== defaultStatus ? 1 : 0)

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 bg-white px-3 pb-1.5 pt-1">
        <label className="flex h-9 flex-1 items-center gap-1.5 rounded-full bg-muted px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">搜索订单</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="搜索订单号 / 检测项目 / 受检人"
            className="min-w-0 flex-1 bg-transparent text-note text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => onKeywordChange('')}
              aria-label="清空搜索"
              className="flex size-4 items-center justify-center rounded-full bg-muted-foreground/40 text-white"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          )}
        </label>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen(true)}
          className={cn(
            'flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-note transition-colors',
            activeCount > 0 ? 'bg-primary/10 font-medium text-primary' : 'bg-muted text-foreground',
          )}
        >
          <ListFilter className="size-4" aria-hidden="true" />
          筛选
          {activeCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-tag tabular-nums text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {sheetOpen && (
        <OrderFilterSheet
          type={type}
          status={status}
          statusOptions={statusOptions}
          isStatusAvailable={isStatusAvailable}
          onClose={() => setSheetOpen(false)}
          onApply={(nextType, nextStatus) => {
            onTypeChange(nextType)
            onStatusChange(nextStatus)
            setSheetOpen(false)
          }}
        />
      )}
    </>
  )
}

function OrderFilterSheet<S extends string>({
  type,
  status,
  statusOptions,
  isStatusAvailable = () => true,
  onClose,
  onApply,
}: {
  type: OrderTypeFilter
  status: S
  statusOptions: Option<S>[]
  isStatusAvailable?: (status: S, type: OrderTypeFilter) => boolean
  onClose: () => void
  onApply: (type: OrderTypeFilter, status: S) => void
}) {
  const [draftType, setDraftType] = useState(type)
  const [draftStatus, setDraftStatus] = useState(status)
  const visibleStatusOptions = statusOptions.filter((o) => isStatusAvailable(o.key, draftType))
  const changeDraftType = (nextType: OrderTypeFilter) => {
    setDraftType(nextType)
    if (!isStatusAvailable(draftStatus, nextType)) setDraftStatus(statusOptions[0].key)
  }
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button type="button" aria-label="关闭" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-foreground/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-filter-title"
        className="relative flex max-h-[75%] flex-col rounded-t-3xl bg-white"
      >
        <header className="flex items-center justify-between px-4 pb-2 pt-4">
          <h2 id="order-filter-title" className="text-title font-semibold text-foreground">
            筛选订单
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

        <div className="flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none]">
          <FilterGroup title="采样方式" options={typeOptions} value={draftType} onChange={changeDraftType} />
          <FilterGroup title="订单状态" options={visibleStatusOptions} value={draftStatus} onChange={setDraftStatus} />
        </div>

        <footer className="flex shrink-0 gap-2.5 border-t border-border px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          <button
            type="button"
            onClick={() => {
              setDraftType('all')
              setDraftStatus(statusOptions[0].key)
            }}
            className="h-10 flex-1 rounded-full border border-border text-body text-foreground"
          >
            重置
          </button>
          <button
            type="button"
            onClick={() => onApply(draftType, draftStatus)}
            className="h-10 flex-[2] rounded-full bg-primary text-body font-medium text-primary-foreground"
          >
            确定
          </button>
        </footer>
      </div>
    </div>
  )
}

function FilterGroup<K extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: Option<K>[]
  value: K
  onChange: (value: K) => void
}) {
  return (
    <fieldset className="mt-3 first:mt-1">
      <legend className="text-caption text-muted-foreground">{title}</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {options.map((o) => {
          const active = o.key === value
          return (
            <button
              key={o.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.key)}
              className={cn(
                'relative flex h-9 items-center justify-center rounded-xl border text-note transition-colors',
                active ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border text-foreground',
              )}
            >
              {o.label}
              {active && <Check className="absolute right-1.5 top-1.5 size-3" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
