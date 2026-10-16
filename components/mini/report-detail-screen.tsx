'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Info, MoveHorizontal, Share2, Sparkles } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

export type ReportSummary = {
  id: string
  product: string
  examinee: string
  relation: string
  date: string
}

type Advice = '降低剂量' | '增加剂量' | '更换药物'

type SummaryRow = { drug: string; adverse: boolean; insufficient: boolean; advice: Advice }

type DetailRow = { drug: string; advice: Advice; gene: string; level: string; source: string; result: string }

const stats = [
  { value: 28, label: '检测药物', color: 'text-primary' },
  { value: 9, label: '警惕不良反应', color: 'text-primary' },
  { value: 15, label: '警惕疗效不足', color: 'text-[#e07b35]' },
]

const summaryRows: SummaryRow[] = [
  { drug: '华法林', adverse: true, insufficient: false, advice: '降低剂量' },
  { drug: '醋硝香豆素', adverse: true, insufficient: false, advice: '降低剂量' },
  { drug: '氯吡格雷', adverse: false, insufficient: true, advice: '增加剂量' },
  { drug: '普萘洛尔', adverse: false, insufficient: true, advice: '增加剂量' },
  { drug: '卡维地洛', adverse: true, insufficient: false, advice: '降低剂量' },
  { drug: '依那普利', adverse: true, insufficient: true, advice: '更换药物' },
  { drug: '阿司匹林', adverse: true, insufficient: true, advice: '更换药物' },
  { drug: '地高辛', adverse: true, insufficient: false, advice: '降低剂量' },
]

const detailRows: DetailRow[] = [
  { drug: '华法林', advice: '降低剂量', gene: 'CYP2C9', level: '1A', source: 'CPIC/DPWG', result: '*1/*1' },
  { drug: '华法林', advice: '降低剂量', gene: 'VKORC1-rs2359612', level: '1B', source: 'PharmGKB', result: 'A/A' },
  { drug: '醋硝香豆素', advice: '降低剂量', gene: 'CYP2C9', level: '2A', source: 'PharmGKB', result: '*1/*1' },
  { drug: '氯吡格雷', advice: '增加剂量', gene: 'CYP2C19', level: '1A', source: 'CPIC', result: '*1/*2' },
  { drug: '普萘洛尔', advice: '增加剂量', gene: 'ADRB2-rs1042713', level: '3', source: 'PharmGKB', result: 'G/G' },
  { drug: '卡维地洛', advice: '降低剂量', gene: 'CYP2D6', level: '1A', source: 'DPWG', result: '*1/*1' },
  { drug: '依那普利', advice: '更换药物', gene: 'SLCO1B1', level: '1A', source: 'CPIC', result: '*1/*1' },
  { drug: '阿司匹林', advice: '更换药物', gene: 'PEAR1-rs12041331', level: '2B', source: 'PharmGKB', result: 'G/A' },
]

const adviceColor: Record<Advice, string> = {
  降低剂量: 'text-primary',
  增加剂量: 'text-[#e07b35]',
  更换药物: 'text-[#d9542c]',
}

function SectionTitle({ id, title, extra }: { id: string; title: string; extra?: string }) {
  return (
    <div className="mb-2 mt-5 flex items-end justify-between px-1">
      <h2 id={id} className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
        <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
        {title}
      </h2>
      {extra && <span className="text-[12px] text-muted-foreground">{extra}</span>}
    </div>
  )
}

function Mark({ on, label }: { on: boolean; label: string }) {
  return on ? (
    <>
      <Check className="mx-auto size-4 text-primary" strokeWidth={2.5} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </>
  ) : (
    <span className="sr-only">无</span>
  )
}

export function ReportDetailScreen({
  report,
  onBack,
  onAiInterpret,
}: {
  report: ReportSummary
  onBack: () => void
  onAiInterpret?: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; left: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [thumb, setThumb] = useState({ size: 1, offset: 0 })

  const updateProgress = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const size = Math.min(1, el.clientWidth / el.scrollWidth)
    const max = el.scrollWidth - el.clientWidth
    setThumb({ size, offset: max > 0 ? (el.scrollLeft / max) * (1 - size) : 0 })
  }, [])

  useEffect(() => {
    updateProgress()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateProgress)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateProgress])

  // Touch devices already swipe natively; only mouse/pen need drag-to-scroll.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !scrollRef.current) return
    drag.current = { x: e.clientX, left: scrollRef.current.scrollLeft }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !scrollRef.current) return
    scrollRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }
  const endDrag = () => {
    drag.current = null
    setDragging(false)
  }

  return (
    <SubPage title="报告详情" titleId="report-detail-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3 [scrollbar-width:none]">
        <section aria-label="报告信息" className="rounded-2xl bg-primary px-4 py-4 text-primary-foreground">
          <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px]">平台正式检测报告</span>
          <p className="mt-2.5 text-[18px] font-semibold">{report.product}</p>
          <p className="mt-1 text-[12px] opacity-80">
            报告编号：<span className="tabular-nums">{report.id}</span> · 检测人：{report.examinee}
          </p>
        </section>

        <ul aria-label="检测概况" className="mt-2.5 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <li key={s.label} className="rounded-2xl bg-white py-3 text-center">
              <p className={cn('text-[20px] font-semibold tabular-nums', s.color)}>{s.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
            </li>
          ))}
        </ul>

        <section aria-labelledby="summary-title">
          <SectionTitle id="summary-title" title="1. 结果摘要" />
          <div className="overflow-hidden rounded-2xl bg-white">
            <table className="w-full table-fixed text-center text-[12px]">
              <thead className="text-foreground">
                <tr className="bg-[#eaf1fd]">
                  <th scope="col" rowSpan={2} className="w-[26%] px-2 py-2 font-medium">
                    药物名称
                  </th>
                  <th scope="colgroup" colSpan={2} className="border-b border-white bg-[#fdf0e4] px-2 py-1.5 font-medium text-[#c8662a]">
                    风险提示
                  </th>
                  <th scope="col" rowSpan={2} className="w-[24%] px-2 py-2 font-medium">
                    用药建议
                  </th>
                </tr>
                <tr className="bg-[#eaf1fd] text-[11px]">
                  <th scope="col" className="px-1 py-1.5 font-medium">
                    警惕不良反应
                  </th>
                  <th scope="col" className="px-1 py-1.5 font-medium">
                    警惕疗效不足
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f6]">
                {summaryRows.map((r) => (
                  <tr key={r.drug}>
                    <th scope="row" className="px-2 py-2.5 font-medium text-foreground">
                      {r.drug}
                    </th>
                    <td className="py-2.5">
                      <Mark on={r.adverse} label="警惕不良反应" />
                    </td>
                    <td className="py-2.5">
                      <Mark on={r.insufficient} label="警惕疗效不足" />
                    </td>
                    <td className={cn('px-2 py-2.5 font-medium', adviceColor[r.advice])}>{r.advice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="result-title">
          <SectionTitle id="result-title" title="2. 检测结果" extra="2.1 心血管疾病用药指导" />
          <div className="overflow-hidden rounded-2xl bg-white">
            <div
              ref={scrollRef}
              tabIndex={0}
              aria-label="检测结果表格，可左右滑动"
              onScroll={updateProgress}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={cn(
                'select-none overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-scrollbar]:hidden',
                dragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
            >
              <table className="w-max min-w-full text-left text-[12px]">
                <thead className="bg-[#eaf1fd] text-foreground">
                  <tr>
                    {['药物名称', '用药建议', '检测基因', '证据等级', '证据来源', '检测结果'].map((h, i) => (
                      <th
                        key={h}
                        scope="col"
                        className={cn(
                          'whitespace-nowrap px-3 py-2.5 font-medium',
                          i === 0 && 'sticky left-0 z-10 bg-[#eaf1fd] shadow-[4px_0_6px_-4px_rgba(30,60,120,0.18)]',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f6]">
                  {detailRows.map((r) => (
                    <tr key={`${r.drug}-${r.gene}`}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-2.5 font-medium text-foreground shadow-[4px_0_6px_-4px_rgba(30,60,120,0.18)]"
                      >
                        {r.drug}
                      </th>
                      <td className={cn('whitespace-nowrap px-3 py-2.5', adviceColor[r.advice])}>{r.advice}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-foreground">{r.gene}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-foreground">{r.level}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.source}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-foreground">{r.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center gap-1.5 border-t border-[#eef1f6] py-2">
              <div className="h-1 w-12 overflow-hidden rounded-full bg-[#e3e9f3]" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${thumb.size * 100}%`, transform: `translateX(${(thumb.offset / thumb.size) * 100}%)` }}
                />
              </div>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MoveHorizontal className="size-3.5" aria-hidden="true" />
                左右滑动查看完整检测结果
              </p>
            </div>
          </div>
        </section>

        <p className="mx-1 mt-4 flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          检测结果仅供专业参考，不构成医疗建议，不替代临床诊断、处方或治疗决策。实际报告内容以实验室正式出具版本为准。
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 border-t border-[#eef1f6] bg-white px-3 pb-6 pt-2.5">
        <button
          type="button"
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#dfe5ef] text-[14px] text-foreground"
        >
          <Share2 className="size-4" aria-hidden="true" />
          分享报告
        </button>
        <button
          type="button"
          onClick={onAiInterpret}
          className="flex h-10 flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-medium text-primary-foreground"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          AI解读
        </button>
      </div>
    </SubPage>
  )
}
