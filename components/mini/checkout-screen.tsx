'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  FlaskConical,
  House,
  MapPin,
  MessageSquareText,
  Package,
  ShieldCheck,
  Ticket,
  UserRound,
  X,
} from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { ConsentReaderScreen } from '@/components/mini/consent-reader-screen'
import { ExamineeFormScreen } from '@/components/mini/examinee-form-screen'
import { SiteListScreen } from '@/components/mini/site-list-screen'
import { OrderDetailScreen } from '@/components/mini/order-detail-screen'
import {
  OrderListScreen,
  allocateCoupon,
  formatYuan,
  splitPricing,
  type Order,
  type RefundKind,
} from '@/components/mini/order-list-screen'
import { CancelOrderScreen, ShippedRefundScreen } from '@/components/mini/refund-screen'
import { WechatPaySheet } from '@/components/mini/wechat-pay-sheet'
import { VerifyCodeSheet } from '@/components/mini/verify-code-sheet'
import { WechatIcon } from '@/components/mini/wechat-icon'
import { researchDocs } from '@/components/mini/research-sign-flow'

type ResearchItem = { key: string; memberName: string; serviceName: string }
import { initialExaminees, sites, type Examinee } from '@/components/mini/checkout-data'
import { useExaminees } from '@/components/mini/examinee-store'
import {
  getSampleTypes,
  samplingLabel,
  testServices,
  type SamplingMode,
  type TestService,
} from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

export type CheckoutLine = { id: string; qty: number }

type Address = { id: string; name: string; phone: string; detail: string; tag?: string }

const addresses: Address[] = [
  { id: 'home', name: '王建国', phone: '138****6721', detail: '浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1206', tag: '默认' },
  { id: 'work', name: '王建国', phone: '138****6721', detail: '浙江省杭州市滨江区网商路 699 号 3 号楼 5 层', tag: '公司' },
  { id: 'parent', name: '李秀兰', phone: '139****2048', detail: '浙江省绍兴市越城区中兴中路 128 号 2 单元 302' },
]

const samplingModes: { key: SamplingMode; icon: typeof House; desc: string }[] = [
  { key: 'self', icon: House, desc: '采样盒寄到家，仅支持唾液样本' },
  { key: 'site', icon: Building2, desc: '前往合作机构，支持全部样本类型' },
]

type PayMethod = 'wechat'

const payMethods: { key: PayMethod; label: string; desc: string; tag?: string; icon: typeof WechatIcon; color: string }[] = [
  { key: 'wechat', label: '微信支付', desc: '使用微信零钱或绑定银行卡支付', icon: WechatIcon, color: '#07c160' },
]

type Coupon = { id: string; title: string; threshold: number; amount: number; expire: string }

const coupons: Coupon[] = [
  { id: 'c100', title: '满 1000 减 100', threshold: 1000, amount: 100, expire: '2026.12.31 到期' },
  { id: 'c50', title: '满 500 减 50', threshold: 500, amount: 50, expire: '2026.11.30 到期' },
  { id: 'new', title: '新人专享 立减 30', threshold: 0, amount: 30, expire: '2026.10.31 到期' },
]

type Props = {
  lines: CheckoutLine[]
  onBack: () => void
  onSubmitted: () => void
  onDone: () => void
}

export function CheckoutScreen({ lines, onBack, onSubmitted, onDone }: Props) {
  const rows = lines
    .map((l) => ({ line: l, service: testServices.find((s) => s.id === l.id) }))
    .filter((r): r is { line: CheckoutLine; service: TestService } => !!r.service)

  const [examinees, setExaminees] = useExaminees()
  const [examineeForm, setExamineeForm] = useState<{ serviceId: string | null } | null>(null)

  const [assign, setAssign] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      rows.map((r) => [
        r.service.id,
        initialExaminees.slice(0, Math.min(Math.max(r.line.qty, 1), initialExaminees.length)).map((e) => e.id),
      ]),
    ),
  )

  const toggleAssign = (serviceId: string, memberId: string) => {
    setAssign((a) => {
      const cur = a[serviceId] ?? []
      const next = cur.includes(memberId) ? cur.filter((x) => x !== memberId) : [...cur, memberId]
      return { ...a, [serviceId]: examinees.map((e) => e.id).filter((id) => next.includes(id)) }
    })
    setResearch((r) => ({ ...r, [serviceId]: (r[serviceId] ?? []).filter((x) => x !== memberId) }))
    setAssignWarn(false)
  }

  const addExaminee = (e: Examinee) => {
    const target = examineeForm?.serviceId
    setExaminees((list) => [...list, e])
    if (target) {
      setAssign((a) => ({ ...a, [target]: [...(a[target] ?? []), e.id] }))
      setAssignWarn(false)
    }
    setExamineeForm(null)
  }

  const countOf = (serviceId: string) => assign[serviceId]?.length ?? 0
  const goodsTotal = rows.reduce((n, r) => n + r.service.price * countOf(r.service.id), 0)
  const qtyTotal = rows.reduce((n, r) => n + countOf(r.service.id), 0)
  const usable = coupons.filter((c) => goodsTotal >= c.threshold)
  const best = usable.reduce<Coupon | null>((b, c) => (!b || c.amount > b.amount ? c : b), null)
  const byMember = examinees
    .map((e) => ({ member: e, items: rows.filter((r) => assign[r.service.id]?.includes(e.id)).map((r) => r.service) }))
    .filter((g) => g.items.length > 0)
  const unassigned = rows.filter((r) => countOf(r.service.id) === 0)

  const [assignWarn, setAssignWarn] = useState(false)
  const [couponId, setCouponId] = useState<string | null>(best?.id ?? null)
  const [couponOpen, setCouponOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [researchDocOpen, setResearchDocOpen] = useState(false)
  const [research, setResearch] = useState<Record<string, string[]>>({})
  const toggleResearch = (serviceId: string, memberId: string) =>
    setResearch((r) => {
      const cur = r[serviceId] ?? []
      return { ...r, [serviceId]: cur.includes(memberId) ? cur.filter((x) => x !== memberId) : [...cur, memberId] }
    })
  const [warn, setWarn] = useState(false)
  const [payMethod, setPayMethod] = useState<PayMethod>('wechat')
  const [submitted, setSubmitted] = useState(false)
  const [paying, setPaying] = useState(false)
  const [unpaid, setUnpaid] = useState(false)
  const [paidInfo, setPaidInfo] = useState<{ orderNo: string; time: string } | null>(null)
  const [resentSms, setResentSms] = useState<string[]>([])
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [orderListOpen, setOrderListOpen] = useState(false)
  const [verifyCodeOpen, setVerifyCodeOpen] = useState(false)
  const [refundKind, setRefundKind] = useState<RefundKind | null>(null)
  const researchItems: ResearchItem[] = rows.flatMap((r) =>
    (research[r.service.id] ?? []).flatMap((mid) => {
      const m = examinees.find((e) => e.id === mid)
      return m ? [{ key: `${r.service.id}-${mid}`, memberName: m.name, serviceName: r.service.name }] : []
    }),
  )

  const coupon = usable.find((c) => c.id === couponId) ?? null
  const couponOff = coupon?.amount ?? 0
  const payable = Math.max(goodsTotal - couponOff, 0)

  const pickTypes = (m: SamplingMode, prev: Record<string, string> = {}) =>
    Object.fromEntries(
      rows.map((r) => {
        const opts = getSampleTypes(r.service.id, m)
        const keep = opts.some((o) => o.id === prev[r.service.id])
        return [r.service.id, keep ? prev[r.service.id] : (opts[0]?.id ?? '')]
      }),
    )

  const [mode, setMode] = useState<SamplingMode>(() =>
    rows.every((r) => getSampleTypes(r.service.id, 'self').length > 0) ? 'self' : 'site',
  )
  const [sampleType, setSampleType] = useState<Record<string, string>>(() => pickTypes(mode))
  const [addressId, setAddressId] = useState(addresses[0].id)
  const [siteId, setSiteId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<'address' | 'site' | null>(null)
  const [sampleWarn, setSampleWarn] = useState(false)

  const changeMode = (m: SamplingMode) => {
    setMode(m)
    setSampleType((prev) => pickTypes(m, prev))
    setSampleWarn(false)
  }

  const hasSelf = mode === 'self'
  const address = addresses.find((a) => a.id === addressId)!
  const site = sites.find((s) => s.id === siteId) ?? null
  const unsupported = rows.filter((r) => getSampleTypes(r.service.id, mode).length === 0)

  const submit = () => {
    if (unassigned.length > 0) {
      setAssignWarn(true)
      return
    }
    if (unsupported.length > 0 || (mode === 'site' && !site)) {
      setSampleWarn(true)
      return
    }
    if (!agreed) {
      setWarn(true)
      return
    }
    setPaying(true)
  }

  const makeOrderInfo = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return {
      orderNo: `JY${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${String(now.getTime()).slice(-6)}`,
      time: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    }
  }

  const paySuccess = () => {
    const info = makeOrderInfo()
    setPaidInfo((prev) => (prev ? { orderNo: prev.orderNo, time: info.time } : info))
    setPaying(false)
    setUnpaid(false)
    setOrderDetailOpen(false)
    setSubmitted(true)
    onSubmitted()
  }

  const payCancel = () => {
    setPaying(false)
    if (!unpaid) {
      setPaidInfo((prev) => prev ?? makeOrderInfo())
      setUnpaid(true)
      onSubmitted()
    }
  }

  const detailGroups = byMember.map((g) => ({
    id: g.member.id,
    name: g.member.name,
    items: g.items.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      sampleType: getSampleTypes(s.id, mode).find((t) => t.id === sampleType[s.id])?.label,
    })),
  }))

  if (unpaid && !submitted) {
    return (
      <Shell title="订单结果" onBack={onDone}>
        <div className="flex-1 overflow-y-auto px-3 pt-2.5 [scrollbar-width:none]">
          <section className="flex flex-col items-center rounded-2xl bg-white px-6 pb-6 pt-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft">
              <Clock3 className="size-8 text-[#d97706]" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <p className="mt-3 text-heading font-semibold text-foreground">订单未支付</p>
            <p className="mt-1 text-headline font-bold tabular-nums text-foreground">
              <span className="text-title">¥</span>
              {payable.toLocaleString('zh-CN')}
            </p>
            <p className="mt-2 text-caption leading-5 text-muted-foreground">
              订单已提交，请在 30 分钟内完成支付，超时订单将自动取消
            </p>
            <div className="mt-5 flex w-full gap-2.5">
              <button
                type="button"
                onClick={onDone}
                className="h-10 flex-1 rounded-full border border-border text-body text-foreground active:bg-muted"
              >
                返回检测
              </button>
              <button
                type="button"
                onClick={() => setOrderDetailOpen(true)}
                className="h-10 flex-1 rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
              >
                查看订单详情
              </button>
            </div>
          </section>

          <section aria-labelledby="unpaid-info" className="mt-2.5 rounded-2xl bg-white p-4">
            <h2 id="unpaid-info" className="text-title font-semibold text-foreground">
              订单信息
            </h2>
            <dl className="mt-2 flex flex-col gap-2 text-caption">
              {[
                ['订单编号', paidInfo?.orderNo ?? '-'],
                ['下单时间', paidInfo?.time ?? '-'],
                ['支付状态', '待付款'],
                ['采样方式', hasSelf ? `居家自采样 · ${address.name} ${address.phone}` : `定点采样 · ${site?.name ?? '-'}`],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-14 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 flex-1 text-right tabular-nums text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {byMember.map((g) => (
                <li key={g.member.id} className="flex items-start justify-between gap-3 text-caption">
                  <span className="shrink-0 font-medium text-foreground">{g.member.name}</span>
                  <span className="min-w-0 text-right text-muted-foreground">{g.items.map((s) => s.name).join('、')}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        {orderDetailOpen && (
          <OrderDetailScreen
            orderNo={paidInfo?.orderNo ?? '-'}
            payTime={paidInfo?.time ?? '-'}
            mode={mode}
            receiver={address}
            site={site ? { name: site.name, address: `${site.district} ${site.detail}`, time: site.time } : null}
            groups={detailGroups}
            goodsTotal={goodsTotal}
            couponOff={couponOff}
            couponName={coupon?.title}
            payable={payable}
            status="待付款"
            statusDesc="请在 30 分钟内完成支付，超时订单将自动取消"
            actions={
              <button
                type="button"
                onClick={() => setPaying(true)}
                className="h-7 rounded-full bg-primary px-3.5 text-caption font-medium text-primary-foreground"
              >
                继续支付
              </button>
            }
            onBack={() => setOrderDetailOpen(false)}
          />
        )}
        {paying && <WechatPaySheet amount={payable} onCancel={payCancel} onSuccess={paySuccess} />}
      </Shell>
    )
  }

  if (submitted) {
    const splitOrders = byMember.flatMap((g) => g.items.map((s) => ({ member: g.member, service: s })))
    const isSplit = splitOrders.length > 1
    const subOrderNo = (i: number) => `${paidInfo?.orderNo ?? '-'}-${String(i + 1).padStart(2, '0')}`
    const viewOrder = () => (isSplit ? setOrderListOpen(true) : setOrderDetailOpen(true))
    const couponShares = allocateCoupon(
      splitOrders.map((o) => o.service.price),
      couponOff,
    )
    const subOrders: Order[] = isSplit
      ? splitOrders.map((o, i) =>
          mode === 'site'
            ? {
                id: subOrderNo(i),
                parentId: paidInfo?.orderNo,
                type: 'site',
                phase: 'toSample',
                status: '待核销',
                product: o.service.name,
                examinees: o.member.name,
                ...splitPricing(o.service.price, couponShares[i]),
                note: `已支付，请前往 ${site?.name ?? '采样点'} 出示核销码`,
                action: { label: '核销码', primary: true },
              }
            : {
                id: subOrderNo(i),
                parentId: paidInfo?.orderNo,
                type: 'self',
                phase: 'toSample',
                status: '待发货',
                product: o.service.name,
                examinees: o.member.name,
                ...splitPricing(o.service.price, couponShares[i]),
                note: '已支付，实验室将在 24 小时内寄出采样盒',
                refund: 'cancel',
              },
        )
      : []
    return (
      <Shell title="订单结果" onBack={onDone}>
        <div className="flex-1 overflow-y-auto px-3 pt-2.5 [scrollbar-width:none]">
          <section className="flex flex-col items-center rounded-2xl bg-white px-6 pb-6 pt-8 text-center">
            <CircleCheck className="size-14 text-success" strokeWidth={1.6} aria-hidden="true" />
            <p className="mt-3 text-heading font-semibold text-foreground">支付成功</p>
            <p className="mt-1 text-headline font-bold tabular-nums text-foreground">
              <span className="text-title">¥</span>
              {payable.toLocaleString('zh-CN')}
            </p>
            <p className="mt-2 text-caption leading-5 text-muted-foreground">
              {hasSelf ? '采样盒将在 1–2 个工作日内寄出，请留意物流信息' : '请按预约时间前往采样点完成采样'}
            </p>
            <div className="mt-5 flex w-full gap-2.5">
              <button
                type="button"
                onClick={onDone}
                className="h-10 flex-1 rounded-full border border-border text-body text-foreground active:bg-muted"
              >
                返回检测
              </button>
              <button
                type="button"
                onClick={viewOrder}
                className="h-10 flex-1 rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
              >
                查看订单
              </button>
            </div>
          </section>

          <section aria-labelledby="order-info" className="mt-2.5 rounded-2xl bg-white p-4">
            <h2 id="order-info" className="text-title font-semibold text-foreground">
              订单信息
            </h2>
            <dl className="mt-2 flex flex-col gap-2 text-caption">
              {[
                ['订单编号', paidInfo?.orderNo ?? '-'],
                ['支付方式', '微信支付'],
                ['支付时间', paidInfo?.time ?? '-'],
                ['采样方式', hasSelf ? `居家自采样 · ${address.name} ${address.phone}` : `定点采样 · ${site?.name ?? '-'}`],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-14 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 flex-1 text-right tabular-nums text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            {isSplit ? (
              <div className="mt-3 border-t border-border pt-3">
                <p className="rounded-lg bg-background px-2.5 py-1.5 text-caption leading-4 text-muted-foreground">
                  本次合并支付已按检测人及检测项目拆分为 {splitOrders.length} 个订单，可在订单列表分别查看
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {splitOrders.map((o, i) => (
                    <li key={`${o.member.id}-${o.service.id}`} className="flex items-start justify-between gap-3 text-caption">
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground">
                          {o.member.name} · {o.service.name}
                        </span>
                        <span className="block tabular-nums text-muted-foreground">{subOrderNo(i)}</span>
                      </span>
                      <span className="shrink-0 text-right tabular-nums">
                        <span className="block text-foreground">
                          {formatYuan(Math.round((o.service.price - couponShares[i]) * 100) / 100)}
                        </span>
                        {couponShares[i] > 0 && (
                          <span className="block text-caption text-destructive">
                            分摊优惠 -{formatYuan(couponShares[i])}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                {byMember.map((g) => (
                  <li key={g.member.id} className="flex items-start justify-between gap-3 text-caption">
                    <span className="shrink-0 font-medium text-foreground">{g.member.name}</span>
                    <span className="min-w-0 text-right text-muted-foreground">{g.items.map((s) => s.name).join('、')}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {researchItems.length > 0 && (
            <section aria-labelledby="research-sign" className="mt-2.5 rounded-2xl bg-white p-4">
              <h2 id="research-sign" className="flex items-center gap-1.5 text-title font-semibold text-foreground">
                科研知情同意书
                <span className="rounded bg-secondary px-1 text-tag font-normal text-muted-foreground">自愿</span>
              </h2>
              <p className="mt-1 text-caption leading-4 text-muted-foreground">
                已向以下受检人发送签署短信，受检人点击短���中的链接完成 e签宝 人脸认证并签署后生效，签署进度可在「我的 → 授权与同意书」查看
              </p>
              <ul className="mt-2">
                {researchItems.map((it) => {
                  const resent = resentSms.includes(it.key)
                  return (
                    <li key={it.key} className="flex items-center gap-2 border-b border-border py-2.5 last:border-0">
                      <MessageSquareText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-note text-foreground">
                          {it.memberName}
                          <span className="rounded bg-warning-soft px-1 py-px text-tag text-[#d97706]">待受检人签署</span>
                        </p>
                        <p className="truncate text-caption text-muted-foreground">{it.serviceName} · 短信已发送</p>
                      </div>
                      <button
                        type="button"
                        disabled={resent}
                        onClick={() => setResentSms((s) => [...s, it.key])}
                        className="h-7 shrink-0 rounded-full border border-primary px-3 text-caption text-primary disabled:border-border disabled:text-muted-foreground"
                      >
                        {resent ? '已重新发送' : '重新发送'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <section aria-labelledby="next-steps" className="mt-2.5 rounded-2xl bg-white p-4">
            <h2 id="next-steps" className="text-title font-semibold text-foreground">
              接下来
            </h2>
            <ol className="mt-3 flex flex-col gap-3">
              {(hasSelf
                ? ['收到采样盒后，按说明采集唾液样本', '在小程序内绑定采样盒编号', '预约顺丰上门取件，免费寄回', '7 个工作日左右出具报告']
                : ['按预约时间前往采样点', '出示订单码完成采样', '7 个工作日左右出具报告']
              ).map((step, i) => (
                <li key={step} className="flex items-start gap-2.5 text-note leading-5 text-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary text-tag font-semibold text-primary">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
        {orderDetailOpen && (
          <OrderDetailScreen
            orderNo={paidInfo?.orderNo ?? '-'}
            payTime={paidInfo?.time ?? '-'}
            mode={mode}
            receiver={address}
            site={site ? { name: site.name, address: `${site.district} ${site.detail}`, time: site.time } : null}
            groups={byMember.map((g) => ({
              id: g.member.id,
              name: g.member.name,
              items: g.items.map((s) => ({
                id: s.id,
                name: s.name,
                price: s.price,
                sampleType: getSampleTypes(s.id, mode).find((t) => t.id === sampleType[s.id])?.label,
              })),
            }))}
            goodsTotal={goodsTotal}
            couponOff={couponOff}
            payable={payable}
            actions={
              mode === 'site' ? (
                <button
                  type="button"
                  onClick={() => setVerifyCodeOpen(true)}
                  className="h-7 rounded-full bg-primary px-3.5 text-caption font-medium text-primary-foreground"
                >
                  核销码
                </button>
              ) : undefined
            }
            onBack={() => setOrderDetailOpen(false)}
          />
        )}
        {orderDetailOpen && verifyCodeOpen && (
          <VerifyCodeSheet
            orderNo={paidInfo?.orderNo ?? '-'}
            product={byMember.flatMap((g) => g.items.map((s) => s.name)).join('、')}
            examinees={byMember.map((g) => g.member.name).join('、')}
            siteName={site?.name}
            onClose={() => setVerifyCodeOpen(false)}
          />
        )}
        {orderListOpen && (
          <OrderListScreen
            initialType={mode}
            initialTab="toUse"
            extraOrders={subOrders}
            onBack={() => setOrderListOpen(false)}
            onRefund={setRefundKind}
          />
        )}
        {refundKind === 'cancel' && <CancelOrderScreen onBack={() => setRefundKind(null)} />}
        {refundKind === 'shipped' && <ShippedRefundScreen onBack={() => setRefundKind(null)} />}
      </Shell>
    )
  }

  return (
    <Shell title="确认订单" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        <section aria-labelledby="sampling-title" className="rounded-2xl bg-white p-3.5">
          <h2 id="sampling-title" className="text-title font-semibold text-foreground">
            采样方式
          </h2>
          <div role="radiogroup" aria-labelledby="sampling-title" className="mt-2.5 grid grid-cols-2 gap-2">
            {samplingModes.map(({ key, icon: Icon, desc }) => {
              const on = mode === key
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => changeMode(key)}
                  className={cn(
                    'relative flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors',
                    on ? 'border-primary bg-secondary' : 'border-border bg-white',
                  )}
                >
                  <span className={cn('flex items-center gap-1.5 text-note font-medium', on ? 'text-primary' : 'text-foreground')}>
                    <Icon className="size-4" aria-hidden="true" />
                    {samplingLabel[key]}
                  </span>
                  <span className="mt-1 text-caption leading-4 text-muted-foreground">{desc}</span>
                  {on && (
                    <span
                      aria-hidden="true"
                      className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-bl-lg rounded-tr-xl bg-primary text-primary-foreground"
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            {hasSelf ? (
              <>
                <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
                  <Package className="size-3.5 text-primary" aria-hidden="true" />
                  采样套件邮寄地址
                </p>
                <button
                  type="button"
                  onClick={() => setSheet('address')}
                  aria-label={`采样套件邮寄地址：${address.detail}，点击更换`}
                  className="mt-2 flex w-full items-center gap-2 text-left"
                >
                  <MapPin className="size-4 shrink-0 self-start text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-note font-medium text-foreground">
                      {address.name}
                      <span className="ml-2 font-normal tabular-nums text-muted-foreground">{address.phone}</span>
                    </span>
                    <span className="mt-0.5 block text-caption leading-[18px] text-muted-foreground">{address.detail}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
                </button>
                <p className="mt-2.5 rounded-lg bg-background px-2.5 py-1.5 text-caption text-muted-foreground">
                  顺丰包邮寄送 · 采样后可预约免费上门取件
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
                  <Building2 className="size-3.5 text-primary" aria-hidden="true" />
                  定点采样机构
                </p>
                <button
                  type="button"
                  onClick={() => setSheet('site')}
                  className={cn(
                    'mt-2 flex w-full items-center gap-2 rounded-lg text-left',
                    sampleWarn && !site && 'bg-destructive-soft p-2',
                  )}
                >
                  {site ? (
                    <span className="min-w-0 flex-1">
                      <span className="block text-note font-medium text-foreground">{site.name}</span>
                      <span className="mt-0.5 block text-caption text-muted-foreground">
                        {site.district} {site.detail} · {site.distance} km
                      </span>
                      <span className="mt-0.5 block text-caption text-muted-foreground">{site.time}</span>
                    </span>
                  ) : (
                    <span className="flex-1 text-note text-muted-foreground">请选择就近的采样机构</span>
                  )}
                  <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
                </button>
                {sampleWarn && !site && (
                  <p role="alert" className="mt-1 text-caption text-destructive">
                    请选择定点采样机构
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <section aria-labelledby="goods-title" className="mt-2.5 rounded-2xl bg-white">
          <div className="flex items-center justify-between px-3.5 pt-3.5">
            <h2 id="goods-title" className="text-title font-semibold text-foreground">
              检测项目与受检人
            </h2>
            <button type="button" onClick={() => setExamineeForm({ serviceId: null })} className="text-caption text-primary">
              + 添加受检人
            </button>
          </div>
          <p className="px-3.5 pt-1 text-caption text-muted-foreground">每个项目可选多位受检人，一人一份，报告分别归档</p>
          <ul>
            {rows.map(({ service }) => {
              const selected = assign[service.id] ?? []
              const missing = assignWarn && selected.length === 0
              return (
                <li key={service.id} className="border-b border-border px-3.5 py-3 last:border-0">
                  <div className="flex gap-2.5">
                    <Image
                      src={service.image}
                      alt=""
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded-xl bg-secondary object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-1 text-note font-medium leading-[18px] text-foreground">{service.name}</p>
                      <p className="mt-0.5 text-caption text-muted-foreground">{service.turnaround}出报告</p>
                      <div className="mt-auto flex items-baseline justify-between">
                        <span className="text-body font-semibold text-foreground">
                          <span className="text-caption">¥</span>
                          {service.price}
                        </span>
                        <span className="text-caption tabular-nums text-muted-foreground">×{selected.length}</span>
                      </div>
                    </div>
                  </div>
                  <SampleTypePicker
                    serviceId={service.id}
                    serviceName={service.name}
                    mode={mode}
                    value={sampleType[service.id]}
                    warn={sampleWarn}
                    onChange={(id) => setSampleType((s) => ({ ...s, [service.id]: id }))}
                  />
                  <div
                    role="group"
                    aria-label={`${service.name}的受检人`}
                    className={cn('mt-2.5 flex flex-wrap gap-1.5 rounded-xl p-0.5', missing && 'bg-destructive-soft')}
                  >
                    {examinees.map((e) => {
                      const on = selected.includes(e.id)
                      return (
                        <button
                          key={e.id}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => toggleAssign(service.id, e.id)}
                          className={cn(
                            'flex h-7 items-center gap-1 rounded-full border px-2.5 text-caption transition-colors',
                            on ? 'border-primary bg-secondary text-primary' : 'border-border bg-white text-muted-foreground',
                          )}
                        >
                          {on ? (
                            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                          ) : (
                            <UserRound className="size-3" aria-hidden="true" />
                          )}
                          {e.name}
                          <span className="text-tag opacity-70">{e.relation}</span>
                        </button>
                      )
                    })}
                  </div>
                  {missing && (
                    <p role="alert" className="mt-1 text-caption text-destructive">
                      请至少选择一位受检人
                    </p>
                  )}
                  {selected.length > 0 && (
                    <div className="mt-2.5 rounded-xl bg-background px-3 py-2.5">
                      <p className="flex items-center gap-1 text-caption text-foreground">
                        科研授权
                        <span className="rounded bg-white px-1 py-px text-tag text-muted-foreground">可选</span>
                        <button
                          type="button"
                          onClick={() => setResearchDocOpen(true)}
                          className="ml-auto flex items-center text-caption text-primary"
                        >
                          《科研知情同意书》
                          <ChevronRight className="size-3" aria-hidden="true" />
                        </button>
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {examinees
                          .filter((e) => selected.includes(e.id))
                          .map((e) => {
                            const on = research[service.id]?.includes(e.id) ?? false
                            return (
                              <li key={e.id}>
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={on}
                                  onClick={() => toggleResearch(service.id, e.id)}
                                  className="flex w-full items-center gap-2 text-left"
                                >
                                  <span
                                    aria-hidden="true"
                                    className={cn(
                                      'flex size-4 shrink-0 items-center justify-center rounded border',
                                      on ? 'border-primary bg-primary text-primary-foreground' : 'border-faint/60 bg-white',
                                    )}
                                  >
                                    {on && <Check className="size-3" strokeWidth={3} />}
                                  </span>
                                  <span className="text-caption leading-[18px] text-muted-foreground">
                                    同意<span className="mx-0.5 font-medium text-foreground">{e.name}</span>的样本用于医学研究
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                      </ul>
                      <p className="mt-2 text-tag leading-4 text-muted-foreground">
                        选填，不影响检测；勾选后将发送短信给受检人，受检人通过短信内链接完成人脸认证与签署，可随时在「我的 → 授权与同意书」撤回
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-label="优惠券" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <button
            type="button"
            onClick={() => setCouponOpen(true)}
            className="flex h-12 w-full items-center gap-2 text-left"
          >
            <Ticket className="size-4 text-warning" aria-hidden="true" />
            <span className="text-note text-foreground">优惠券</span>
            <span className={cn('ml-auto text-note', coupon ? 'font-medium text-warning' : 'text-muted-foreground')}>
              {coupon ? `-¥${coupon.amount}` : usable.length ? `${usable.length} 张可用` : '暂无可用'}
            </span>
            <ChevronRight className="size-4 text-faint" aria-hidden="true" />
          </button>
        </section>

        <section aria-labelledby="price-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <h2 id="price-title" className="sr-only">
            价格明细
          </h2>
          <dl className="flex flex-col gap-2.5 text-note">
            <PriceRow label={`商品金额（共 ${qtyTotal} 份）`} value={`¥${goodsTotal.toLocaleString('zh-CN')}`} />
            {couponOff > 0 && <PriceRow label="优惠券" value={`-¥${couponOff}`} accent />}
            <PriceRow label="运费" value={hasSelf ? '包邮' : '¥0'} />
          </dl>
          <p className="mt-3 border-t border-border pt-3 text-right text-note text-foreground">
            小计
            <span className="ml-1 text-title font-bold tabular-nums text-foreground">
              <span className="text-caption">¥</span>
              {payable.toLocaleString('zh-CN')}
            </span>
          </p>
        </section>

        <section aria-labelledby="pay-title" className="mt-2.5 rounded-2xl bg-white px-3.5 pb-1 pt-3">
          <h2 id="pay-title" className="text-title font-semibold text-foreground">
            支付方式
          </h2>
          <div role="radiogroup" aria-labelledby="pay-title" className="mt-1 flex flex-col">
            {payMethods.map((p) => {
              const active = payMethod === p.key
              const Icon = p.icon
              return (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPayMethod(p.key)}
                  className="flex h-14 w-full items-center gap-3 border-b border-border text-left last:border-b-0"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-note text-foreground">
                      {p.label}
                      {p.tag && (
                        <span className="rounded bg-[#e8f7ee] px-1 py-px text-tag text-[#07a35a]">{p.tag}</span>
                      )}
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">{p.desc}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
                      active ? 'border-primary bg-primary text-primary-foreground' : 'border-faint/60 bg-white',
                    )}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <div className={cn('mt-3 flex items-start gap-2 rounded-xl px-1.5 py-1 transition-colors', warn && !agreed && 'bg-destructive-soft')}>
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            aria-label="已阅读并同意基因检测知情同意书"
            onClick={() => {
              setWarn(false)
              if (agreed) setAgreed(false)
              else setConsentOpen(true)
            }}
            className="-m-1 mt-px p-1"
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-4 items-center justify-center rounded-full border',
                agreed ? 'border-primary bg-primary text-primary-foreground' : 'border-faint/60 bg-white',
              )}
            >
              {agreed && <Check className="size-3" strokeWidth={3} />}
            </span>
          </button>
          <p className="text-caption leading-5 text-muted-foreground">
            我已阅读并同意
            <button type="button" onClick={() => setConsentOpen(true)} className="text-primary">
              《基因检测知情同意书》
            </button>
          </p>
        </div>
        {warn && !agreed && (
          <p role="alert" className="mt-1 px-1.5 text-caption text-destructive">
            请先点击阅读知情同意书（满 8 秒并滑动至底部）后同意
          </p>
        )}

        <p className="mt-3 flex items-center justify-center gap-1 text-caption text-faint">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          样本与基因数据加密存储，仅用于本次检测
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <div className="min-w-0">
          <p className="text-note text-foreground">
            实付
            <span className="ml-1 text-headline font-bold tabular-nums text-warning">
              <span className="text-note">¥</span>
              {payable.toLocaleString('zh-CN')}
            </span>
          </p>
          <p className="text-caption text-muted-foreground">
            {byMember.length} 位受检人 · 共 {qtyTotal} 份{couponOff > 0 ? ` · 已优惠 ¥${couponOff}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={submit}
          className="ml-auto h-10 min-w-[120px] rounded-full bg-primary px-6 text-body font-medium text-primary-foreground active:opacity-90"
        >
          提交订单
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        共 {qtyTotal} 份，实付 {payable} 元
      </p>

      {couponOpen && (
        <CouponSheet
          goodsTotal={goodsTotal}
          selected={couponId}
          onSelect={(id) => {
            setCouponId(id)
            setCouponOpen(false)
          }}
          onClose={() => setCouponOpen(false)}
        />
      )}

      {sheet === 'address' && (
        <PickerSheet
          title="选择邮寄地址"
          footer="+ 新增收货地址"
          items={addresses.map((a) => ({
            id: a.id,
            title: (
              <>
                {a.name}
                <span className="ml-2 font-normal tabular-nums text-muted-foreground">{a.phone}</span>
                {a.tag && (
                  <span className="ml-1.5 rounded bg-secondary px-1 text-tag font-normal text-primary">{a.tag}</span>
                )}
              </>
            ),
            lines: [a.detail],
          }))}
          selected={addressId}
          onSelect={(id) => {
            setAddressId(id)
            setSheet(null)
          }}
          onClose={() => setSheet(null)}
        />
      )}

      {consentOpen && (
        <ConsentReaderScreen
          onBack={() => setConsentOpen(false)}
          onAgree={() => {
            setAgreed(true)
            setWarn(false)
            setConsentOpen(false)
          }}
        />
      )}

      {researchDocOpen && <ResearchDocSheet onClose={() => setResearchDocOpen(false)} />}

      {paying && <WechatPaySheet amount={payable} onCancel={payCancel} onSuccess={paySuccess} />}

      {sheet === 'site' && (
        <SiteListScreen
          selected={siteId}
          onSelect={(id) => {
            setSiteId(id)
            setSampleWarn(false)
            setSheet(null)
          }}
          onBack={() => setSheet(null)}
        />
      )}

      {examineeForm && (
        <ExamineeFormScreen
          hasSelf={examinees.some((e) => e.relation === '本人')}
          targetName={rows.find((r) => r.service.id === examineeForm.serviceId)?.service.name}
          onBack={() => setExamineeForm(null)}
          onSave={addExaminee}
        />
      )}
    </Shell>
  )
}

function Shell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="absolute inset-0 z-20 flex flex-col bg-background motion-safe:animate-in motion-safe:slide-in-from-right"
    >
      <div className="shrink-0 bg-white">
        <StatusBar />
        <div className="relative flex h-11 items-center justify-center px-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className="absolute left-2 flex size-9 items-center justify-center rounded-full text-foreground"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <h1 id="checkout-title" className="text-heading font-semibold text-foreground">
            {title}
          </h1>
          <Capsule className="absolute right-3" />
        </div>
      </div>
      {children}
    </div>
  )
}

function SampleTypePicker({
  serviceId,
  serviceName,
  mode,
  value,
  warn,
  onChange,
}: {
  serviceId: string
  serviceName: string
  mode: SamplingMode
  value?: string
  warn: boolean
  onChange: (id: string) => void
}) {
  const all = getSampleTypes(serviceId)
  const opts = getSampleTypes(serviceId, mode)
  const current = opts.find((o) => o.id === value)

  if (opts.length === 0) {
    return (
      <p
        role={warn ? 'alert' : undefined}
        className={cn('mt-2.5 rounded-lg px-2.5 py-1.5 text-caption', warn ? 'bg-destructive-soft text-destructive' : 'bg-[#fff7ec] text-[#c27a1a]')}
      >
        该项目需采集{all.map((t) => t.label).join(' / ')}，仅支持{samplingLabel.site}
      </p>
    )
  }

  const labelId = `sample-${serviceId}`

  return (
    <div className="mt-2.5">
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors',
          warn && !current ? 'bg-destructive-soft' : 'bg-[#f5f7fb]',
        )}
      >
        <span id={labelId} className="flex shrink-0 items-center gap-1 text-caption text-muted-foreground">
          <FlaskConical className="size-3.5 text-primary" aria-hidden="true" />
          样本类型
        </span>
        {opts.length === 1 ? (
          <span className="ml-auto text-caption font-medium text-foreground">
            {opts[0].label}
            <span className="ml-1 font-normal text-muted-foreground">（{samplingLabel[mode]}仅支持）</span>
          </span>
        ) : (
          <div
            role="radiogroup"
            aria-labelledby={labelId}
            aria-label={`${serviceName}的样本类型`}
            className="ml-auto flex flex-wrap justify-end gap-1"
          >
            {opts.map((o) => {
              const on = o.id === value
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={o.hint}
                  onClick={() => onChange(o.id)}
                  className={cn(
                    'flex h-6 items-center gap-0.5 rounded-full border px-2 text-caption transition-colors',
                    on ? 'border-primary bg-white font-medium text-primary' : 'border-transparent bg-white text-foreground',
                  )}
                >
                  {on && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                  {o.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {warn && !current && (
        <p role="alert" className="mt-1 text-caption text-destructive">
          请选择样本类型
        </p>
      )}
    </div>
  )
}

function ResearchDocSheet({ onClose }: { onClose: () => void }) {
  const doc = researchDocs.sign
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button type="button" aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-doc-title"
        className="relative flex max-h-[78%] flex-col rounded-t-2xl bg-white motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <div className="flex h-12 shrink-0 items-center justify-center border-b border-border px-4">
          <h2 id="research-doc-title" className="text-title font-semibold text-foreground">
            《{doc.title}》
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-3 flex size-8 items-center justify-center rounded-full text-muted-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:none]">
          {doc.body.map((p) => (
            <p key={p} className="mb-2.5 text-note leading-6 text-foreground/80">
              {p}
            </p>
          ))}
          <p className="flex items-start gap-1.5 rounded-lg bg-background px-3 py-2 text-caption leading-[18px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
            此处仅供预览。勾选同意后，需在支付完成后通过 e签宝 人脸核验完成正式签署。
          </p>
        </div>
        <div className="shrink-0 px-4 pb-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}

type PickerItem = { id: string; title: React.ReactNode; aside?: string; lines: string[] }

function PickerSheet({
  title,
  items,
  selected,
  footer,
  onSelect,
  onClose,
}: {
  title: string
  items: PickerItem[]
  selected: string | null
  footer?: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button type="button" aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        className="relative max-h-[75%] overflow-y-auto rounded-t-2xl bg-background pb-6 [scrollbar-width:none] motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <div className="relative flex h-12 items-center justify-center">
          <h2 id="picker-title" className="text-title font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-3 flex size-8 items-center justify-center text-muted-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <ul role="radiogroup" aria-label={title} className="flex flex-col gap-2 px-3">
          {items.map((it) => {
            const active = it.id === selected
            return (
              <li key={it.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onSelect(it.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl border bg-white px-3 py-3 text-left',
                    active ? 'border-primary' : 'border-transparent',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center text-note font-medium text-foreground">
                      <span className="min-w-0 flex-1">{it.title}</span>
                      {it.aside && <span className="ml-2 shrink-0 text-caption font-normal text-muted-foreground">{it.aside}</span>}
                    </span>
                    {it.lines.map((l) => (
                      <span key={l} className="mt-0.5 block text-caption leading-[18px] text-muted-foreground">
                        {l}
                      </span>
                    ))}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
                      active ? 'border-primary bg-primary text-primary-foreground' : 'border-faint/60',
                    )}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {footer && (
          <div className="px-3 pt-3">
            <button type="button" className="h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground">
              {footer}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PriceRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('tabular-nums', accent ? 'text-warning' : 'text-foreground')}>{value}</dd>
    </div>
  )
}

function CouponSheet({
  goodsTotal,
  selected,
  onSelect,
  onClose,
}: {
  goodsTotal: number
  selected: string | null
  onSelect: (id: string | null) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button type="button" aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-title"
        className="relative rounded-t-2xl bg-background pb-6 motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <div className="relative flex h-12 items-center justify-center">
          <h2 id="coupon-title" className="text-title font-semibold text-foreground">
            选择优惠券
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-3 flex size-8 items-center justify-center text-muted-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <ul role="radiogroup" aria-label="优惠券" className="flex flex-col gap-2 px-3">
          {coupons.map((c) => {
            const ok = goodsTotal >= c.threshold
            const active = selected === c.id
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!ok}
                  onClick={() => onSelect(c.id)}
                  className="flex w-full overflow-hidden rounded-xl bg-white text-left disabled:opacity-50"
                >
                  <span className="flex w-[88px] shrink-0 flex-col items-center justify-center bg-warning-soft py-3 text-warning">
                    <span className="text-headline font-bold leading-none">
                      <span className="text-caption">¥</span>
                      {c.amount}
                    </span>
                    <span className="mt-1 text-tag">{c.threshold ? `满 ${c.threshold} 可用` : '无门槛'}</span>
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-2 px-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-note font-medium text-foreground">{c.title}</span>
                      <span className="mt-0.5 block text-caption text-muted-foreground">
                        {ok ? c.expire : `还差 ¥${c.threshold - goodsTotal} 可用`}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-primary bg-primary text-primary-foreground' : 'border-faint/60',
                      )}
                    >
                      {active && <Check className="size-3" strokeWidth={3} />}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="h-10 w-full rounded-full border border-border bg-white text-body text-foreground"
          >
            不使用优惠券
          </button>
        </div>
      </div>
    </div>
  )
}
