'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { ReportDetailScreen } from '@/components/mini/report-detail-screen'
import { cn } from '@/lib/utils'

type Report = {
  id: string
  product: string
  examinee: string
  relation: string
  status: 'ready' | 'testing'
  date: string
  unread?: boolean
  resample?: boolean
  step?: number
}

const reports: Report[] = [
  {
    id: 'BG20261008001',
    product: '儿童安全用药基因检测',
    examinee: '李秀兰',
    relation: '母亲',
    status: 'ready',
    date: '2026-10-08',
    unread: true,
  },
  {
    id: 'BG20260920004',
    product: '心血管用药基因检测',
    examinee: '王建国',
    relation: '父亲',
    status: 'ready',
    date: '2026-09-20',
  },
]

export const unreadReportCount = reports.filter((r) => r.unread).length

export function ReportListScreen({ onBack, initialDetailId }: { onBack: () => void; initialDetailId?: string }) {
  const examinees = ['全部', ...Array.from(new Set(reports.map((r) => r.examinee)))]
  const [examinee, setExaminee] = useState('全部')
  const [detailId, setDetailId] = useState<string | undefined>(initialDetailId)
  const detail = reports.find((r) => r.id === detailId && r.status === 'ready')
  const visible = reports.filter((r) => examinee === '全部' || r.examinee === examinee)

  return (
    <SubPage title="我的报告" titleId="report-list-title" onBack={onBack}>
      <div role="tablist" aria-label="按受检人筛选" className="flex shrink-0 gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none]">
        {examinees.map((name) => {
          const active = examinee === name
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setExaminee(name)}
              className={cn(
                'h-7 shrink-0 rounded-full px-3.5 text-[12px] transition-colors',
                active ? 'bg-primary font-medium text-primary-foreground' : 'bg-white text-muted-foreground',
              )}
            >
              {name}
            </button>
          )
        })}
      </div>

      <ul className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-6 [scrollbar-width:none]">
        {visible.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white p-3.5">
            <div className="flex items-center gap-3">
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden="true" />
                {r.unread && (
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#e5603a] ring-2 ring-white">
                    <span className="sr-only">新报告</span>
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[14px] font-medium text-foreground">{r.product}</p>
                  {r.resample && (
                    <span className="shrink-0 rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">重采样</span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {r.examinee}（{r.relation}） · <span className="tabular-nums">{r.date}</span>
                   出具
  </p>
  </div>
  <button
  type="button"
  onClick={() => setDetailId(r.id)}
  aria-label={`查看${r.examinee}的${r.product}报告`}
  className="h-7 shrink-0 rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground"
  >
  查看
  </button>
  </div>
  </li>
        ))}
        <li className="px-2 pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
          报告结果仅供临床用药参考，调整用药请遵医嘱
        </li>
      </ul>
      {detail && <ReportDetailScreen report={detail} onBack={() => setDetailId(undefined)} />}
    </SubPage>
  )
}
