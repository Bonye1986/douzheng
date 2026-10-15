'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowRight, Building2, Home } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

type AfterKind = 'pending' | 'refund' | 'resample'

const kindTabs: { key: 'all' | AfterKind; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'refund', label: '退款' },
  { key: 'resample', label: '重采样' },
]

type AfterCase = {
  id: string
  kind: AfterKind
  type: 'self' | 'site'
  status: string
  tone: 'warn' | 'primary' | 'muted'
  product: string
  examinee: string
  amount: string
  note: string
  refund?: { label: string; value: string }
  newOrderId?: string
  action?: { label: string; primary?: boolean; handle?: boolean }
}

const cases: AfterCase[] = [
  {
    id: 'DZ20261012003',
    kind: 'pending',
    type: 'self',
    status: '样本不合格',
    tone: 'warn',
    product: '儿童安全用药基因检测',
    examinee: '李秀兰',
    amount: '¥699',
    note: '样本 DNA 浓度不足，已短信通知，请选择重新采样或申请退款',
    action: { label: '去处理', primary: true, handle: true },
  },
  {
    id: 'DZ20261006010',
    kind: 'refund',
    type: 'site',
    status: '退款审核中',
    tone: 'primary',
    product: '药物基因检测',
    examinee: '张伟',
    amount: '¥999',
    note: '退款申请已提交，客服审核后确定全额或部分退款',
    refund: { label: '申请退款', value: '¥999' },
    action: { label: '查看进度' },
  },
  {
    id: 'DZ20260918002',
    kind: 'refund',
    type: 'self',
    status: '已退款',
    tone: 'muted',
    product: '心血管用药基因检测',
    examinee: '王建国',
    amount: '¥899',
    note: '审核通过，部分退款已原路退回（扣除已发生的采样盒费用）',
    refund: { label: '部分退款', value: '¥600' },
  },
  {
    id: 'DZ20261001007',
    kind: 'resample',
    type: 'site',
    status: '已转重采样',
    tone: 'muted',
    product: '药物基因检测',
    examinee: '李秀兰',
    amount: '¥999',
    note: '原订单已关闭，已为您生成新的已付款订单',
    newOrderId: 'DZ20261009011',
    action: { label: '查看新订单' },
  },
]

export const pendingAfterSalesCount = cases.filter((c) => c.kind === 'pending').length

export function AfterSalesScreen({ onBack, onHandleUnqualified }: { onBack: () => void; onHandleUnqualified: () => void }) {
  const [kind, setKind] = useState<'all' | AfterKind>('all')
  const visible = cases.filter((c) => kind === 'all' || c.kind === kind)

  return (
    <SubPage title="退款/售后" titleId="after-sales-title" onBack={onBack}>
      <div role="tablist" aria-label="售后类型" className="flex shrink-0 gap-5 bg-white px-4">
        {kindTabs.map((t) => {
          const count = t.key === 'all' ? 0 : cases.filter((c) => c.kind === t.key).length
          const active = kind === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setKind(t.key)}
              className={cn(
                'relative flex h-10 items-center gap-0.5 text-[14px] transition-colors',
                active ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {t.label}
              {count > 0 && <span className="text-[11px] tabular-nums text-primary">{count}</span>}
              {active && <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      <ul className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]">
        {visible.map((c) => {
          const TypeIcon = c.type === 'self' ? Home : Building2
          return (
            <li key={c.id} className="rounded-2xl bg-white p-3.5">
              <div className="flex items-center gap-1.5">
                <TypeIcon className="size-3.5 text-primary" aria-hidden="true" />
                <span className="text-[12px] tabular-nums text-muted-foreground">{c.id}</span>
                <span
                  className={cn(
                    'ml-auto text-[12px] font-medium',
                    c.tone === 'warn' ? 'text-[#e0651c]' : c.tone === 'primary' ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-foreground">{c.product}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    受检人：{c.examinee} · 实付 <span className="tabular-nums">{c.amount}</span>
                  </p>
                </div>
                {c.refund && (
                  <p className="shrink-0 text-right">
                    <span className="block text-[11px] text-muted-foreground">{c.refund.label}</span>
                    <span className="block text-[14px] font-semibold tabular-nums text-[#e0651c]">{c.refund.value}</span>
                  </p>
                )}
              </div>

              <p
                className={cn(
                  'mt-2 flex items-start gap-1 rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed',
                  c.kind === 'pending' ? 'bg-[#fff4ec] text-[#c4581a]' : 'bg-[#f6f8fc] text-muted-foreground',
                )}
              >
                {c.kind === 'pending' && <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />}
                {c.note}
              </p>

              {c.newOrderId && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
                  <span className="line-through">{c.id}</span>
                  <ArrowRight className="size-3" aria-hidden="true" />
                  <span className="text-foreground">{c.newOrderId}</span>
                  <span className="rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">重采样</span>
                </p>
              )}

              {c.action && (
                <div className="mt-2.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => c.action?.handle && onHandleUnqualified()}
                    className={cn(
                      'h-7 rounded-full px-3.5 text-[12px] font-medium',
                      c.action.primary ? 'bg-primary text-primary-foreground' : 'border border-[#dfe5ef] text-foreground',
                    )}
                  >
                    {c.action.label}
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </SubPage>
  )
}
