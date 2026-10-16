'use client'

import { useState } from 'react'
import { Download, FileText, Sparkles } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
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
  summary?: { adjust: number; caution: number; normal: number }
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
    summary: { adjust: 2, caution: 3, normal: 18 },
  },
  {
    id: 'BG20261009011',
    product: '药物基因检测',
    examinee: '张伟',
    relation: '本人',
    status: 'testing',
    date: '预计 10-20 出具',
    resample: true,
    step: 1,
  },
  {
    id: 'BG20260920004',
    product: '心血管用药基因检测',
    examinee: '王建国',
    relation: '父亲',
    status: 'ready',
    date: '2026-09-20',
    summary: { adjust: 1, caution: 2, normal: 12 },
  },
]

const steps = ['已收样', '检测中', '出具报告']

const summaryItems = [
  { key: 'adjust', label: '需调整', className: 'text-[#e0651c]' },
  { key: 'caution', label: '谨慎使用', className: 'text-[#c9921a]' },
  { key: 'normal', label: '正常使用', className: 'text-[#2f9e6a]' },
] as const

export const unreadReportCount = reports.filter((r) => r.unread).length

export function ReportListScreen({ onBack }: { onBack: () => void }) {
  const examinees = ['全部', ...Array.from(new Set(reports.map((r) => r.examinee)))]
  const [examinee, setExaminee] = useState('全部')
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
            <div className="flex items-start gap-3">
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden="true" />
                {r.unread && (
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#f07a2c] ring-2 ring-white">
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
                  {r.status === 'ready' && ' 出具'}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-[12px] font-medium',
                  r.status === 'ready' ? 'text-[#2f9e6a]' : 'text-primary',
                )}
              >
                {r.status === 'ready' ? '已出具' : '检测中'}
              </span>
            </div>

            {r.summary && (
              <dl className="mt-3 grid grid-cols-3 rounded-xl bg-[#f6f8fc] py-2.5">
                {summaryItems.map((s) => (
                  <div key={s.key} className="flex flex-col items-center gap-0.5">
                    <dd className={cn('text-[17px] font-semibold tabular-nums', s.className)}>{r.summary?.[s.key]}</dd>
                    <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}

            {r.status === 'testing' && r.step !== undefined && (
              <ol aria-label="检测进度" className="mt-3 flex items-center rounded-xl bg-[#f6f8fc] px-3 py-2.5">
                {steps.map((label, i) => {
                  const done = i <= (r.step ?? 0)
                  return (
                    <li key={label} className="flex flex-1 items-center last:flex-none">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn('size-2 rounded-full', done ? 'bg-primary' : 'bg-[#d5dce8]')}
                          aria-hidden="true"
                        />
                        <span
                          className={cn('text-[11px]', done ? 'font-medium text-foreground' : 'text-muted-foreground')}
                          aria-current={i === r.step ? 'step' : undefined}
                        >
                          {label}
                        </span>
                      </span>
                      {i < steps.length - 1 && (
                        <span
                          className={cn('mx-2 h-px flex-1', i < (r.step ?? 0) ? 'bg-primary' : 'bg-[#d5dce8]')}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  )
                })}
              </ol>
            )}

            {r.status === 'ready' && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="flex h-7 items-center gap-1 rounded-full border border-[#dfe5ef] px-3 text-[12px] text-foreground"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  下载 PDF
                </button>
                <button
                  type="button"
                  className="flex h-7 items-center gap-1 rounded-full border border-primary/40 px-3 text-[12px] font-medium text-primary"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  AI 解读
                </button>
                <button
                  type="button"
                  className="h-7 rounded-full bg-primary px-3.5 text-[12px] font-medium text-primary-foreground"
                >
                  查看报告
                </button>
              </div>
            )}
          </li>
        ))}
        <li className="px-2 pt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
          报告结果仅供临床用药参考，调整用药请遵医嘱
        </li>
      </ul>
    </SubPage>
  )
}
