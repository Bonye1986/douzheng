'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowRight, Building2, Home } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { AfterSalesDetailScreen } from '@/components/mini/after-sales-detail-screen'
import { cn } from '@/lib/utils'

type AfterKind = 'pending' | 'refund' | 'resample'

const kindTabs: { key: 'all' | AfterKind; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'refund', label: '退款' },
  { key: 'resample', label: '重采样' },
]

export type AfterCase = {
  id: string
  afterSaleNo: string
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
  action?: { label: string; primary?: boolean; handle?: boolean; terminate?: boolean }
}

const cases: AfterCase[] = [
  {
    id: 'DZ20261012003',
    afterSaleNo: 'SH20261014001',
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
    id: 'DZ20261015004',
    afterSaleNo: 'SH20261015002',
    kind: 'refund',
    type: 'self',
    status: '已退款',
    tone: 'muted',
    product: '药物基因检测',
    examinee: '张伟',
    amount: '¥1299',
    note: '订单在发货前取消，款项已全额原路退回',
    refund: { label: '全额退款', value: '¥1299' },
  },
  {
    id: 'DZ20260918002',
    afterSaleNo: 'SH20260920006',
    kind: 'refund',
    type: 'self',
    status: '已退款',
    tone: 'muted',
    product: '心血管用药基因检测',
    examinee: '王建国',
    amount: '¥899',
    note: '退款已原路退回（扣除已发生的采样盒费用）',
    refund: { label: '部分退款', value: '¥600' },
  },
  {
    id: 'DZ20261001007',
    afterSaleNo: 'SH20261008003',
    kind: 'resample',
    type: 'site',
    status: '已转重采样',
    tone: 'muted',
    product: '药物基因检测',
    examinee: '李秀兰',
    amount: '¥999',
    note: '原订单已关闭，已为您生成新的已付款订单。如需终止检测并退款，需联系客服扣除已产生费用后退款',
    newOrderId: 'DZ20261009011',
    action: { label: '终止并退款', terminate: true },
  },
]

export const pendingAfterSalesCount = cases.filter((c) => c.kind === 'pending').length

export function AfterSalesScreen({
  initialDetailId,
  onBack,
  onHandleUnqualified,
  onTerminateResample,
}: {
  initialDetailId?: string
  onBack: () => void
  onHandleUnqualified: () => void
  onTerminateResample: () => void
}) {
  const [kind, setKind] = useState<'all' | AfterKind>('all')
  const [detailId, setDetailId] = useState<string | null>(initialDetailId ?? null)
  const visible = cases.filter((c) => kind === 'all' || c.kind === kind)
  const detailCase = detailId ? cases.find((c) => c.id === detailId) : undefined

  if (detailCase) {
    return (
      <AfterSalesDetailScreen
        item={detailCase}
        onBack={() => setDetailId(null)}
        onHandleUnqualified={onHandleUnqualified}
        onTerminateResample={onTerminateResample}
      />
    )
  }

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
                'relative flex h-10 items-center gap-0.5 text-body transition-colors',
                active ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {t.label}
              {count > 0 && <span className="text-caption tabular-nums text-primary">{count}</span>}
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
              <button
                type="button"
                onClick={() => setDetailId(c.id)}
                aria-label={`查看售后详情：${c.product}，${c.status}`}
                className="block w-full text-left"
              >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-tag font-medium',
                    c.type === 'self' ? 'bg-primary/10 text-primary' : 'bg-success-soft text-success',
                  )}
                >
                  <TypeIcon className="size-3" aria-hidden="true" />
                  {c.type === 'self' ? '居家自采样' : '定点采样'}
                </span>
                <span className="truncate text-caption tabular-nums text-muted-foreground">
                  售后单号 {c.afterSaleNo}
                </span>
                <span
                  className={cn(
                    'ml-auto text-caption font-medium',
                    c.tone === 'warn' ? 'text-warning' : c.tone === 'primary' ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-foreground">{c.product}</p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    受检人：{c.examinee} · 实付 <span className="tabular-nums">{c.amount}</span>
                  </p>
                  <p className="mt-0.5 text-caption tabular-nums text-muted-foreground">订单号：{c.id}</p>
                </div>
                {c.refund && (
                  <p className="shrink-0 text-right">
                    <span className="block text-caption text-muted-foreground">{c.refund.label}</span>
                    <span className="block text-body font-semibold tabular-nums text-warning">{c.refund.value}</span>
                  </p>
                )}
              </div>

              <p
                className={cn(
                  'mt-2 flex items-start gap-1 rounded-lg px-2.5 py-1.5 text-caption leading-relaxed',
                  c.kind === 'pending' ? 'bg-warning-soft text-[#c4581a]' : 'bg-muted text-muted-foreground',
                )}
              >
                {c.kind === 'pending' && <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />}
                {c.note}
              </p>

              {c.newOrderId && (
                <p className="mt-2 flex items-center gap-1.5 text-caption tabular-nums text-muted-foreground">
                  <span className="line-through">{c.id}</span>
                  <ArrowRight className="size-3" aria-hidden="true" />
                  <span className="text-foreground">{c.newOrderId}</span>
                  <span className="rounded bg-primary/10 px-1 text-tag font-medium text-primary">重采样</span>
                </p>
              )}
              </button>

              {c.action && (
                <div className="mt-2.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (c.action?.handle) onHandleUnqualified()
                      if (c.action?.terminate) onTerminateResample()
                    }}
                    className={cn(
                      'h-7 rounded-full px-3.5 text-caption font-medium',
                      c.action.primary ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground',
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
