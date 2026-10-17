'use client'

import { useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OrderTypeFilter = 'all' | 'self' | 'site'

const typeOptions: { key: OrderTypeFilter; label: string }[] = [
  { key: 'all', label: '全部类型' },
  { key: 'self', label: '自采样' },
  { key: 'site', label: '定点采样' },
]

export function OrderFilterBar({
  keyword,
  onKeywordChange,
  type,
  onTypeChange,
}: {
  keyword: string
  onKeywordChange: (value: string) => void
  type: OrderTypeFilter
  onTypeChange: (value: OrderTypeFilter) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const current = typeOptions.find((o) => o.key === type) ?? typeOptions[0]

  return (
    <div className="relative z-10 shrink-0 bg-white px-3 pb-1.5 pt-1">
      <div className="flex items-center gap-2">
        <label className="flex h-9 flex-1 items-center gap-1.5 rounded-full bg-[#f1f4f9] px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">搜索订单</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="搜索订单号 / 检测项目 / 受检人"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
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
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            'flex h-9 shrink-0 items-center gap-0.5 rounded-full px-3 text-[13px] transition-colors',
            type === 'all' ? 'bg-[#f1f4f9] text-foreground' : 'bg-primary/10 font-medium text-primary',
          )}
        >
          {current.label}
          <ChevronDown className={cn('size-3.5 transition-transform', menuOpen && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="关闭类型筛选"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 cursor-default"
          />
          <ul
            role="listbox"
            aria-label="订单类型"
            className="absolute right-3 top-full mt-1 w-32 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5"
          >
            {typeOptions.map((o) => {
              const selected = o.key === type
              return (
                <li key={o.key} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onTypeChange(o.key)
                      setMenuOpen(false)
                    }}
                    className={cn(
                      'flex h-10 w-full items-center justify-between px-3.5 text-[13px] active:bg-[#f6f8fc]',
                      selected ? 'font-medium text-primary' : 'text-foreground',
                    )}
                  >
                    {o.label}
                    {selected && <Check className="size-4" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
