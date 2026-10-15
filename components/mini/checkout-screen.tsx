'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  MapPin,
  Package,
  ShieldCheck,
  Ticket,
  UserRound,
  X,
} from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { samplingLabel, testServices, type TestService } from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

export type CheckoutLine = { id: string; qty: number }

const examinees = [
  { id: 'self', name: '王建国', relation: '本人', meta: '男 · 58岁' },
  { id: 'spouse', name: '李秀兰', relation: '配偶', meta: '女 · 56岁' },
  { id: 'child', name: '王小米', relation: '子女', meta: '女 · 8岁' },
]

const address = {
  name: '王建国',
  phone: '138****6721',
  detail: '浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1206',
}

const samplingSite = {
  name: '杭州市第一人民医院 · 检验科',
  detail: '上城区浣纱路 261 号 · 门诊楼 2 层',
  time: '周一至周六 08:00–16:30',
}

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

  const [assign, setAssign] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      rows.map((r) => [r.service.id, examinees.slice(0, Math.min(Math.max(r.line.qty, 1), examinees.length)).map((e) => e.id)]),
    ),
  )

  const toggleAssign = (serviceId: string, memberId: string) => {
    setAssign((a) => {
      const cur = a[serviceId] ?? []
      const next = cur.includes(memberId) ? cur.filter((x) => x !== memberId) : [...cur, memberId]
      return { ...a, [serviceId]: examinees.map((e) => e.id).filter((id) => next.includes(id)) }
    })
    setAssignWarn(false)
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
  const [remark, setRemark] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [warn, setWarn] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const coupon = usable.find((c) => c.id === couponId) ?? null
  const couponOff = coupon?.amount ?? 0
  const payable = Math.max(goodsTotal - couponOff, 0)
  const hasSelf = rows.some((r) => r.service.sampling === 'self')
  const hasSite = rows.some((r) => r.service.sampling === 'site')

  const submit = () => {
    if (unassigned.length > 0) {
      setAssignWarn(true)
      return
    }
    if (!agreed) {
      setWarn(true)
      return
    }
    setSubmitted(true)
    onSubmitted()
  }

  if (submitted) {
    return (
      <Shell title="支付结果" onBack={onDone}>
        <div className="flex-1 overflow-y-auto px-3 pt-2.5 [scrollbar-width:none]">
          <section className="flex flex-col items-center rounded-2xl bg-white px-6 pb-6 pt-8 text-center">
            <CircleCheck className="size-14 text-[#2fb57a]" strokeWidth={1.6} aria-hidden="true" />
            <p className="mt-3 text-[17px] font-semibold text-foreground">支付成功</p>
            <p className="mt-1 text-[24px] font-bold tabular-nums text-foreground">
              <span className="text-[15px]">¥</span>
              {payable.toLocaleString('zh-CN')}
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              {hasSelf ? '采样盒将在 1–2 个工作日内寄出，请留意物流信息' : '请在预约时间前往采样点完成采样'}
            </p>
            <div className="mt-5 flex w-full gap-2.5">
              <button
                type="button"
                onClick={onDone}
                className="h-10 flex-1 rounded-full border border-border text-[14px] text-foreground active:bg-[#f2f5fa]"
              >
                返回检测
              </button>
              <button
                type="button"
                onClick={onDone}
                className="h-10 flex-1 rounded-full bg-primary text-[14px] font-medium text-primary-foreground active:opacity-90"
              >
                查看订单
              </button>
            </div>
          </section>

          <section aria-labelledby="next-steps" className="mt-2.5 rounded-2xl bg-white p-4">
            <h2 id="next-steps" className="text-[14px] font-semibold text-foreground">
              接下来
            </h2>
            <ol className="mt-3 flex flex-col gap-3">
              {(hasSelf
                ? ['收到采样盒后，按说明采集口腔拭子', '在小程序内绑定采样盒编号', '预约顺丰上门取件，免费寄回', '7 个工作日左右出具报告']
                : ['按预约时间前往采样点', '出示订单码完成采样', '7 个工作日左右出具报告']
              ).map((step, i) => (
                <li key={step} className="flex items-start gap-2.5 text-[13px] leading-5 text-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#e8f1fe] text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </Shell>
    )
  }

  return (
    <Shell title="确认订单" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        <section aria-labelledby="goods-title" className="rounded-2xl bg-white">
          <div className="flex items-center justify-between px-3.5 pt-3.5">
            <h2 id="goods-title" className="text-[14px] font-semibold text-foreground">
              检测项目与受检人
            </h2>
            <button type="button" className="text-[12px] text-primary">
              + 添加受检人
            </button>
          </div>
          <p className="px-3.5 pt-1 text-[11px] text-muted-foreground">每个项目可选多位受检人，一人一份，报告分别归档</p>
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
                      className="size-14 shrink-0 rounded-xl bg-[#eef4fd] object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-1 text-[13px] font-medium leading-[18px] text-foreground">{service.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {samplingLabel[service.sampling]} · {service.turnaround}出报告
                      </p>
                      <div className="mt-auto flex items-baseline justify-between">
                        <span className="text-[14px] font-semibold text-foreground">
                          <span className="text-[11px]">¥</span>
                          {service.price}
                        </span>
                        <span className="text-[12px] tabular-nums text-muted-foreground">×{selected.length}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    role="group"
                    aria-label={`${service.name}的受检人`}
                    className={cn('mt-2.5 flex flex-wrap gap-1.5 rounded-xl p-0.5', missing && 'bg-[#fff1ec]')}
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
                            'flex h-7 items-center gap-1 rounded-full border px-2.5 text-[12px] transition-colors',
                            on ? 'border-primary bg-[#eef5ff] text-primary' : 'border-border bg-white text-muted-foreground',
                          )}
                        >
                          {on ? (
                            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                          ) : (
                            <UserRound className="size-3" aria-hidden="true" />
                          )}
                          {e.name}
                          <span className="text-[10px] opacity-70">{e.relation}</span>
                        </button>
                      )
                    })}
                  </div>
                  {missing && (
                    <p role="alert" className="mt-1 text-[11px] text-[#e5603a]">
                      请至少选择一位受检人
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {byMember.length > 0 && (
          <section aria-labelledby="member-sum-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
            <h2 id="member-sum-title" className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
              <UserRound className="size-4 text-primary" aria-hidden="true" />
              按受检人汇总
            </h2>
            <ul className="mt-2.5 flex flex-col gap-2">
              {byMember.map(({ member, items }) => (
                <li key={member.id} className="rounded-xl bg-[#f4f8fe] px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-foreground">{member.name}</span>
                    <span className="rounded bg-white px-1 text-[10px] text-muted-foreground">{member.relation}</span>
                    <span className="text-[11px] text-muted-foreground">{member.meta}</span>
                    <span className="ml-auto text-[11px] tabular-nums text-primary">{items.length} 项</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-[18px] text-muted-foreground">
                    {items.map((s) => s.name).join('、')}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasSelf && (
          <section aria-labelledby="address-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
            <h2 id="address-title" className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
              <Package className="size-4 text-primary" aria-hidden="true" />
              采样盒寄送地址
            </h2>
            <button type="button" className="mt-2.5 flex w-full items-center gap-2 text-left">
              <MapPin className="size-4 shrink-0 self-start text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-foreground">
                  {address.name}
                  <span className="ml-2 font-normal tabular-nums text-muted-foreground">{address.phone}</span>
                </span>
                <span className="mt-0.5 block text-[12px] leading-[18px] text-muted-foreground">{address.detail}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-[#b8c2d6]" aria-hidden="true" />
            </button>
            <p className="mt-2.5 rounded-lg bg-[#f4f8fe] px-2.5 py-1.5 text-[11px] text-muted-foreground">
              顺丰包邮寄送 · 采样后可预约免费上门取件
            </p>
          </section>
        )}

        {hasSite && (
          <section aria-labelledby="site-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
            <h2 id="site-title" className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              定点采样机构
            </h2>
            <button type="button" className="mt-2.5 flex w-full items-center gap-2 text-left">
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-foreground">{samplingSite.name}</span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">{samplingSite.detail}</span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">{samplingSite.time}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-[#b8c2d6]" aria-hidden="true" />
            </button>
          </section>
        )}

        <section aria-label="优惠与备注" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <button
            type="button"
            onClick={() => setCouponOpen(true)}
            className="flex h-12 w-full items-center gap-2 border-b border-border text-left"
          >
            <Ticket className="size-4 text-[#f07a2c]" aria-hidden="true" />
            <span className="text-[13px] text-foreground">优惠券</span>
            <span className={cn('ml-auto text-[13px]', coupon ? 'font-medium text-[#f07a2c]' : 'text-muted-foreground')}>
              {coupon ? `-¥${coupon.amount}` : usable.length ? `${usable.length} 张可用` : '暂无可用'}
            </span>
            <ChevronRight className="size-4 text-[#b8c2d6]" aria-hidden="true" />
          </button>
          <label className="flex h-12 items-center gap-3">
            <span className="shrink-0 text-[13px] text-foreground">订单备注</span>
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value.slice(0, 50))}
              placeholder="选填，如期望的配送时间"
              className="min-w-0 flex-1 bg-transparent text-right text-[13px] text-foreground outline-none placeholder:text-[#a9b3c6]"
            />
          </label>
        </section>

        <section aria-labelledby="price-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <h2 id="price-title" className="sr-only">
            价格明细
          </h2>
          <dl className="flex flex-col gap-2.5 text-[13px]">
            <PriceRow label={`商品金额（共 ${qtyTotal} 份）`} value={`¥${goodsTotal.toLocaleString('zh-CN')}`} />
            {couponOff > 0 && <PriceRow label="优惠券" value={`-¥${couponOff}`} accent />}
            <PriceRow label="运费" value={hasSelf ? '包邮' : '¥0'} />
          </dl>
          <p className="mt-3 border-t border-border pt-3 text-right text-[13px] text-foreground">
            小计
            <span className="ml-1 text-[16px] font-bold tabular-nums text-foreground">
              <span className="text-[12px]">¥</span>
              {payable.toLocaleString('zh-CN')}
            </span>
          </p>
        </section>

        <div className={cn('mt-3 flex items-start gap-2 rounded-xl px-1.5 py-1 transition-colors', warn && !agreed && 'bg-[#fff1ec]')}>
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            aria-label="已阅读并同意检测知情同意书与隐私保护协议"
            onClick={() => {
              setAgreed((a) => !a)
              setWarn(false)
            }}
            className="-m-1 mt-px p-1"
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-4 items-center justify-center rounded-full border',
                agreed ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c3ccdb] bg-white',
              )}
            >
              {agreed && <Check className="size-2.5" strokeWidth={3} />}
            </span>
          </button>
          <p className="text-[12px] leading-5 text-muted-foreground">
            我已阅读并同意
            <a href="#" className="text-primary">
              《基因检测知情同意书》
            </a>
            <a href="#" className="text-primary">
              《个人信息与样本隐私保护协议》
            </a>
          </p>
        </div>
        {warn && !agreed && (
          <p role="alert" className="mt-1 px-1.5 text-[11px] text-[#e5603a]">
            请先阅读并勾选同意协议
          </p>
        )}

        <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-[#a9b3c6]">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          样本与基因数据加密存储，仅用于本次检测
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <div className="min-w-0">
          <p className="text-[13px] text-foreground">
            实付
            <span className="ml-1 text-[20px] font-bold tabular-nums text-[#f07a2c]">
              <span className="text-[13px]">¥</span>
              {payable.toLocaleString('zh-CN')}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {byMember.length} 位受检人 · 共 {qtyTotal} 份{couponOff > 0 ? ` · 已优惠 ¥${couponOff}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={submit}
          className="ml-auto h-10 min-w-[120px] rounded-full bg-primary px-6 text-[14px] font-medium text-primary-foreground active:opacity-90"
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
    </Shell>
  )
}

function Shell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="absolute inset-0 z-20 flex flex-col bg-[#f4f8fe] motion-safe:animate-in motion-safe:slide-in-from-right"
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
          <h1 id="checkout-title" className="text-[17px] font-semibold text-foreground">
            {title}
          </h1>
          <Capsule className="absolute right-3" />
        </div>
      </div>
      {children}
    </div>
  )
}

function PriceRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('tabular-nums', accent ? 'text-[#f07a2c]' : 'text-foreground')}>{value}</dd>
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
        className="relative rounded-t-2xl bg-[#f4f8fe] pb-6 motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <div className="relative flex h-12 items-center justify-center">
          <h2 id="coupon-title" className="text-[15px] font-semibold text-foreground">
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
                  <span className="flex w-[88px] shrink-0 flex-col items-center justify-center bg-[#fff4ec] py-3 text-[#f07a2c]">
                    <span className="text-[20px] font-bold leading-none">
                      <span className="text-[12px]">¥</span>
                      {c.amount}
                    </span>
                    <span className="mt-1 text-[10px]">{c.threshold ? `满 ${c.threshold} 可用` : '无门槛'}</span>
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-2 px-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-foreground">{c.title}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {ok ? c.expire : `还差 ¥${c.threshold - goodsTotal} 可用`}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-[#f07a2c] bg-[#f07a2c] text-white' : 'border-[#c3ccdb]',
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
            className="h-10 w-full rounded-full border border-border bg-white text-[14px] text-foreground"
          >
            不使用优惠券
          </button>
        </div>
      </div>
    </div>
  )
}
