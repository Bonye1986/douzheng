'use client'

import { useState } from 'react'
import { Check, Clock, Hospital, LocateFixed, MapPin, Microscope, Navigation, Search, X } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { siteTypeLabel, sites } from '@/components/mini/checkout-data'
import { sampleTypeCatalog } from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

type Props = {
  selected: string | null
  onBack: () => void
  onSelect: (id: string) => void
}

export function SiteListScreen({ selected, onBack, onSelect }: Props) {
  const [keyword, setKeyword] = useState('')

  const q = keyword.trim()
  const list = sites
    .filter((s) => !q || `${s.name}${s.district}${s.detail}`.includes(q))
    .sort((a, b) => a.distance - b.distance)

  const sampleLabels = sampleTypeCatalog.filter((t) => t.modes.includes('site')).map((t) => t.label)

  return (
    <SubPage title="定点采样机构" titleId="site-list-title" onBack={onBack}>
      <div className="shrink-0 bg-white px-3 pb-2.5">
        <label className="flex h-9 items-center gap-2 rounded-full bg-muted px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">搜索采样机构</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索机构名称、区域或地址"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
          />
          {keyword && (
            <button type="button" onClick={() => setKeyword('')} aria-label="清除搜索" className="text-muted-foreground">
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 px-4 py-2 text-[12px] text-muted-foreground">
        <LocateFixed className="size-3.5 text-primary" aria-hidden="true" />
        <span>当前定位：长沙市芙蓉区</span>
        <span className="ml-auto">按距离排序 · {list.length} 家</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 [scrollbar-width:none]">
        {list.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <MapPin className="size-10 text-[#c3ccdb]" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-3 text-[14px] text-foreground">附近暂无符合条件的机构</p>
            <p className="mt-1 text-[12px] text-muted-foreground">换个关键词试试</p>
          </div>
        ) : (
          <ul role="radiogroup" aria-label="定点采样机构" className="flex flex-col gap-2.5">
            {list.map((s) => {
              const active = s.id === selected
              const TypeIcon = s.type === 'hospital' ? Hospital : Microscope
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onSelect(s.id)}
                    className={cn(
                      'relative w-full rounded-2xl border bg-white p-3.5 text-left transition-colors',
                      active ? 'border-primary' : 'border-transparent',
                    )}
                  >
                    <span className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-xl',
                          s.type === 'hospital' ? 'bg-secondary text-primary' : 'bg-success-soft text-success',
                        )}
                      >
                        <TypeIcon className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block pr-14 text-[14px] font-medium leading-5 text-foreground">{s.name}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1">
                          <span className="rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
                            {siteTypeLabel[s.type]}
                          </span>
                          <span
                            className={cn(
                              'rounded px-1.5 py-px text-[10px]',
                              s.todayAvailable ? 'bg-success-soft text-success' : 'bg-[#fff7ec] text-[#c27a1a]',
                            )}
                          >
                            {s.todayAvailable ? '今日可采' : '明日起可约'}
                          </span>
                        </span>
                      </span>
                    </span>
                    <span className="absolute right-3.5 top-3.5 text-[12px] font-medium tabular-nums text-foreground">
                      {s.distance} km
                    </span>

                    <span className="mt-2.5 flex flex-col gap-1 border-t border-border pt-2.5 text-[12px] leading-[18px] text-muted-foreground">
                      <span className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        {s.district} {s.detail}
                      </span>
                      <span className="flex items-start gap-1.5">
                        <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        {s.time}
                      </span>
                    </span>

                    <span className="mt-2.5 flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                        可采：{sampleLabels.join(' / ')}
                      </span>
                      <span className="flex shrink-0 items-center gap-0.5 text-[12px] text-primary">
                        <Navigation className="size-3" aria-hidden="true" />
                        导航
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-[12px] font-medium',
                          active ? 'bg-primary text-primary-foreground' : 'border border-primary text-primary',
                        )}
                      >
                        {active && <Check className="size-3" strokeWidth={3} />}
                        {active ? '已选择' : '选择'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </SubPage>
  )
}
