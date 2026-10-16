'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  FlaskConical,
  House,
  MapPin,
  Package,
  ShieldCheck,
  Ticket,
  UserRound,
  Wallet,
  X,
} from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { ConsentReaderScreen } from '@/components/mini/consent-reader-screen'
import { ExamineeFormScreen } from '@/components/mini/examinee-form-screen'
import { SiteListScreen } from '@/components/mini/site-list-screen'
import { ResearchSignFlow } from '@/components/mini/research-sign-flow'

type ResearchItem = { key: string; memberName: string; serviceName: string }
import { examineeMeta, initialExaminees, sites, type Examinee } from '@/components/mini/checkout-data'
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

const payMethods: { key: PayMethod; label: string; desc: string; tag?: string; icon: typeof House; color: string }[] = [
  { key: 'wechat', label: '微信支付', desc: '使用微信零钱或绑定银行卡支付', icon: Wallet, color: '#07c160' },
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
  const [research, setResearch] = useState<Record<string, string[]>>({})
  const toggleResearch = (serviceId: string, memberId: string) =>
    setResearch((r) => {
      const cur = r[serviceId] ?? []
      return { ...r, [serviceId]: cur.includes(memberId) ? cur.filter((x) => x !== memberId) : [...cur, memberId] }
    })
  const [warn, setWarn] = useState(false)
  const [payMethod, setPayMethod] = useState<PayMethod>('wechat')
  const [submitted, setSubmitted] = useState(false)
  const [signedResearch, setSignedResearch] = useState<string[]>([])
  const [signing, setSigning] = useState<ResearchItem | null>(null)
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
    setSubmitted(true)
    onSubmitted()
  }

  if (submitted) {
    return (
      <Shell title="支付结果" onBack={onDone}>
        <div className="flex-1 overflow-y-auto px-3 pt-2.5 [scrollbar-width:none]">
          <section className="flex flex-col items-center rounded-2xl bg-white px-6 pb-6 pt-8 text-center">
            <CircleCheck className="size-14 text-[#1f9d6b]" strokeWidth={1.6} aria-hidden="true" />
            <p className="mt-3 text-[17px] font-semibold text-foreground">支付成功</p>
            <p className="mt-1 text-[24px] font-bold tabular-nums text-foreground">
              <span className="text-[15px]">¥</span>
              {payable.toLocaleString('zh-CN')}
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              {hasSelf ? '采样盒将在 1–2 个工作日内寄出，请留意物流信息' : '请按预约时间前往采样点完成采样'}
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

          {researchItems.length > 0 && (
            <section aria-labelledby="research-sign" className="mt-2.5 rounded-2xl bg-white p-4">
              <h2 id="research-sign" className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
                科研知情同意书
                <span className="rounded bg-secondary px-1 text-[10px] font-normal text-[#8a94a6]">自愿</span>
              </h2>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                下单时已勾选以下授权，需通过 e签宝 人脸核验后生效；也可稍后在「我的 → 授权与同意书」签署
              </p>
              <ul className="mt-2">
                {researchItems.map((it) => {
                  const done = signedResearch.includes(it.key)
                  return (
                    <li key={it.key} className="flex items-center gap-2 border-b border-border py-2.5 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-foreground">{it.memberName}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{it.serviceName}</p>
                      </div>
                      {done ? (
                        <span className="rounded bg-[#e6f7ef] px-1.5 py-px text-[11px] text-[#1f9d6b]">已签署</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSigning(it)}
                          className="h-7 shrink-0 rounded-full bg-primary px-3 text-[12px] text-primary-foreground"
                        >
                          去签署
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <section aria-labelledby="next-steps" className="mt-2.5 rounded-2xl bg-white p-4">
            <h2 id="next-steps" className="text-[14px] font-semibold text-foreground">
              接下来
            </h2>
            <ol className="mt-3 flex flex-col gap-3">
              {(hasSelf
                ? ['收到采样盒后，按说明采集唾液样本', '在小程序内绑定采样盒编号', '预约顺丰上门取件，免费寄回', '7 个工作日左右出具报告']
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
        {signing && (
          <ResearchSignFlow
            action="sign"
            memberName={signing.memberName}
            serviceName={signing.serviceName}
            orderNo="GX20261015021"
            onClose={() => setSigning(null)}
            onDone={() => {
              setSignedResearch((s) => [...s, signing.key])
              setSigning(null)
            }}
          />
        )}
      </Shell>
    )
  }

  return (
    <Shell title="确认订单" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        <section aria-labelledby="sampling-title" className="rounded-2xl bg-white p-3.5">
          <h2 id="sampling-title" className="text-[14px] font-semibold text-foreground">
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
                    on ? 'border-primary bg-[#eef5ff]' : 'border-border bg-white',
                  )}
                >
                  <span className={cn('flex items-center gap-1.5 text-[13px] font-medium', on ? 'text-primary' : 'text-foreground')}>
                    <Icon className="size-4" aria-hidden="true" />
                    {samplingLabel[key]}
                  </span>
                  <span className="mt-1 text-[11px] leading-4 text-muted-foreground">{desc}</span>
                  {on && (
                    <span
                      aria-hidden="true"
                      className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-bl-lg rounded-tr-xl bg-primary text-primary-foreground"
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            {hasSelf ? (
              <>
                <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
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
              </>
            ) : (
              <>
                <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Building2 className="size-3.5 text-primary" aria-hidden="true" />
                  定点采样机构
                </p>
                <button
                  type="button"
                  onClick={() => setSheet('site')}
                  className={cn(
                    'mt-2 flex w-full items-center gap-2 rounded-lg text-left',
                    sampleWarn && !site && 'bg-[#fff1ec] p-2',
                  )}
                >
                  {site ? (
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-foreground">{site.name}</span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">
                        {site.district} {site.detail} · {site.distance} km
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{site.time}</span>
                    </span>
                  ) : (
                    <span className="flex-1 text-[13px] text-muted-foreground">请选择就近的采样机构</span>
                  )}
                  <ChevronRight className="size-4 shrink-0 text-[#b8c2d6]" aria-hidden="true" />
                </button>
                {sampleWarn && !site && (
                  <p role="alert" className="mt-1 text-[11px] text-[#e5603a]">
                    请选择定点采样机构
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        <section aria-labelledby="goods-title" className="mt-2.5 rounded-2xl bg-white">
          <div className="flex items-center justify-between px-3.5 pt-3.5">
            <h2 id="goods-title" className="text-[14px] font-semibold text-foreground">
              检测项目与受检人
            </h2>
            <button type="button" onClick={() => setExamineeForm({ serviceId: null })} className="text-[12px] text-primary">
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
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{service.turnaround}出报告</p>
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
                  {selected.length > 0 && (
                    <div className="mt-2.5 rounded-xl bg-[#f4f8fe] px-3 py-2.5">
                      <p className="flex items-center gap-1 text-[12px] text-foreground">
                        科研授权
                        <span className="rounded bg-white px-1 py-px text-[10px] text-[#8a94a6]">可选</span>
                        <a href="#" className="ml-auto text-[11px] text-primary">
                          《科研知情同意书》
                        </a>
                      </p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#a9b3c6]">
                        勾选后可在支付结果页或「授权与同意书」完成人脸核验签署
                      </p>
                      <ul className="mt-1.5 flex flex-col gap-1.5">
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
                                      on ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c3ccdb] bg-white',
                                    )}
                                  >
                                    {on && <Check className="size-2.5" strokeWidth={3} />}
                                  </span>
                                  <span className="text-[12px] leading-[18px] text-muted-foreground">
                                    同意<span className="mx-0.5 font-medium text-foreground">{e.name}</span>的样本用于医学研究
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                      </ul>
                      <p className="mt-1.5 text-[10px] leading-4 text-[#a9b3c6]">
                        不勾选不影响检测，可在「我的 → 授权与同意书」中签署或撤回
                      </p>
                    </div>
                  )}
                  <SampleTypePicker
                    serviceId={service.id}
                    serviceName={service.name}
                    mode={mode}
                    value={sampleType[service.id]}
                    warn={sampleWarn}
                    onChange={(id) => setSampleType((s) => ({ ...s, [service.id]: id }))}
                  />
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
                    <span className="text-[11px] text-muted-foreground">{examineeMeta(member)}</span>
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

        <section aria-label="优惠券" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <button
            type="button"
            onClick={() => setCouponOpen(true)}
            className="flex h-12 w-full items-center gap-2 text-left"
          >
            <Ticket className="size-4 text-[#e0651c]" aria-hidden="true" />
            <span className="text-[13px] text-foreground">优惠券</span>
            <span className={cn('ml-auto text-[13px]', coupon ? 'font-medium text-[#e0651c]' : 'text-muted-foreground')}>
              {coupon ? `-¥${coupon.amount}` : usable.length ? `${usable.length} 张可用` : '暂无可用'}
            </span>
            <ChevronRight className="size-4 text-[#b8c2d6]" aria-hidden="true" />
          </button>
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

        <section aria-labelledby="pay-title" className="mt-2.5 rounded-2xl bg-white px-3.5 pb-1 pt-3">
          <h2 id="pay-title" className="text-[14px] font-semibold text-foreground">
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
                    <span className="flex items-center gap-1.5 text-[13px] text-foreground">
                      {p.label}
                      {p.tag && (
                        <span className="rounded bg-[#e8f7ee] px-1 py-px text-[10px] text-[#07a35a]">{p.tag}</span>
                      )}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">{p.desc}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
                      active ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c3ccdb] bg-white',
                    )}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <div className={cn('mt-3 flex items-start gap-2 rounded-xl px-1.5 py-1 transition-colors', warn && !agreed && 'bg-[#fff1ec]')}>
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
                agreed ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c3ccdb] bg-white',
              )}
            >
              {agreed && <Check className="size-2.5" strokeWidth={3} />}
            </span>
          </button>
          <p className="text-[12px] leading-5 text-muted-foreground">
            我已阅读并同意
            <button type="button" onClick={() => setConsentOpen(true)} className="text-primary">
              《基因检测知情同意书》
            </button>
          </p>
        </div>
        {warn && !agreed && (
          <p role="alert" className="mt-1 px-1.5 text-[11px] text-[#e5603a]">
            请先点击阅读知情同意书（满 8 秒并滑动至底部）后同意
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
            <span className="ml-1 text-[20px] font-bold tabular-nums text-[#e0651c]">
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
                  <span className="ml-1.5 rounded bg-[#eef5ff] px-1 text-[10px] font-normal text-primary">{a.tag}</span>
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
        className={cn('mt-2.5 rounded-lg px-2.5 py-1.5 text-[11px]', warn ? 'bg-[#fff1ec] text-[#e5603a]' : 'bg-[#fff7ec] text-[#c27a1a]')}
      >
        该项目需采集{all.map((t) => t.label).join(' / ')}，仅支持{samplingLabel.site}
      </p>
    )
  }

  return (
    <div className="mt-2.5 flex items-start gap-2">
      <span className="flex h-7 shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
        <FlaskConical className="size-3.5" aria-hidden="true" />
        样本类型
      </span>
      <div className="min-w-0 flex-1">
        <div role="radiogroup" aria-label={`${serviceName}的样本类型`} className="flex flex-wrap gap-1.5">
          {opts.map((o) => {
            const on = o.id === value
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(o.id)}
                className={cn(
                  'h-7 rounded-md border px-2.5 text-[12px] transition-colors',
                  on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-[#f7f9fc] text-foreground',
                )}
              >
                {o.label}
              </button>
            )
          })}
        </div>
        {current && <p className="mt-1 text-[11px] text-muted-foreground">{current.hint}</p>}
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
        className="relative max-h-[75%] overflow-y-auto rounded-t-2xl bg-[#f4f8fe] pb-6 [scrollbar-width:none] motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <div className="relative flex h-12 items-center justify-center">
          <h2 id="picker-title" className="text-[15px] font-semibold text-foreground">
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
                    <span className="flex items-center text-[13px] font-medium text-foreground">
                      <span className="min-w-0 flex-1">{it.title}</span>
                      {it.aside && <span className="ml-2 shrink-0 text-[11px] font-normal text-muted-foreground">{it.aside}</span>}
                    </span>
                    {it.lines.map((l) => (
                      <span key={l} className="mt-0.5 block text-[12px] leading-[18px] text-muted-foreground">
                        {l}
                      </span>
                    ))}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
                      active ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c3ccdb]',
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
            <button type="button" className="h-10 w-full rounded-full bg-primary text-[14px] font-medium text-primary-foreground">
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
      <dd className={cn('tabular-nums', accent ? 'text-[#e0651c]' : 'text-foreground')}>{value}</dd>
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
                  <span className="flex w-[88px] shrink-0 flex-col items-center justify-center bg-[#fff4ec] py-3 text-[#e0651c]">
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
                        active ? 'border-[#e0651c] bg-[#e0651c] text-white' : 'border-[#c3ccdb]',
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
