'use client'

import { useState } from 'react'
import { ChevronDown, Download, Info, Sparkles } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

export type ReportSummary = {
  id: string
  product: string
  examinee: string
  relation: string
  date: string
}

type Level = 'adjust' | 'caution' | 'normal'

type Drug = {
  name: string
  category: string
  level: Level
  gene: string
  advice: string
}

type GeneResult = {
  gene: string
  locus: string
  genotype: string
  phenotype: string
}

const levelMeta: Record<Level, { label: string; text: string; bg: string; dot: string }> = {
  adjust: { label: '需调整', text: 'text-[#d9542c]', bg: 'bg-[#fdeee8]', dot: 'bg-[#d9542c]' },
  caution: { label: '谨慎使用', text: 'text-[#b9821c]', bg: 'bg-[#fbf3df]', dot: 'bg-[#d9a23a]' },
  normal: { label: '正常使用', text: 'text-[#2f9e6a]', bg: 'bg-[#e6f5ee]', dot: 'bg-[#2f9e6a]' },
}

const drugs: Drug[] = [
  {
    name: '氯吡格雷',
    category: '抗血小板药',
    level: 'adjust',
    gene: 'CYP2C19',
    advice: '代谢能力降低，药效可能减弱，建议医生评估后换用替格瑞洛等替代药物。',
  },
  {
    name: '华法林',
    category: '抗凝药',
    level: 'adjust',
    gene: 'VKORC1 / CYP2C9',
    advice: '对药物敏感度高，建议降低起始剂量，并加强 INR 监测。',
  },
  {
    name: '阿托伐他汀',
    category: '降脂药',
    level: 'caution',
    gene: 'SLCO1B1',
    advice: '肌病风险轻度升高，建议从低剂量开始，留意肌肉酸痛等症状。',
  },
  {
    name: '美托洛尔',
    category: '降压药',
    level: 'caution',
    gene: 'CYP2D6',
    advice: '代谢略慢，血药浓度可能偏高，注意监测心率与血压。',
  },
  {
    name: '奥美拉唑',
    category: '抑酸药',
    level: 'caution',
    gene: 'CYP2C19',
    advice: '药物清除减慢，疗效可能增强，长期使用时可适当减量。',
  },
  {
    name: '氨氯地平',
    category: '降压药',
    level: 'normal',
    gene: 'CYP3A5',
    advice: '代谢正常，可按常规剂量使用。',
  },
  {
    name: '阿司匹林',
    category: '抗血小板药',
    level: 'normal',
    gene: 'PTGS1',
    advice: '未发现影响疗效的基因变异，可按常规剂量使用。',
  },
  {
    name: '二甲双胍',
    category: '降糖药',
    level: 'normal',
    gene: 'SLC22A1',
    advice: '药物转运正常，可按常规剂量使用。',
  },
]

const genes: GeneResult[] = [
  { gene: 'CYP2C19', locus: '*2 / *3', genotype: '*2/*3', phenotype: '慢代谢型' },
  { gene: 'CYP2C9', locus: '*3', genotype: '*1/*3', phenotype: '中间代谢型' },
  { gene: 'VKORC1', locus: '-1639G>A', genotype: 'AA', phenotype: '高敏感' },
  { gene: 'SLCO1B1', locus: '521T>C', genotype: 'TC', phenotype: '功能降低' },
  { gene: 'CYP2D6', locus: '*10', genotype: '*1/*10', phenotype: '中间代谢型' },
  { gene: 'CYP3A5', locus: '*3', genotype: '*1/*1', phenotype: '正常代谢型' },
]

const levelOrder: Level[] = ['adjust', 'caution', 'normal']

export function ReportDetailScreen({
  report,
  onBack,
  onAiInterpret,
}: {
  report: ReportSummary
  onBack: () => void
  onAiInterpret?: () => void
}) {
  const [tab, setTab] = useState<'drug' | 'gene'>('drug')
  const [level, setLevel] = useState<'all' | Level>('all')
  const [expanded, setExpanded] = useState<string | null>(drugs[0].name)

  const counts = levelOrder.map((l) => ({ level: l, count: drugs.filter((d) => d.level === l).length }))
  const visibleDrugs = drugs.filter((d) => level === 'all' || d.level === level)

  return (
    <SubPage title="报告详情" titleId="report-detail-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none]">
        <section aria-label="报告信息" className="bg-primary px-4 pb-10 pt-4 text-primary-foreground">
          <p className="text-[17px] font-semibold">{report.product}</p>
          <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-[12px]">
            <div className="flex gap-1.5">
              <dt className="opacity-75">受检人</dt>
              <dd>
                {report.examinee}（{report.relation}）
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="opacity-75">出具日期</dt>
              <dd className="tabular-nums">{report.date}</dd>
            </div>
            <div className="col-span-2 flex gap-1.5">
              <dt className="opacity-75">报告编号</dt>
              <dd className="tabular-nums">{report.id}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="overview-title" className="relative -mt-7 mx-3 rounded-2xl bg-white p-3.5">
          <h2 id="overview-title" className="text-[14px] font-semibold text-foreground">
            检测结论
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            共检测 {drugs.length} 种常用药物，其中 {counts[0].count} 种建议调整用药，请携带报告咨询医生。
          </p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
            {counts.map((c) => (
              <span key={c.level} className={levelMeta[c.level].dot} style={{ flexGrow: c.count }} />
            ))}
          </div>
          <ul className="mt-2 flex justify-between text-[12px]">
            {counts.map((c) => (
              <li key={c.level} className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn('size-2 rounded-full', levelMeta[c.level].dot)} aria-hidden="true" />
                {levelMeta[c.level].label}
                <span className={cn('font-semibold tabular-nums', levelMeta[c.level].text)}>{c.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <div role="tablist" aria-label="报告内容" className="mx-3 mt-3 flex rounded-full bg-white p-1">
          {(
            [
              ['drug', '用药建议'],
              ['gene', '基因检测结果'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'h-8 flex-1 rounded-full text-[13px] transition-colors',
                tab === key ? 'bg-primary font-medium text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'drug' ? (
          <section aria-label="用药建议" className="mx-3 mt-3">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {(['all', ...levelOrder] as const).map((l) => {
                const active = level === l
                return (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLevel(l)}
                    className={cn(
                      'h-7 shrink-0 rounded-full border px-3 text-[12px] transition-colors',
                      active ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-transparent bg-white text-muted-foreground',
                    )}
                  >
                    {l === 'all' ? '全部' : levelMeta[l].label}
                  </button>
                )
              })}
            </div>

            <ul className="mt-2.5 space-y-2">
              {visibleDrugs.map((d) => {
                const meta = levelMeta[d.level]
                const open = expanded === d.name
                return (
                  <li key={d.name} className="rounded-2xl bg-white">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setExpanded(open ? null : d.name)}
                      className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                    >
                      <span className={cn('h-8 w-1 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium text-foreground">{d.name}</span>
                        <span className="block text-[12px] text-muted-foreground">
                          {d.category} · {d.gene}
                        </span>
                      </span>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', meta.bg, meta.text)}>
                        {meta.label}
                      </span>
                      <ChevronDown
                        className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
                        aria-hidden="true"
                      />
                    </button>
                    {open && (
                      <p className="mx-3.5 mb-3 rounded-xl bg-[#f4f8fe] px-3 py-2.5 text-[12px] leading-relaxed text-foreground">
                        {d.advice}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ) : (
          <section aria-label="基因检测结果" className="mx-3 mt-3 overflow-hidden rounded-2xl bg-white">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#f4f8fe] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5 font-medium">
                    基因
                  </th>
                  <th scope="col" className="px-2 py-2.5 font-medium">
                    检测位点
                  </th>
                  <th scope="col" className="px-2 py-2.5 font-medium">
                    基因型
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right font-medium">
                    表型
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f6]">
                {genes.map((g) => (
                  <tr key={g.gene}>
                    <th scope="row" className="px-3.5 py-3 font-medium text-foreground">
                      {g.gene}
                    </th>
                    <td className="px-2 py-3 tabular-nums text-muted-foreground">{g.locus}</td>
                    <td className="px-2 py-3 tabular-nums text-foreground">{g.genotype}</td>
                    <td className="px-3.5 py-3 text-right text-foreground">{g.phenotype}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <p className="mx-4 mt-4 flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          本报告结果仅供临床用药参考，不能替代医生诊断。请勿自行停药或调整剂量，用药调整请遵医嘱。
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 border-t border-[#eef1f6] bg-white px-3 pb-6 pt-2.5">
        <button
          type="button"
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#dfe5ef] text-[14px] text-foreground"
        >
          <Download className="size-4" aria-hidden="true" />
          下载 PDF
        </button>
        <button
          type="button"
          onClick={onAiInterpret}
          className="flex h-10 flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-medium text-primary-foreground"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          AI 解读报告
        </button>
      </div>
    </SubPage>
  )
}
