'use client'

import { useState } from 'react'
import { AlertTriangle, Building2, Home } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

export type OrderPhase = 'all' | 'toPay' | 'toSample' | 'testing' | 'done' | 'closed'
type OrderType = 'all' | 'self' | 'site'

const typeTabs: { key: OrderType; label: string }[] = [
  { key: 'all', label: '全部订单' },
  { key: 'self', label: '自采样订单' },
  { key: 'site', label: '定点采样订单' },
]

type StatusTab = { key: string; label: string; match: (o: Order) => boolean }

const byPhase = (phase: Exclude<OrderPhase, 'all'>) => (o: Order) => o.phase === phase
const byStatus = (status: string) => (o: Order) => o.status === status
const allTab: StatusTab = { key: 'all', label: '全部', match: () => true }
const closedTab: StatusTab = { key: 'closed', label: '已关闭', match: byPhase('closed') }

const statusTabsByType: Record<OrderType, StatusTab[]> = {
  all: [
    allTab,
    { key: 'toPay', label: '待付款', match: byPhase('toPay') },
    { key: 'toSample', label: '待采样', match: byPhase('toSample') },
    { key: 'testing', label: '检测中', match: byPhase('testing') },
    { key: 'done', label: '已完成', match: byPhase('done') },
    closedTab,
  ],
  self: [
    allTab,
    { key: 'toPay', label: '待付款', match: byPhase('toPay') },
    { key: 'toShip', label: '待发货', match: byStatus('待发货') },
    { key: 'shipped', label: '已发货', match: byStatus('已发货') },
    { key: 'sent', label: '已寄样', match: byStatus('已寄样') },
    { key: 'received', label: '已收样', match: byStatus('已收样') },
    { key: 'testing', label: '检测中', match: byStatus('检测中') },
    { key: 'done', label: '已完成', match: byPhase('done') },
    closedTab,
  ],
  site: [
    allTab,
    { key: 'toPay', label: '待付款', match: byPhase('toPay') },
    { key: 'toVerify', label: '待核销', match: byStatus('待核销') },
    { key: 'toSample', label: '待采样', match: byStatus('待采样') },
    { key: 'received', label: '已收样', match: byStatus('已收样') },
    { key: 'testing', label: '检测中', match: byStatus('检测中') },
    { key: 'done', label: '已完成', match: byPhase('done') },
    closedTab,
  ],
}

type Order = {
  id: string
  type: Exclude<OrderType, 'all'>
  phase: Exclude<OrderPhase, 'all'>
  status: string
  product: string
  examinees: string
  amount: string
  originalAmount?: string
  note: string
  resample?: boolean
  priceChanged?: boolean
  unqualified?: boolean
  refund?: RefundKind
  action?: { label: string; primary?: boolean }
}

export type RefundKind = 'cancel' | 'shipped' | 'resample'

const refundLabels: Record<RefundKind, string> = {
  cancel: '取消订单',
  shipped: '申请退款',
  resample: '终止并退款',
}

const orders: Order[] = [
  {
    id: 'DZ20261015001',
    type: 'self',
    phase: 'toPay',
    status: '待付款',
    product: '药物基因检测',
    examinees: '王建国、李秀兰',
    amount: '¥1,697',
    originalAmount: '¥1,897',
    note: '客服已调整订单金额，请按最新价格支付',
    priceChanged: true,
    action: { label: '去支付', primary: true },
  },
  {
    id: 'DZ20261015016',
    type: 'self',
    phase: 'toSample',
    status: '待发货',
    product: '个体化用药基因检测 · 全面版',
    examinees: '王建国',
    amount: '¥1,299',
    note: '已支付，实验室将在 24 小时内寄出采样盒',
    refund: 'cancel',
  },
  {
    id: 'DZ20261013008',
    type: 'self',
    phase: 'toSample',
    status: '已发货',
    product: '心血管用药基因检测',
    examinees: '王建国',
    amount: '¥899',
    note: '采样盒运输中，预计明日送达',
    refund: 'shipped',
    action: { label: '查看物流' },
  },
  {
    id: 'DZ20261014002',
    type: 'site',
    phase: 'toSample',
    status: '待核销',
    product: '药物基因检测',
    examinees: '张伟',
    amount: '¥999',
    note: '请于 10-18 前往 都正检测中心（徐汇） 出示核销码',
    action: { label: '核销码', primary: true },
  },
  {
    id: 'DZ20261014006',
    type: 'site',
    phase: 'toSample',
    status: '待采样',
    product: '心血管用药基因检测',
    examinees: '王建国',
    amount: '¥899',
    note: '已核销，请在 都正检测中心（徐汇） 完成采样',
  },
  {
    id: 'DZ20261010009',
    type: 'self',
    phase: 'testing',
    status: '已寄样',
    product: '药物基因检测',
    examinees: '张伟',
    amount: '¥999',
    note: '样本回寄中，顺丰 SF1428 6650 3321',
    action: { label: '查看物流' },
  },
  {
    id: 'DZ20261008005',
    type: 'self',
    phase: 'testing',
    status: '检测中',
    product: '精神类用药基因检测',
    examinees: '王建国',
    amount: '¥1,299',
    note: '实验室检测中，预计 10-20 出具报告',
  },
  {
    id: 'DZ20261009011',
    type: 'site',
    phase: 'testing',
    status: '已收样',
    product: '药物基因检测',
    examinees: '李秀兰',
    amount: '¥0',
    note: '样本已送达实验室，等待上机检测',
    resample: true,
    refund: 'resample',
  },
  {
    id: 'DZ20260920004',
    type: 'self',
    phase: 'done',
    status: '已完成',
    product: '儿童安全用药基因检测',
    examinees: '李秀兰',
    amount: '¥699',
    note: '报告已于 2026-10-08 出具',
    action: { label: '查看报告', primary: true },
  },
  {
    id: 'DZ20261001007',
    type: 'site',
    phase: 'closed',
    status: '已关闭',
    product: '药物基因检测',
    examinees: '李秀兰',
    amount: '¥999',
    note: '已选择重新采样，原订单关闭',
  },
]

export function countOrders(phase: Exclude<OrderPhase, 'all'>) {
  return orders.filter((o) => o.phase === phase).length
}

export function OrderListScreen({
  initialPhase = 'all',
  onBack,
  onHandleUnqualified,
  onRefund,
}: {
  initialPhase?: OrderPhase
  onBack: () => void
  onHandleUnqualified: () => void
  onRefund: (kind: RefundKind) => void
}) {
  const [type, setType] = useState<OrderType>('all')
  const [statusKey, setStatusKey] = useState<string>(initialPhase)

  const statusTabs = statusTabsByType[type]
  const activeTab = statusTabs.find((t) => t.key === statusKey) ?? allTab
  const visible = orders.filter((o) => (type === 'all' || o.type === type) && activeTab.match(o))

  const selectType = (next: OrderType) => {
    setType(next)
    setStatusKey('all')
  }

  return (
    <SubPage title="我的订单" titleId="order-list-title" onBack={onBack}>
      <div className="shrink-0 bg-white px-3 pb-2 pt-1">
        <div role="tablist" aria-label="采样类型" className="grid grid-cols-3 rounded-xl bg-[#f1f4f9] p-1">
          {typeTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={type === t.key}
              onClick={() => selectType(t.key)}
              className={cn(
                'h-8 rounded-lg text-[13px] transition-colors',
                type === t.key ? 'bg-white font-semibold text-primary shadow-sm' : 'text-muted-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="订单状态"
        className="flex shrink-0 gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none]"
      >
        {statusTabs.map((t) => {
          const count = t.key === 'all' ? 0 : orders.filter((o) => (type === 'all' || o.type === type) && t.match(o)).length
          const active = activeTab.key === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusKey(t.key)}
              className={cn(
                'flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 text-[12px] transition-colors',
                active ? 'bg-primary font-medium text-primary-foreground' : 'bg-white text-muted-foreground',
              )}
            >
              {t.label}
              {count > 0 && (
                <span className={cn('tabular-nums', active ? 'text-primary-foreground/80' : 'text-primary')}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      <ul className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-6 [scrollbar-width:none]">
        {visible.length === 0 && (
          <li className="py-16 text-center text-[13px] text-muted-foreground">暂无相关订单</li>
        )}
        {visible.map((o) => {
          const TypeIcon = o.type === 'self' ? Home : Building2
          return (
            <li key={o.id} className="rounded-2xl bg-white p-3.5">
              <div className="flex items-center gap-1.5">
                <TypeIcon className="size-3.5 text-primary" aria-hidden="true" />
                <span className="text-[12px] text-muted-foreground">{o.type === 'self' ? '自采样' : '定点采样'}</span>
                {o.resample && (
                  <span className="rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">重采样</span>
                )}
                {o.priceChanged && (
                  <span className="rounded bg-[#ffeadb] px-1 text-[10px] font-medium text-[#e0651c]">已改价</span>
                )}
                <span
                  className={cn(
                    'ml-auto text-[12px] font-medium',
                    o.phase === 'closed' || o.phase === 'done'
                      ? 'text-muted-foreground'
                      : o.unqualified || o.phase === 'toPay'
                        ? 'text-[#e0651c]'
                        : 'text-primary',
                  )}
                >
                  {o.status}
                </span>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-foreground">{o.product}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">受检人：{o.examinees}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="block text-[14px] font-semibold tabular-nums text-foreground">{o.amount}</span>
                  {o.originalAmount && (
                    <span className="block text-[11px] tabular-nums text-muted-foreground line-through">
                      {o.originalAmount}
                    </span>
                  )}
                </p>
              </div>

              <p
                className={cn(
                  'mt-2 flex items-start gap-1 rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed',
                  o.unqualified ? 'bg-[#fff4ec] text-[#c4581a]' : 'bg-[#f6f8fc] text-muted-foreground',
                )}
              >
                {o.unqualified && <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />}
                {o.note}
              </p>

              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] tabular-nums text-muted-foreground">{o.id}</span>
                <div className="flex items-center gap-2">
                {o.refund && (
                  <button
                    type="button"
                    onClick={() => o.refund && onRefund(o.refund)}
                    className="h-7 rounded-full border border-[#dfe5ef] px-3.5 text-[12px] font-medium text-muted-foreground"
                  >
                    {refundLabels[o.refund]}
                  </button>
                )}
                {o.action && (
                  <button
                    type="button"
                    onClick={() => o.unqualified && onHandleUnqualified()}
                    className={cn(
                      'h-7 rounded-full px-3.5 text-[12px] font-medium',
                      o.action.primary
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-[#dfe5ef] text-foreground',
                    )}
                  >
                    {o.action.label}
                  </button>
                )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </SubPage>
  )
}
