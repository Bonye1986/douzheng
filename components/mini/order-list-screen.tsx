'use client'

import { useState } from 'react'
import { AlertTriangle, Building2, Home } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { SamplingVideoDialog } from '@/components/mini/sampling-video-dialog'
import { OrderDetailScreen } from '@/components/mini/order-detail-screen'
import { CancelOrderScreen } from '@/components/mini/refund-screen'
import { getSampleTypes, testServices } from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

const shippedOrLaterStatuses = new Set(['已发货', '待采样', '已寄样', '已收样', '检测中', '已完成'])
const verifiedOrLaterStatuses = new Set(['待采样', '已收样', '检测中', '已完成'])

const parseYuan = (s: string) => Number(s.replace(/[^\d.]/g, '')) || 0

type OrderActionHandlers = {
  onCancel: (o: Order) => void
  onRefund: (kind: RefundKind) => void
  onHandleUnqualified: () => void
  onOpenGuide: () => void
}

function OrderActions({ order: o, onCancel, onRefund, onHandleUnqualified, onOpenGuide }: { order: Order } & OrderActionHandlers) {
  return (
    <>
      {o.refund && (
        <button
          type="button"
          onClick={() => {
            if (o.refund === 'cancel') onCancel(o)
            else if (o.refund) onRefund(o.refund)
          }}
          className="h-7 rounded-full border border-[#dfe5ef] px-3.5 text-[12px] font-medium text-muted-foreground"
        >
          {refundLabels[o.refund]}
        </button>
      )}
      {o.action && (
        <button
          type="button"
          onClick={() => {
            if (o.unqualified) onHandleUnqualified()
            else if (o.action?.label === '采样指引') onOpenGuide()
          }}
          className={cn(
            'h-7 rounded-full px-3.5 text-[12px] font-medium',
            o.action.primary ? 'bg-primary text-primary-foreground' : 'border border-[#dfe5ef] text-foreground',
          )}
        >
          {o.action.label}
        </button>
      )}
    </>
  )
}

function OrderDetailFromList({
  order,
  actions,
  onBack,
}: {
  order: Order
  actions?: React.ReactNode
  onBack: () => void
}) {
  const payable = parseYuan(order.amount)
  const goodsTotal = order.originalAmount ? parseYuan(order.originalAmount) : payable
  const names = order.examinees.split('、')
  const per = Math.round(goodsTotal / names.length)
  const d = order.id.slice(2, 10)
  const payTime = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)} 10:24:36`
  const hasSampleCode =
    order.type === 'self'
      ? shippedOrLaterStatuses.has(order.status)
      : verifiedOrLaterStatuses.has(order.status)
  const service = testServices.find((s) => s.name === order.product)
  const sampleType =
    (service && getSampleTypes(service.id, order.type)[0]?.label) ?? (order.type === 'self' ? '唾液' : '口腔拭子')
  const sampleCodes = hasSampleCode
    ? names.map((name, i) => ({ name, code: `YB${order.id.slice(4)}${String(i + 1).padStart(2, '0')}` }))
    : undefined

  return (
    <OrderDetailScreen
      orderNo={order.id}
      payTime={payTime}
      mode={order.type}
      status={order.status}
      statusDesc={order.note}
      sampleCodes={sampleCodes}
      receiver={{ name: '王建国', phone: '138****6621', detail: '上海市徐汇区漕溪北路 398 号 汇智大厦 12 楼' }}
      site={{ name: '都正检测中心（徐汇）', address: '上海市徐汇区宜山路 700 号 B1 栋 3 楼', time: '10-18 09:00-11:00' }}
      groups={names.map((name, i) => ({
        id: `${order.id}-${i}`,
        name,
        items: [{ id: `${order.id}-${i}-item`, name: order.product, price: per, sampleType }],
      }))}
      goodsTotal={goodsTotal}
      couponOff={Math.max(goodsTotal - payable, 0)}
      payable={payable}
      actions={actions}
      onBack={onBack}
    />
  )
}

export type OrderPhase = 'all' | 'toPay' | 'toSample' | 'testing' | 'done' | 'closed'
type OrderType = 'all' | 'self' | 'site'

const typeTabs: { key: OrderType; label: string }[] = [
  { key: 'all', label: '全部订单' },
  { key: 'self', label: '自采样订单' },
  { key: 'site', label: '定点采样订单' },
]

type GroupPhase = Exclude<OrderPhase, 'all'>
type StatusTab = { key: string; label: string; phase?: GroupPhase; match: (o: Order) => boolean }

const byPhase = (phase: GroupPhase) => (o: Order) => o.phase === phase
const byStatus = (status: string) => (o: Order) => o.status === status
const allTab: StatusTab = { key: 'all', label: '全部', match: () => true }

const tab = {
  toPay: { key: 'toPay', label: '待付款', phase: 'toPay', match: byPhase('toPay') },
  toShip: { key: 'toShip', label: '待发货', phase: 'toSample', match: byStatus('待发货') },
  shipped: { key: 'shipped', label: '已发货', phase: 'toSample', match: byStatus('已发货') },
  toVerify: { key: 'toVerify', label: '待核销', phase: 'toSample', match: byStatus('待核销') },
  toSample: { key: 'siteToSample', label: '待采样', phase: 'toSample', match: byStatus('待采样') },
  sent: { key: 'sent', label: '已寄样', phase: 'testing', match: byStatus('已寄样') },
  received: { key: 'received', label: '已收样', phase: 'testing', match: byStatus('已收样') },
  testing: { key: 'testingStatus', label: '检测中', phase: 'testing', match: byStatus('检测中') },
  done: { key: 'done', label: '已完成', phase: 'done', match: byPhase('done') },
  closed: { key: 'closed', label: '已关闭', phase: 'closed', match: byPhase('closed') },
} satisfies Record<string, StatusTab>

const statusTabsByType: Record<OrderType, StatusTab[]> = {
  all: [
    tab.toShip,
    tab.shipped,
    tab.toVerify,
    tab.toSample,
    tab.sent,
    tab.received,
    tab.testing,
    tab.done,
    tab.closed,
  ],
  self: [allTab, tab.toShip, tab.shipped, tab.toSample, tab.sent, tab.received, tab.testing, tab.done, tab.closed],
  site: [allTab, tab.toVerify, tab.toSample, tab.sent, tab.received, tab.testing, tab.done, tab.closed],
}

const groupPhases: GroupPhase[] = ['toSample', 'testing']

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

const allOrders: Order[] = [
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
    id: 'DZ20261012010',
    type: 'self',
    phase: 'toSample',
    status: '待采样',
    product: '药物基因检测',
    examinees: '李秀兰',
    amount: '¥999',
    note: '采样盒已签收，请按说明完成采样并回寄',
    refund: 'shipped',
    action: { label: '采样指引', primary: true },
  },
  {
    id: 'DZ20261011012',
    type: 'site',
    phase: 'testing',
    status: '已寄样',
    product: '个体化用药基因检测 · 全面版',
    examinees: '张伟',
    amount: '¥1,299',
    note: '采样点已寄出样本，正在运往实验室',
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
    note: '样本已送达实验室，等待上机���测',
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
    status: '���关闭',
    product: '药物基因检测',
    examinees: '李秀兰',
    amount: '¥999',
    note: '已选择重新采样，原订单关闭',
  },
]

export function countOrders(phase: Exclude<OrderPhase, 'all'>) {
  return allOrders.filter((o) => o.phase === phase).length
}

export function OrderListScreen({
  initialPhase = 'all',
  initialGuideOpen = false,
  onBack,
  onHandleUnqualified,
  onRefund,
}: {
  initialPhase?: OrderPhase
  initialGuideOpen?: boolean
  onBack: () => void
  onHandleUnqualified: () => void
  onRefund: (kind: RefundKind) => void
}) {
  const [type, setType] = useState<OrderType>('all')
  const [statusKey, setStatusKey] = useState<string>(initialPhase)
  const [guideOpen, setGuideOpen] = useState(initialGuideOpen)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelledIds, setCancelledIds] = useState<ReadonlySet<string>>(() => new Set())
  const orders = allOrders.map((o): Order =>
    cancelledIds.has(o.id)
      ? {
          ...o,
          phase: 'closed',
          status: '已关闭',
          note: '用户已取消订单，支付金额将原路退回',
          refund: undefined,
          action: undefined,
        }
      : o,
  )

  const confirmCancel = () => {
    if (!cancelTarget) return
    const id = cancelTarget.id
    setCancelledIds((prev) => new Set(prev).add(id))
    setCancelTarget(null)
  }

  const actionHandlers: OrderActionHandlers = {
    onCancel: setCancelTarget,
    onRefund,
    onHandleUnqualified,
    onOpenGuide: () => setGuideOpen(true),
  }
  const detailOrder = detailId ? orders.find((o) => o.id === detailId) : undefined
  const hasActions = (o: Order) => Boolean(o.refund || o.action)

  const statusTabs = statusTabsByType[type]
  const groupPhase = groupPhases.find((p) => p === statusKey)
  const activeTab: StatusTab = groupPhase
    ? { key: groupPhase, label: '', match: byPhase(groupPhase) }
    : (statusTabs.find((t) => t.key === statusKey) ?? allTab)
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
          const active = groupPhase ? t.phase === groupPhase : activeTab.key === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusKey(active && type === 'all' ? 'all' : t.key)}
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
            <li key={o.id} className="relative rounded-2xl bg-white p-3.5 transition-colors active:bg-[#f6f8fc]">
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
                  <button
                    type="button"
                    onClick={() => setDetailId(o.id)}
                    aria-label={`查看订单详情：${o.product}，${o.id}`}
                    className="block max-w-full truncate text-left text-[14px] font-medium text-foreground after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
                  >
                    {o.product}
                  </button>
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
                <div className="relative z-10 flex items-center gap-2">
                  <OrderActions order={o} {...actionHandlers} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {detailOrder && (
        <OrderDetailFromList
          order={detailOrder}
          actions={hasActions(detailOrder) ? <OrderActions order={detailOrder} {...actionHandlers} /> : undefined}
          onBack={() => setDetailId(null)}
        />
      )}
      {guideOpen && <SamplingVideoDialog onClose={() => setGuideOpen(false)} />}
      {cancelTarget && <CancelOrderScreen onBack={() => setCancelTarget(null)} onCancelled={confirmCancel} />}
    </SubPage>
  )
}
