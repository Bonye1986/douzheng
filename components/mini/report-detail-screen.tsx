'use client'

import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { ReportPdfShare } from '@/components/mini/report-pdf-share'
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

type DetailRow = { drug: string; advice: Advice; gene: string; site?: string; level: string; source: string; result: string }

const examineeProfiles: Record<string, { gender: string; age: number }> = {
  李秀兰: { gender: '女', age: 58 },
  王建国: { gender: '男', age: 62 },
  张伟: { gender: '男', age: 34 },
}

const stats = [
  { value: 28, label: '检测药物' },
  { value: 9, label: '警惕不良反应' },
  { value: 15, label: '警惕疗效不足' },
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
  { drug: '华法林', advice: '降低剂量', gene: 'CYP2C9', level: '1A', source: 'CPIC', result: '*1/*1' },
  { drug: '华法林', advice: '降低剂量', gene: 'VKORC1', site: 'rs2359612', level: '1B', source: 'PharmGKB', result: 'AA' },
  { drug: '醋硝香豆素', advice: '降低剂量', gene: 'CYP2C9', level: '2A', source: 'PharmGKB', result: '*1/*1' },
  { drug: '氯吡格雷', advice: '增加剂量', gene: 'CYP2C19', level: '1A', source: 'CPIC', result: '*1/*2' },
  { drug: '普萘洛尔', advice: '增加剂量', gene: 'ADRB2', site: 'rs1042713', level: '3', source: 'PharmGKB', result: 'GG' },
  { drug: '卡维地洛', advice: '降低剂量', gene: 'CYP2D6', level: '1A', source: 'DPWG', result: '*1/*1' },
  { drug: '依那普利', advice: '更换药物', gene: 'SLCO1B1', level: '1A', source: 'CPIC', result: '*1/*1' },
  { drug: '阿司匹林', advice: '更换药物', gene: 'PEAR1', site: 'rs12041331', level: '2B', source: 'PharmGKB', result: 'GA' },
]

const notes = [
  '该结果不适用于临床诊断，仅供医生制定用药方案时参考。',
  '用药建议依据 CPIC、DPWG、PharmGKB 等公开指南及证据等级整理，证据等级 1A 为最高。',
  '受限于现有科学认知和检测技术，本检测仅覆盖与所列药物相关的主要基因位点，未能覆盖所有影响药物代谢的因素。',
  '药物反应还受年龄、肝肾功能、合并用药、饮食等因素影响，请勿自行调整用药，调整用药请遵医嘱。',
]

const adviceColor: Record<Advice, string> = {
  降低剂量: 'text-primary',
  增加剂量: 'text-warning',
  更换药物: 'text-[#d9542c]',
}

const TOTAL_PAGES = 2

function PdfPage({ page, children }: { page: number; children: React.ReactNode }) {
  return (
    <article
      aria-label={`第 ${page} 页`}
      className="mx-auto flex min-h-[540px] w-full max-w-[420px] flex-col bg-white px-4 pb-3 pt-5 text-[#1f2329] shadow-[0_1px_6px_rgba(20,40,80,0.12)]"
    >
      <div className="flex-1">{children}</div>
      <p className="mt-4 text-center text-tag tabular-nums text-[#9aa3b2]">
        第 {page} 页 / 共 {TOTAL_PAGES} 页
      </p>
    </article>
  )
}

function SectionBar({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      className="mb-2.5 mt-4 rounded-[3px] bg-[linear-gradient(90deg,#a9c6ee_0%,#e4edfa_48%,#fbe4d4_100%)] px-2 py-1 text-caption font-semibold text-[#1f2329]"
    >
      【{title}】
    </h2>
  )
}

function Mark({ on, label }: { on: boolean; label: string }) {
  return on ? (
    <>
      <Check className="mx-auto size-3 text-primary" strokeWidth={3} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </>
  ) : (
    <span className="sr-only">无</span>
  )
}

function Blank({ children }: { children: React.ReactNode }) {
  return <span className="border-b border-[#c9d0db] px-1 text-[#1f2329]">{children}</span>
}

export function ReportDetailScreen({ report, onBack }: { report: ReportSummary; onBack: () => void }) {
  const [sharing, setSharing] = useState(false)
  const profile = examineeProfiles[report.examinee]

  return (
    <SubPage title="报告详情" titleId="report-detail-title" onBack={onBack}>
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#e9ecf1] px-2.5 py-3 [scrollbar-width:none]">
        <PdfPage page={1}>
          <h1 className="text-center text-title font-bold tracking-wide">{report.product}报告</h1>
          <p className="mt-1 text-center text-tag tabular-nums text-[#7a8494]">报告编号：{report.id}</p>

          <section aria-labelledby="pdf-info">
            <SectionBar id="pdf-info" title="您的信息" />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-tag">
              <div className="flex gap-1">
                <dt className="shrink-0">姓名：</dt>
                <dd>
                  <Blank>{report.examinee}</Blank>
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="shrink-0">性别：</dt>
                <dd>
                  <Blank>{profile?.gender ?? '—'}</Blank>
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="shrink-0">年龄：</dt>
                <dd>
                  <Blank>{profile?.age ?? '—'}</Blank>
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="shrink-0">检测日期：</dt>
                <dd>
                  <Blank>
                    <span className="tabular-nums">{report.date}</span>
                  </Blank>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="pdf-result">
            <SectionBar id="pdf-result" title="您的检测结果" />
            <ul className="grid grid-cols-3 border border-[#dfe5ee] text-center">
              {stats.map((s, i) => (
                <li key={s.label} className={cn('py-2', i > 0 && 'border-l border-[#dfe5ee]')}>
                  <p className={cn('text-title font-bold tabular-nums', i === 2 ? 'text-warning' : 'text-primary')}>
                    {s.value}
                  </p>
                  <p className="text-tag text-[#5b6472]">{s.label}</p>
                </li>
              ))}
            </ul>

            <table className="mt-3 w-full table-fixed text-center text-tag">
              <caption className="mb-1 text-left text-tag font-semibold">结果摘要</caption>
              <thead>
                <tr className="border-y border-faint/60">
                  <th scope="col" className="w-[28%] py-1.5 font-medium">药物名称</th>
                  <th scope="col" className="py-1.5 font-medium">警惕不良反应</th>
                  <th scope="col" className="py-1.5 font-medium">警惕疗效不足</th>
                  <th scope="col" className="w-[24%] py-1.5 font-medium">用药建议</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f6] border-b border-faint/60">
                {summaryRows.map((r) => (
                  <tr key={r.drug}>
                    <th scope="row" className="py-1.5 font-normal">{r.drug}</th>
                    <td className="py-1.5">
                      <Mark on={r.adverse} label="警惕不良反应" />
                    </td>
                    <td className="py-1.5">
                      <Mark on={r.insufficient} label="警惕疗效不足" />
                    </td>
                    <td className={cn('py-1.5 font-medium', adviceColor[r.advice])}>{r.advice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </PdfPage>

        <PdfPage page={2}>
          <section aria-labelledby="pdf-detail">
            <SectionBar id="pdf-detail" title="检测结果明细 · 心血管疾病用药指导" />
            <table className="w-full table-fixed text-center text-tag leading-snug">
              <thead>
                <tr className="border-y border-faint/60">
                  <th scope="col" className="w-[19%] py-1.5 font-medium">药物名称</th>
                  <th scope="col" className="w-[17%] py-1.5 font-medium">用药建议</th>
                  <th scope="col" className="w-[23%] py-1.5 font-medium">基因 / 位点</th>
                  <th scope="col" className="w-[11%] py-1.5 font-medium">证据等级</th>
                  <th scope="col" className="w-[17%] py-1.5 font-medium">证据来源</th>
                  <th scope="col" className="w-[13%] py-1.5 font-medium">基因型</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f6] border-b border-faint/60">
                {detailRows.map((r) => (
                  <tr key={`${r.drug}-${r.gene}`}>
                    <th scope="row" className="py-1.5 font-normal">{r.drug}</th>
                    <td className={cn('py-1.5', adviceColor[r.advice])}>{r.advice}</td>
                    <td className="py-1.5">
                      <span className="italic">{r.gene}</span>
                      {r.site && <span className="block text-tag text-[#7a8494]">{r.site}</span>}
                    </td>
                    <td className="py-1.5 tabular-nums">{r.level}</td>
                    <td className="break-all py-1.5 text-[#5b6472]">{r.source}</td>
                    <td className="py-1.5">
                      <span className="inline-block rounded-full bg-[#e8eef8] px-1.5 py-0.5 tabular-nums">{r.result}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="pdf-notes">
            <SectionBar id="pdf-notes" title="检测说明" />
            <ol className="space-y-1.5 text-tag leading-relaxed text-[#3a414c]">
              {notes.map((n, i) => (
                <li key={n} className="flex gap-1.5">
                  <span className="shrink-0 tabular-nums">{i + 1}.</span>
                  <span>{n}</span>
                </li>
              ))}
            </ol>
          </section>

          <footer className="mt-6 space-y-2 border-t border-border pt-3 text-tag text-[#3a414c]">
            <div className="flex justify-between gap-2">
              <span>
                检测人：<Blank>陈立</Blank>
              </span>
              <span>
                审核人：<Blank>周敏</Blank>
              </span>
              <span>
                报告日期：<Blank><span className="tabular-nums">{report.date}</span></Blank>
              </span>
            </div>
            <p>检测地址：湖南省长沙市高新区麓天路 28 号麓谷科技产业园 C9 栋</p>
          </footer>
        </PdfPage>
      </div>

      <div className="flex shrink-0 items-center border-t border-border bg-white px-3 pb-6 pt-2.5">
        <button
          type="button"
          onClick={() => setSharing(true)}
          aria-haspopup="dialog"
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-body font-medium text-primary-foreground"
        >
          <Share2 className="size-4" aria-hidden="true" />
          分享报告
        </button>
      </div>

      {sharing && <ReportPdfShare report={report} onClose={() => setSharing(false)} />}
    </SubPage>
  )
}
