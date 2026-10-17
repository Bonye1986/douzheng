'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Building2, Clock, Home } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { SamplingVideoDialog } from '@/components/mini/sampling-video-dialog'
import { OrderDetailScreen } from '@/components/mini/order-detail-screen'
import { CancelOrderScreen, TestingRefundScreen } from '@/components/mini/refund-screen'
import { LogisticsScreen } from '@/components/mini/logistics-screen'

const samplingSite = {
  name: '都正检测中心（徐汇）',
  address: '上海市徐汇区宜山路 700 号 B1 栋 3 楼',
  contact: '采样前台',
  phone: '021-6485 2200',
}
import { SendSampleScreen } from '@/components/mini/send-sample-screen'
import { ResampleScreen } from '@/components/mini/resample-screen'
import { ReportDetailScreen } from '@/components/mini/report-detail-screen'
import { WechatPaySheet } from '@/components/mini/wechat-pay-sheet'
import { VerifyCodeSheet } from '@/components/mini/verify-code-sheet'
import { OrderFilterBar, type OrderTypeFilter } from '@/components/mini/order-filter-bar'
import { OrderEmptyState } from '@/components/mini/order-empty-state'
import { getSampleTypes, testServices } from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

const noSampleCodeStatuses = new Set(['待发货', '待核销'])

const parseYuan = (s: string) => Number(s.replace(/[^\d.]/g, '')) || 0

export const formatYuan = (n: number) => `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`

/** 按商品金额比例把优惠分摊到各子订单（精确到分，尾差计入最后一单） */
export function allocateCoupon(prices: number[], off: number): number[] {
  const total = prices.reduce((a, b) => a + b, 0)
  if (off <= 0 || total <= 0) return prices.map(() => 0)
  const cents = Math.round(Math.min(off, total) * 100)
  let rest = cents
  return prices.map((p, i) => {
    if (i === prices.length - 1) return rest / 100
    const share = Math.floor((cents * p) / total)
    rest -= share
    return share / 100
  })
}

export function splitPricing(price: number, share: number): Pick<Order, 'amount' | 'goodsAmount' | 'couponShare'> {
  if (share <= 0) return { amount: formatYuan(price) }
  return {
    amount: formatYuan(Math.round((price - share) * 100) / 100),
    goodsAmount: formatYuan(price),
    couponShare: formatYuan(share),
  }
}

type OrderActionHandlers = {
  onCancel: (o: Order) => void
  onRefund: (kind: RefundKind) => void
  onHandleUnqualified: (o: Order) => void
  onOpenGuide: () => void
  onSendSample: (o: Order) => void
  onTestingRefund: (o: Order) => void
  onViewLogistics: (o: Order) => void
  onViewReport: (o: Order) => void
  onPay: (o: Order) => void
  onShowVerifyCode: (o: Order) => void
}

/** 自采样用户采样后可直接寄样；定点采样在机构完成采样（待寄样）后才可寄样 */
const canSendSample = (o: Order) => o.status === '待寄样' || (o.type === 'self' && o.status === '待采样')

function OrderActions({
  order: o,
  onCancel,
  onRefund,
  onHandleUnqualified,
  onOpenGuide,
  onSendSample,
  onTestingRefund,
  onViewLogistics,
  onViewReport,
  onPay,
  onShowVerifyCode,
}: { order: Order } & OrderActionHandlers) {
  const sendable = canSendSample(o)
  return (
    <>
      {o.refund && (
        <button
          type="button"
          onClick={() => {
            if (o.refund === 'cancel') onCancel(o)
            else if (o.refund === 'testing') onTestingRefund(o)
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
            if (o.unqualified) onHandleUnqualified(o)
            else if (o.action?.label === '采样指引') onOpenGuide()
            else if (o.action?.label === '查看物流') onViewLogistics(o)
            else if (o.action?.label === '查看报告') onViewReport(o)
            else if (o.action?.label === '去支付') onPay(o)
            else if (o.action?.label === '核销码') onShowVerifyCode(o)
          }}
          className={cn(
            'h-7 rounded-full px-3.5 text-[12px] font-medium',
            o.action.primary && !sendable
              ? 'bg-primary text-primary-foreground'
              : 'border border-[#dfe5ef] text-foreground',
          )}
        >
          {o.action.label}
        </button>
      )}
      {sendable && (
        <button
          type="button"
          onClick={() => onSendSample(o)}
          className="h-7 rounded-full bg-primary px-3.5 text-[12px] font-medium text-primary-foreground"
        >
          寄样
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
  const goodsTotal = parseYuan(order.goodsAmount ?? order.originalAmount ?? order.amount)
  const names = order.examinees.split('、')
  const per = Math.round((goodsTotal / names.length) * 100) / 100
  const d = order.id.slice(2, 10)
  const payTime = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)} 10:24:36`
  const hasSampleCode = !noSampleCodeStatuses.has(order.status)
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
      statusDesc={
        order.payRemaining != null
          ? `剩余支付时间 ${formatCountdown(order.payRemaining)}，超时订单将自动关闭`
          : order.note
      }
      sampleCodes={sampleCodes}
      priceAdjust={
        order.priceChanged && order.status === '待付款' ? { before: goodsTotal, after: payable } : undefined
      }
      receiver={{ name: '王建国', phone: '138****6621', detail: '上海市徐汇区漕溪北路 398 号 汇智大厦 12 楼' }}
      site={{ name: '都正检测中心（徐汇）', address: '上海市徐汇区宜山路 700 号 B1 栋 3 楼', time: '10-18 09:00-11:00' }}
      groups={names.map((name, i) => ({
        id: `${order.id}-${i}`,
        name,
        items: [{ id: `${order.id}-${i}-item`, name: order.product, price: per, sampleType }],
      }))}
      goodsTotal={goodsTotal}
      couponOff={order.priceChanged ? 0 : Math.max(Math.round((goodsTotal - payable) * 100) / 100, 0)}
      couponShared={Boolean(order.parentId && order.couponShare)}
      parentOrderNo={order.parentId}
      payable={payable}
      actions={actions}
      onBack={onBack}
    />
  )
}

export type OrderPhase = 'all' | 'toPay' | 'toSample' | 'testing' | 'done' | 'closed'
type OrderType = OrderTypeFilter

type StatusTabKey = 'all' | 'toPay' | 'toUse' | 'toSample' | 'testing' | 'done' | 'closed'
type StatusTab = { key: StatusTabKey; label: string; match: (o: Order) => boolean }

const byStatuses =
  (...statuses: string[]) =>
  (o: Order) =>
    statuses.includes(o.status)

/** 列表 Tab 按「用户下一步要做什么」归组，卡片上仍显示细分状态 */
const statusTabs: StatusTab[] = [
  { key: 'all', label: '全部', match: () => true },
  { key: 'toPay', label: '待付款', match: byStatuses('待付款') },
  { key: 'toUse', label: '待使用', match: byStatuses('待发货', '待收货', '待核销') },
  { key: 'toSample', label: '待采样', match: byStatuses('待采样', '待寄样') },
  { key: 'testing', label: '检测中', match: byStatuses('待收样', '待检测', '检测中') },
  { key: 'done', label: '已完成', match: byStatuses('已完成') },
  { key: 'closed', label: '已关闭', match: byStatuses('已关闭') },
]

const phaseToTab: Record<OrderPhase, StatusTabKey> = {
  all: 'all',
  toPay: 'toPay',
  toSample: 'toSample',
  testing: 'testing',
  done: 'done',
  closed: 'closed',
}

const matchesKeyword = (o: Order, keyword: string) =>
  !keyword || [o.id, o.product, o.examinees, o.parentId ?? ''].some((field) => field.includes(keyword))

export type Order = {
  id: string
  type: Exclude<OrderType, 'all'>
  phase: Exclude<OrderPhase, 'all'>
  status: string
  product: string
  examinees: string
  amount: string
  originalAmount?: string
  /** 拆单后该子订单的商品原价（未扣优惠） */
  goodsAmount?: string
  /** 合并支付使用优惠券时，按金额比例分摊到该子订单的优惠 */
  couponShare?: string
  /** 合并支付单号，拆单后的子订单关联此单号 */
  parentId?: string
  note: string
  resample?: boolean
  priceChanged?: boolean
  unqualified?: boolean
  refund?: RefundKind
  action?: { label: string; primary?: boolean }
  payExpiresIn?: number
  payRemaining?: number
}

const formatCountdown = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

const payCountdowns = [1680, 1260, 840, 420, 35]

export type RefundKind = 'cancel' | 'shipped' | 'resample' | 'testing'

const refundLabels: Record<RefundKind, string> = {
  cancel: '取消订单',
  shipped: '申请退款',
  testing: '申请退款',
  resample: '终止并退款',
}

const ORDERS_PER_STATUS = 1

type SeedVariant = Partial<
  Pick<Order, 'examinees' | 'note' | 'priceChanged' | 'unqualified' | 'resample' | 'action' | 'refund'>
> & {
  /** 合并支付后拆分出的子订单，归属同一合并支付单并分摊优惠券 */
  split?: boolean
  coupon?: number
}

type StatusSeed = Pick<Order, 'type' | 'phase' | 'status' | 'refund' | 'action'> & {
  notes: string[]
  variants?: Record<number, SeedVariant>
}

const toPayNote = '请在倒计时结束前完成支付，超时订单将自动关闭'
const priceChangedVariant: SeedVariant = {
  examinees: '王建国、李秀兰',
  priceChanged: true,
  note: '客服已调整订单金额，请按最新价格支付',
}
const closedNotes = [
  '用户已取消订单，支付金额已全额原路退回',
  '超时未支付，订单已自动关闭',
  '已退款，扣除已产生费用后剩余金额已原路退回',
  '已同意重采样，原订单关闭',
  '已终止订单，扣除已产生费用后剩余金额原路退回',
]
const unqualifiedVariant: SeedVariant = {
  unqualified: true,
  refund: undefined,
  action: { label: '去处理', primary: true },
  note: '样本 DNA 浓度不足，已短信通知您：可选择终止订单或同意重采样',
}

/** 自采样：待付款 → 待发货 → 待收货 → 待采样 → 待寄样 → 待收样 → 待检测 → 检测中 → 已完成 / 已关闭 */
const selfSeeds: StatusSeed[] = [
  {
    type: 'self',
    phase: 'toPay',
    status: '待付款',
    action: { label: '去支付', primary: true },
    notes: [toPayNote],
    variants: { 1: priceChangedVariant, 2: { examinees: '张伟、刘芳' } },
  },
  {
    type: 'self',
    phase: 'toSample',
    status: '待发货',
    refund: 'cancel',
    notes: ['已支付，实验室将在 24 小时内寄出采样盒', '采样盒打包中，预计今日寄出'],
    variants: {
      3: { split: true },
      4: { resample: true, note: '重采样订单，实验室将在 24 小时内寄出新的采样盒' },
    },
  },
  {
    type: 'self',
    phase: 'toSample',
    status: '待收货',
    refund: 'shipped',
    action: { label: '查看物流' },
    notes: ['采样盒运输中，预计明日送达', '采样盒已到达派送网点，今日派送'],
    variants: { 3: { split: true } },
  },
  {
    type: 'self',
    phase: 'toSample',
    status: '待采样',
    refund: 'shipped',
    action: { label: '采样指引', primary: true },
    notes: ['采样盒已签收，请观看采样指引完成采样'],
  },
  {
    type: 'self',
    phase: 'toSample',
    status: '待寄样',
    refund: 'testing',
    action: { label: '采样指引' },
    notes: ['已完成采样，请预约顺丰上门取件寄回样本'],
  },
  {
    type: 'self',
    phase: 'testing',
    status: '待收样',
    refund: 'testing',
    action: { label: '查看物流' },
    notes: ['样本回寄中，顺丰 SF1428 6650 3321', '快递员已上门取件，样本运往实验室中'],
  },
  {
    type: 'self',
    phase: 'testing',
    status: '待检测',
    refund: 'testing',
    notes: ['实验室已签收样本，排队等待上机检测'],
    variants: { 3: { split: true } },
  },
  {
    type: 'self',
    phase: 'testing',
    status: '检测中',
    refund: 'testing',
    notes: ['实验室检测中，预计 5 个工作日内出具报告'],
    variants: { 4: unqualifiedVariant },
  },
  {
    type: 'self',
    phase: 'done',
    status: '已完成',
    action: { label: '查看报告', primary: true },
    notes: ['检测报告已出具，可在线查看'],
  },
  { type: 'self', phase: 'closed', status: '已关闭', notes: closedNotes },
]

/** 定点采样：待付款 → 待核销 → 待采样 → 待寄样 → 待收样 → 待检测 → 检测中 → 已完成 / 已关闭 */
const siteSeeds: StatusSeed[] = [
  {
    type: 'site',
    phase: 'toPay',
    status: '待付款',
    action: { label: '去支付', primary: true },
    notes: [toPayNote],
    variants: { 1: priceChangedVariant, 2: { examinees: '李秀兰、刘芳' } },
  },
  {
    type: 'site',
    phase: 'toSample',
    status: '待核销',
    action: { label: '核销码', primary: true },
    notes: ['请于 10-18 前往 都正检测中心（徐汇） 出示核销码', '请于 10-20 前往 都正检测中心（浦东） 出示核销码'],
    variants: {
      3: { split: true },
      4: { resample: true, note: '重采样订单，请前往 都正检测中心（徐汇） 出示核销码重新采样' },
    },
  },
  {
    type: 'site',
    phase: 'toSample',
    status: '待采样',
    notes: ['已核销，都正检测中心（徐汇） 正在为您采样'],
  },
  {
    type: 'site',
    phase: 'toSample',
    status: '待寄样',
    refund: 'testing',
    notes: ['机构已完成采样，可预约顺丰上门取件寄样'],
  },
  {
    type: 'site',
    phase: 'testing',
    status: '待收样',
    refund: 'testing',
    action: { label: '查看物流' },
    notes: ['机构已寄出样本，正在运往实验室'],
    variants: { 3: { split: true } },
  },
  {
    type: 'site',
    phase: 'testing',
    status: '待检测',
    refund: 'testing',
    notes: ['实验室已签收样本，排队等待上机检测'],
  },
  {
    type: 'site',
    phase: 'testing',
    status: '检测中',
    refund: 'testing',
    notes: ['实验室检测中，预计 5 个工作日内出具报告'],
  },
  {
    type: 'site',
    phase: 'done',
    status: '已完成',
    action: { label: '查看报告', primary: true },
    notes: ['检测报告已出具，可在线查看'],
  },
  { type: 'site', phase: 'closed', status: '已关闭', notes: closedNotes },
]

const seedProducts: { name: string; price: number }[] = [
  { name: '药物基因检测', price: 999 },
  { name: '心血管用药基因检测', price: 899 },
  { name: '个体化用药基因检测 · 全面版', price: 1299 },
  { name: '精神类用药基因检测', price: 1299 },
  { name: '儿童安全用药基因检测', price: 699 },
]
const seedExaminees = ['王建国', '李秀兰', '张伟', '刘芳', '陈静']

const splitParents: Record<Order['type'], { id: string; coupon: number }> = {
  self: { id: 'JY20261012283615', coupon: 100 },
  site: { id: 'JY20261011517702', coupon: 50 },
}

function buildSeedOrders(): Order[] {
  const orders: Order[] = []
  let seq = 0
  for (const seeds of [selfSeeds, siteSeeds]) {
    const splitIndexes: number[] = []
    seeds.forEach((seed, stage) => {
      for (let i = 0; i < ORDERS_PER_STATUS; i++) {
        const { split, coupon: variantCoupon, ...variant } = seed.variants?.[i] ?? {}
        const n = seq++
        const product = seedProducts[(n + stage) % seedProducts.length]
        const examinees = variant.examinees ?? seedExaminees[(n + stage) % seedExaminees.length]
        const goods = product.price * examinees.split('、').length
        const finished = seed.phase === 'done' || seed.phase === 'closed'
        const month = finished ? '09' : '10'
        const day = String(finished ? 28 - i * 2 : 16 - stage).padStart(2, '0')
        const coupon = variantCoupon ?? (seed.phase !== 'toPay' && i === 1 ? 50 : 0)
        const pricing: Pick<Order, 'amount' | 'goodsAmount' | 'couponShare' | 'originalAmount'> = variant.resample
          ? { amount: '¥0' }
          : variant.priceChanged
            ? { amount: formatYuan(goods - 200), originalAmount: formatYuan(goods) }
            : splitPricing(goods, coupon)
        if (split) splitIndexes.push(orders.length)
        orders.push({
          id: `DZ2026${month}${day}${String(100 + n).padStart(3, '0')}`,
          type: seed.type,
          phase: seed.phase,
          status: seed.status,
          product: product.name,
          examinees,
          ...pricing,
          note: seed.notes[i % seed.notes.length],
          refund: seed.refund,
          action: seed.action,
          payExpiresIn: seed.phase === 'toPay' ? payCountdowns[i % payCountdowns.length] : undefined,
          ...variant,
        })
      }
    })
    const parent = splitParents[seeds[0].type]
    const shares = allocateCoupon(
      splitIndexes.map((idx) => parseYuan(orders[idx].amount)),
      parent.coupon,
    )
    splitIndexes.forEach((idx, k) => {
      const child = orders[idx]
      orders[idx] = {
        ...child,
        id: `${parent.id}-${String(k + 1).padStart(2, '0')}`,
        parentId: parent.id,
        ...splitPricing(parseYuan(child.amount), shares[k]),
      }
    })
  }
  return orders.sort((a, b) => b.id.slice(2, 10).localeCompare(a.id.slice(2, 10)))
}

const allOrders: Order[] = buildSeedOrders()

export type OrderTabKey = StatusTabKey

export function countOrders(key: Exclude<StatusTabKey, 'all'>) {
  const tabDef = statusTabs.find((t) => t.key === key)
  return tabDef ? allOrders.filter(tabDef.match).length : 0
}

export function OrderListScreen({
  initialPhase = 'all',
  initialType = 'all',
  initialTab,
  initialGuideOpen = false,
  extraOrders = [],
  empty = false,
  onGoShop,
  onBack,
  onRefund,
}: {
  initialPhase?: OrderPhase
  initialType?: OrderType
  initialTab?: StatusTabKey
  initialGuideOpen?: boolean
  extraOrders?: Order[]
  empty?: boolean
  onGoShop?: () => void
  onBack: () => void
  onHandleUnqualified?: () => void
  onRefund: (kind: RefundKind) => void
}) {
  const [type, setType] = useState<OrderType>(initialType)
  const [statusKey, setStatusKey] = useState<StatusTabKey>(initialTab ?? phaseToTab[initialPhase])
  const [keyword, setKeyword] = useState('')
  const [guideOpen, setGuideOpen] = useState(initialGuideOpen)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelledIds, setCancelledIds] = useState<ReadonlySet<string>>(() => new Set())
  const [sendTarget, setSendTarget] = useState<Order | null>(null)
  const [sentNotes, setSentNotes] = useState<ReadonlyMap<string, string>>(() => new Map())
  const [logisticsTarget, setLogisticsTarget] = useState<Order | null>(null)
  const [reportTarget, setReportTarget] = useState<Order | null>(null)
  const [refundTarget, setRefundTarget] = useState<Order | null>(null)
  const [refundAppliedIds, setRefundAppliedIds] = useState<ReadonlySet<string>>(() => new Set())
  const [resampleTarget, setResampleTarget] = useState<Order | null>(null)
  const [resampledTo, setResampledTo] = useState<ReadonlyMap<string, string>>(() => new Map())
  const [terminatedIds, setTerminatedIds] = useState<ReadonlySet<string>>(() => new Set())
  const [payTarget, setPayTarget] = useState<Order | null>(null)
  const [codeTarget, setCodeTarget] = useState<Order | null>(null)
  const [paidIds, setPaidIds] = useState<ReadonlySet<string>>(() => new Set())
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const elapsed = Math.floor((now - startedAt) / 1000)
  const baseOrders = empty ? [] : allOrders
  const resampleOrders: Order[] = baseOrders.flatMap((o) => {
    const newId = resampledTo.get(o.id)
    if (!newId) return []
    return [
      {
        id: newId,
        type: o.type,
        phase: 'toSample',
        status: o.type === 'site' ? '待核销' : '待发货',
        product: o.product,
        examinees: o.examinees,
        amount: '¥0',
        note:
          o.type === 'site'
            ? `重采样订单（关联原订单 ${o.id}），请到店出示核销码重新采样`
            : `重采样订单（关联原订单 ${o.id}），实验室将在 24 小时内寄出新的采样盒`,
        resample: true,
      },
    ]
  })
  const withSiteActions = (o: Order): Order => {
    if (o.phase === 'toPay' && !paidIds.has(o.id)) return o.refund ? o : { ...o, refund: 'cancel' }
    if (o.type !== 'site') return o
    if (o.status === '待核销' && !o.refund) return { ...o, refund: 'cancel' }
    if (o.status === '待收样' && !o.action) return { ...o, action: { label: '查看物流' } }
    return o
  }
  const sourceOrders = [...extraOrders, ...resampleOrders, ...baseOrders].map(withSiteActions).flatMap((o): Order[] => {
    const names = o.examinees.split('、')
    if (!paidIds.has(o.id) || names.length < 2) return [o]
    const goods = parseYuan(o.goodsAmount ?? o.originalAmount ?? o.amount)
    const unit = Math.round((goods / names.length) * 100) / 100
    const shares = allocateCoupon(
      names.map(() => unit),
      Math.max(goods - parseYuan(o.amount), 0),
    )
    return names.map((name, i) => ({
      ...o,
      id: `${o.id}-${String(i + 1).padStart(2, '0')}`,
      parentId: o.id,
      examinees: name,
      ...splitPricing(unit, shares[i]),
    }))
  })
  const isPaid = (o: Order) => paidIds.has(o.id) || (o.parentId != null && paidIds.has(o.parentId))
  const orders = sourceOrders.map((o): Order => {
    if (isPaid(o)) {
      return o.type === 'site'
        ? {
            ...o,
            phase: 'toSample',
            status: '待核销',
            note: '已支付，请前往 都正检测中心（徐汇） 出示核销码',
            priceChanged: false,
            originalAmount: undefined,
            refund: 'cancel',
            action: { label: '核销码', primary: true },
            ...(cancelledIds.has(o.id) && {
              phase: 'closed' as const,
              status: '已关闭',
              note: '用户已取消订单，支付金额已全额原路退回',
              refund: undefined,
              action: undefined,
            }),
          }
        : {
            ...o,
            phase: 'toSample',
            status: cancelledIds.has(o.id) ? '已关闭' : '待发货',
            note: '已支付，实验室将在 24 小时内寄出采样盒',
            priceChanged: false,
            originalAmount: undefined,
            refund: 'cancel',
            action: undefined,
            ...(cancelledIds.has(o.id) && {
              phase: 'closed' as const,
              note: '用户已取消订单，支付金额将原路退回',
              refund: undefined,
            }),
          }
    }
    if (o.phase === 'toPay' && cancelledIds.has(o.id)) {
      return {
        ...o,
        phase: 'closed',
        status: '已关闭',
        note: '用户已取消订单',
        priceChanged: false,
        originalAmount: undefined,
        payRemaining: undefined,
        refund: undefined,
        action: undefined,
      }
    }
    if (o.phase === 'toPay' && o.payExpiresIn != null) {
      const remaining = o.payExpiresIn - elapsed
      return remaining > 0
        ? { ...o, payRemaining: remaining }
        : {
            ...o,
            phase: 'closed',
            status: '已关闭',
            note: '超时未支付，订单已自动关闭',
            priceChanged: false,
            originalAmount: undefined,
            refund: undefined,
            action: undefined,
          }
    }
    const resampledId = resampledTo.get(o.id)
    if (resampledId || terminatedIds.has(o.id)) {
      return {
        ...o,
        phase: 'closed',
        status: '已关闭',
        note: resampledId
          ? `已同意重采样，原订单关闭，新订单 ${resampledId}`
          : '已终止订单，扣除已产生费用后剩余金额原路退回',
        unqualified: false,
        refund: undefined,
        action: undefined,
      }
    }
    const sentNote = sentNotes.get(o.id)
    const base: Order = sentNote
      ? {
          ...o,
          phase: 'testing',
          status: '待收样',
          note: sentNote,
          refund: 'testing',
          action: { label: '查看物流' },
        }
      : o
    if (refundAppliedIds.has(o.id)) {
      return {
        ...base,
        phase: 'closed',
        status: '已关闭',
        note: '已退款，扣除已产生费用后剩余金额已原路退回',
        refund: undefined,
        action: undefined,
      }
    }
    if (sentNote) return base
    return cancelledIds.has(o.id)
      ? {
          ...o,
          phase: 'closed',
          status: '已关闭',
          note: '用户已取消订单，支付金额将原路退回',
          refund: undefined,
          action: undefined,
        }
      : o
  })

  const confirmCancel = () => {
    if (!cancelTarget) return
    const id = cancelTarget.id
    setCancelledIds((prev) => new Set(prev).add(id))
    setCancelTarget(null)
  }

  const actionHandlers: OrderActionHandlers = {
    onCancel: setCancelTarget,
    onRefund,
    onHandleUnqualified: setResampleTarget,
    onOpenGuide: () => setGuideOpen(true),
    onSendSample: setSendTarget,
    onTestingRefund: setRefundTarget,
    onViewLogistics: setLogisticsTarget,
    onViewReport: setReportTarget,
    onPay: setPayTarget,
    onShowVerifyCode: setCodeTarget,
  }
  const detailOrder = detailId ? orders.find((o) => o.id === detailId) : undefined
  const hasActions = (o: Order) => Boolean(o.refund || o.action || canSendSample(o))

  const activeTab = statusTabs.find((t) => t.key === statusKey) ?? statusTabs[0]
  const trimmedKeyword = keyword.trim()
  const filtered = orders.filter((o) => (type === 'all' || o.type === type) && matchesKeyword(o, trimmedKeyword))
  const visible = filtered.filter(activeTab.match)

  if (orders.length === 0) {
    return (
      <SubPage title="我的订单" titleId="order-list-title" onBack={onBack}>
        <OrderEmptyState variant="none" onGoShop={onGoShop} />
      </SubPage>
    )
  }

  const typeLabel = type === 'self' ? '自采样' : type === 'site' ? '定点采样' : ''
  const tabLabel = activeTab.key === 'all' ? '' : activeTab.label
  const filteredLabel = [typeLabel, tabLabel].filter(Boolean).join(' · ')

  return (
    <SubPage title="我的订单" titleId="order-list-title" onBack={onBack}>
      <OrderFilterBar keyword={keyword} onKeywordChange={setKeyword} type={type} onTypeChange={setType} />

      <div
        role="tablist"
        aria-label="订单状态"
        className="flex shrink-0 gap-1 overflow-x-auto bg-white px-2 [scrollbar-width:none]"
      >
        {statusTabs.map((t) => {
          const count = t.key === 'all' || t.key === 'done' || t.key === 'closed' ? 0 : filtered.filter(t.match).length
          const active = activeTab.key === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusKey(t.key)}
              className={cn(
                'relative flex h-10 shrink-0 items-center justify-center gap-0.5 whitespace-nowrap px-2.5 text-[13px] transition-colors',
                active ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {t.label}
              {count > 0 && <span className="text-[11px] tabular-nums text-primary">{count}</span>}
              {active && (
                <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      <ul className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]">
        {visible.length === 0 && (
          <li className="flex">
            {trimmedKeyword ? (
              <OrderEmptyState variant="search" keyword={trimmedKeyword} onClearSearch={() => setKeyword('')} />
            ) : (
              <OrderEmptyState variant="filtered" label={filteredLabel} />
            )}
          </li>
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
                  {o.parentId && (
                    <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">合并支付单 {o.parentId}</p>
                  )}
                </div>
                <p className="shrink-0 text-right">
                  <span className="block text-[14px] font-semibold tabular-nums text-foreground">{o.amount}</span>
                  {o.originalAmount && (
                    <span className="block text-[11px] tabular-nums text-muted-foreground line-through">
                      {o.originalAmount}
                    </span>
                  )}
                  {o.couponShare && (
                    <span className="block text-[11px] tabular-nums text-[#e5603a]">
                      {o.parentId ? '分摊优惠' : '优惠'} -{o.couponShare}
                    </span>
                  )}
                </p>
              </div>

              {o.payRemaining != null && (
                <p role="timer" className="mt-2 flex items-center gap-1 text-[12px] text-[#e0651c]">
                  <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                  剩余支付时间
                  <span className="font-semibold tabular-nums">{formatCountdown(o.payRemaining)}</span>
                  ，超时自动关闭
                </p>
              )}

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
      {resampleTarget && (
        <ResampleScreen
          order={{
            no: resampleTarget.id,
            product: resampleTarget.product,
            examinee: resampleTarget.examinees,
            mode: resampleTarget.type === 'self' ? '自采样' : '定点采样',
            paid: parseYuan(resampleTarget.amount),
            reason: '样本 DNA 浓度不足，无法完成检测',
            notifiedAt: '2026-10-14 10:32',
          }}
          newOrderNo={resampledTo.get(resampleTarget.id) ?? `DZ20261016${String(resampledTo.size + 1).padStart(3, '0')}`}
          doneLabel="返回订单列表"
          onBack={() => setResampleTarget(null)}
          onResampled={() =>
            setResampledTo((prev) =>
              new Map(prev).set(resampleTarget.id, `DZ20261016${String(prev.size + 1).padStart(3, '0')}`),
            )
          }
          onTerminated={() => setTerminatedIds((prev) => new Set(prev).add(resampleTarget.id))}
          onViewNewOrder={() => {
            const newId = resampledTo.get(resampleTarget.id)
            setResampleTarget(null)
            if (newId) setDetailId(newId)
          }}
        />
      )}
      {guideOpen && <SamplingVideoDialog onClose={() => setGuideOpen(false)} />}
      {sendTarget && (
        <SendSampleScreen
          orderNo={sendTarget.id}
          examinees={sendTarget.examinees}
          site={sendTarget.type === 'site' ? samplingSite : undefined}
          onBack={() => setSendTarget(null)}
          onSubmitted={() =>
            setSentNotes((prev) => new Map(prev).set(sendTarget.id, '已提交顺丰上门取件，快递员将上门取样'))
          }
        />
      )}
      {logisticsTarget && (
        <LogisticsScreen
          direction={logisticsTarget.status === '待收货' ? 'outbound' : 'return'}
          orderNo={logisticsTarget.id}
          site={logisticsTarget.type === 'site' ? samplingSite : undefined}
          onBack={() => setLogisticsTarget(null)}
        />
      )}
      {reportTarget && (
        <ReportDetailScreen
          report={{
            id: `BG${reportTarget.id.slice(2)}`,
            product: reportTarget.product,
            examinee: reportTarget.examinees.split('、')[0],
            relation: '本人',
            date: `${reportTarget.id.slice(2, 6)}-${reportTarget.id.slice(6, 8)}-${reportTarget.id.slice(8, 10)}`,
          }}
          onBack={() => setReportTarget(null)}
        />
      )}
      {refundTarget && (
        <TestingRefundScreen
          order={{
            no: refundTarget.id,
            product: refundTarget.product,
            examinee: refundTarget.examinees,
            paid: parseYuan(refundTarget.amount),
            status: refundTarget.status,
            type: refundTarget.type,
          }}
          onBack={() => setRefundTarget(null)}
          onSubmitted={() => setRefundAppliedIds((prev) => new Set(prev).add(refundTarget.id))}
        />
      )}
      {payTarget && orders.some((o) => o.id === payTarget.id && o.phase === 'toPay') && (
        <WechatPaySheet
          amount={parseYuan(payTarget.amount)}
          onCancel={() => setPayTarget(null)}
          onSuccess={() => {
            setPaidIds((prev) => new Set(prev).add(payTarget.id))
            setPayTarget(null)
          }}
        />
      )}
      {codeTarget && (
        <VerifyCodeSheet
          orderNo={codeTarget.id}
          product={codeTarget.product}
          examinees={codeTarget.examinees}
          siteName={codeTarget.note.match(/前往\s*(\S+)\s*出示/)?.[1]}
          onClose={() => setCodeTarget(null)}
        />
      )}
      {cancelTarget && (
        <CancelOrderScreen
          unpaid={cancelTarget.phase === 'toPay' && !isPaid(cancelTarget)}
          paid={parseYuan(cancelTarget.amount)}
          onBack={() => setCancelTarget(null)}
          onCancelled={confirmCancel}
        />
      )}
    </SubPage>
  )
}
