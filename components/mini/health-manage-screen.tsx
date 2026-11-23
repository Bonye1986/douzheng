'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronRight, FileText, FolderOpen, Headset, ShieldAlert } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { ReportDetailScreen } from '@/components/mini/report-detail-screen'
import { cn } from '@/lib/utils'

type Source = 'platform' | 'upload'

type HealthReport = {
  id: string
  name: string
  examinee: string
  relation: string
  source: Source
  date: string
  claimed?: boolean
  fileName?: string
  fileSize?: string
  broken?: boolean
}

const seedReports: HealthReport[] = [
  { id: 'BG20261008001', name: '儿童安全用药基因检测', examinee: '李秀兰', relation: '母亲', source: 'platform', date: '2026-10-08' },
  { id: 'BG20260920004', name: '心血管用药基因检测', examinee: '王建国', relation: '父亲', source: 'platform', date: '2026-09-20' },
  { id: 'BG20260612002', name: '精神神经用药基因检测', examinee: '张伟', relation: '本人', source: 'platform', date: '2026-06-12', claimed: true },
  { id: 'UP20261102001', name: '湘雅医院 · 肝功能检查报告', examinee: '王建国', relation: '父亲', source: 'upload', date: '2026-11-02', fileName: '肝功能检查报告.pdf', fileSize: '1.8 MB' },
  { id: 'UP20260815003', name: '外院 CYP2C19 基因检测报告', examinee: '张伟', relation: '本人', source: 'upload', date: '2026-08-15', fileName: 'CYP2C19检测.pdf', fileSize: '3.2 MB', broken: true },
]

const examineeOptions = [
  { name: '张伟', relation: '本人' },
  { name: '王建国', relation: '父亲' },
  { name: '李秀兰', relation: '母亲' },
]

const sourceTabs: { key: 'all' | Source; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'platform', label: '本平台生成' },
  { key: 'upload', label: '手动上传' },
]

const timeOptions = [
  { key: 'all', label: '全部时间', days: Infinity },
  { key: '3m', label: '近 3 个月', days: 92 },
  { key: '1y', label: '近 1 年', days: 366 },
] as const

const TODAY = new Date('2026-11-17')
const MAX_SIZE_MB = 20

function withinDays(date: string, days: number) {
  if (!Number.isFinite(days)) return true
  return (TODAY.getTime() - new Date(date).getTime()) / 86400000 <= days
}

export function HealthManageScreen({
  onBack,
  initialSource = 'all',
  initialFileId,
  empty,
}: {
  onBack: () => void
  initialSource?: 'all' | Source
  initialFileId?: string
  empty?: boolean
}) {
  const reports = empty ? [] : seedReports
  const [source, setSource] = useState<'all' | Source>(initialSource)
  const [examinee, setExaminee] = useState('全部')
  const [time, setTime] = useState<(typeof timeOptions)[number]['key']>('all')
  const [platformId, setPlatformId] = useState<string>()
  const [fileId, setFileId] = useState<string | undefined>(initialFileId)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const days = timeOptions.find((o) => o.key === time)!.days
  const visible = reports
    .filter((r) => source === 'all' || r.source === source)
    .filter((r) => examinee === '全部' || r.examinee === examinee)
    .filter((r) => withinDays(r.date, days))
    .sort((a, b) => b.date.localeCompare(a.date))

  const counts = {
    all: reports.length,
    platform: reports.filter((r) => r.source === 'platform').length,
    upload: reports.filter((r) => r.source === 'upload').length,
  }
  const platformReport = reports.find((r) => r.id === platformId)
  const fileReport = reports.find((r) => r.id === fileId)
  const examinees = ['全部', ...Array.from(new Set(reports.map((r) => r.examinee)))]

  return (
    <SubPage title="健康管理" titleId="health-manage-title" onBack={onBack}>
      <div className="shrink-0 bg-white px-3 pb-2.5 pt-2">
        <div role="tablist" aria-label="按报告来源浏览" className="flex rounded-full bg-background p-0.5">
          {sourceTabs.map((t) => {
            const active = source === t.key
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSource(t.key)}
                className={cn(
                  'h-8 flex-1 rounded-full text-caption transition-colors',
                  active ? 'bg-white font-semibold text-primary shadow-sm' : 'text-muted-foreground',
                )}
              >
                {t.label}
                <span className="ml-0.5 tabular-nums">{counts[t.key]}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <FilterSelect label="受检人" value={examinee} onChange={setExaminee} options={examinees.map((n) => ({ value: n, label: n === '全部' ? '全部受检人' : n }))} />
          <FilterSelect
            label="时间"
            value={time}
            onChange={(v) => setTime(v as typeof time)}
            options={timeOptions.map((o) => ({ value: o.key, label: o.label }))}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]">
        {reports.length === 0 ? (
          <EmptyState onTest={() => setToast('请前往底部「检测」选购检测服务')} onAsk={onBack} />
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-caption text-muted-foreground">暂无符合筛选条件的报告</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {visible.map((r) => (
              <li key={r.id}>
                <ReportRow report={r} onView={() => (r.source === 'platform' ? setPlatformId(r.id) : setFileId(r.id))} />
              </li>
            ))}
            <li className="px-2 pt-1 text-center text-caption leading-relaxed text-muted-foreground">
              外部报告可在首页 AI 对话中上传；手动上传报告仅作档案留存，平台不做内容核对，不参与 AI 结论生成
            </li>
          </ul>
        )}
      </div>

      {platformReport && (
        <ReportDetailScreen
          report={{
            id: platformReport.id,
            product: platformReport.name,
            examinee: platformReport.examinee,
            relation: platformReport.relation,
            date: platformReport.date,
          }}
          onBack={() => setPlatformId(undefined)}
        />
      )}
      {fileReport && <UploadedFileScreen report={fileReport} onBack={() => setFileId(undefined)} />}

      {toast && (
        <div role="status" className="pointer-events-none absolute inset-x-0 top-1/2 z-50 flex justify-center px-8">
          <span className="rounded-lg bg-foreground/85 px-4 py-2.5 text-caption text-background">{toast}</span>
        </div>
      )}
    </SubPage>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full appearance-none rounded-lg bg-background pl-3 pr-7 text-caption text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </label>
  )
}

function ReportRow({ report: r, onView }: { report: HealthReport; onView: () => void }) {
  const isPlatform = r.source === 'platform'
  return (
    <button
      type="button"
      onClick={onView}
      aria-label={`查看${r.name}`}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition-colors active:bg-background"
    >
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-background">
        {isPlatform ? (
          <Image src="/images/report-cover.png" alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-0.5 text-muted-foreground">
            <FileText className="size-5" aria-hidden="true" />
            <span className="text-tag font-semibold">PDF</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'shrink-0 rounded px-1 text-tag font-medium',
              isPlatform ? 'bg-primary/10 text-primary' : 'bg-warning/15 text-warning',
            )}
          >
            {isPlatform ? '本平台' : '手动上传'}
          </span>
          {r.claimed && <span className="shrink-0 rounded bg-background px-1 text-tag text-muted-foreground">分享认领</span>}
        </div>
        <h3 className="mt-1 line-clamp-1 text-body font-medium text-foreground">{r.name}</h3>
        <p className="mt-0.5 text-caption text-muted-foreground">
          {r.examinee}（{r.relation}） · <span className="tabular-nums">{r.date}</span> {isPlatform ? '出具' : '上传'}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  )
}

function EmptyState({ onTest, onAsk }: { onTest: () => void; onAsk: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FolderOpen className="size-8" aria-hidden="true" />
      </span>
      <p className="mt-4 text-body font-medium text-foreground">还没有报告</p>
      <p className="mt-1 text-caption leading-relaxed text-muted-foreground">
        可在首页 AI 对话中上传外部检测报告统一留存，或前往检测获取个体化用药报告
      </p>
      <div className="mt-6 flex w-full gap-2.5">
        <button type="button" onClick={onTest} className="h-10 flex-1 rounded-full border border-primary text-body font-medium text-primary">
          前往检测
        </button>
        <button type="button" onClick={onAsk} className="h-10 flex-1 rounded-full bg-primary text-body font-medium text-primary-foreground">
          去首页上传
        </button>
      </div>
    </div>
  )
}

function UploadedFileScreen({ report, onBack }: { report: HealthReport; onBack: () => void }) {
  return (
    <SubPage title="报告原文" titleId="uploaded-file-title" onBack={onBack}>
      <div className="shrink-0 bg-white px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-warning/15 px-1 text-tag font-medium text-warning">手动上传</span>
          <h2 className="truncate text-body font-medium text-foreground">{report.name}</h2>
        </div>
        <p className="mt-0.5 text-caption text-muted-foreground">
          {report.examinee}（{report.relation}） · <span className="tabular-nums">{report.date}</span> 上传 · {report.fileName}
          {report.fileSize ? ` · ${report.fileSize}` : ''}
        </p>
      </div>

      {report.broken ? (
        <div className="flex flex-1 flex-col items-center px-8 pt-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 text-body font-medium text-foreground">报告暂不可用</p>
          <p className="mt-1 text-caption leading-relaxed text-muted-foreground">文件缺失或已损坏，可在首页 AI 对话中重新上传，或联系客服协助处理</p>
          <button
            type="button"
            className="mt-6 flex h-10 items-center gap-1.5 rounded-full border border-primary px-5 text-body font-medium text-primary"
          >
            <Headset className="size-4" aria-hidden="true" />
            联系客服
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-muted/60 px-3 py-3 [scrollbar-width:none]">
          <div className="flex flex-col gap-3">
            {[1, 2].map((page) => (
              <article key={page} aria-label={`第 ${page} 页`} className="flex min-h-[420px] flex-col bg-white px-4 py-5 shadow-sm">
                {page === 1 && (
                  <header className="border-b border-border pb-3 text-center">
                    <p className="text-body font-semibold text-foreground">{report.name.split(' · ').pop()}</p>
                    <p className="mt-0.5 text-tag text-muted-foreground">外部机构出具 · 原文件展示</p>
                  </header>
                )}
                <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
                  {Array.from({ length: page === 1 ? 12 : 9 }).map((_, i) => (
                    <span key={i} className="h-2 rounded bg-muted" style={{ width: `${60 + ((i * 37) % 40)}%` }} />
                  ))}
                </div>
                <p className="mt-auto pt-4 text-center text-tag tabular-nums text-muted-foreground">
                  第 {page} 页 / 共 2 页
                </p>
              </article>
            ))}
          </div>
          <p className="mt-3 px-2 text-center text-caption leading-relaxed text-muted-foreground">
            本报告由用户自行上传，平台未核对内容，不参与 AI 结论生成
          </p>
        </div>
      )}
    </SubPage>
  )
}
