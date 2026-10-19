'use client'

import { useState } from 'react'
import {
  Check,
  Copy,
  Headphones,
  Info,
  MapPin,
  Package,
  PackageOpen,
  Receipt,
  RotateCcw,
  Truck,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

const KIT_FEE = 80

const shippedOrder = {
  no: 'DZ20261013008',
  product: '心血管用药基因检测',
  examinee: '王建国',
  paid: 899,
  status: '待收货',
  tracking: '顺丰 SF1407 3382 9015',
}

const returnAddress = {
  name: '都正医学检验实验室 售后组',
  phone: '021-6058 8899',
  address: '上海市浦东新区张江高科技园区蔡伦路 780 号 5 楼',
}

type RefundOption = 'return' | 'deduct'
type Step = 'choose' | 'return' | 'deduct'

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl bg-white p-3.5', className)}>{children}</div>
}

function BottomBar({ children }: { children: React.ReactNode }) {
  return <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">{children}</div>
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-title font-medium text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function useRefundSuccess(onFinish: () => void) {
  const [amount, setAmount] = useState<number | null>(null)
  const show = (refund: number) => {
    if (amount !== null) return
    setAmount(refund)
    setTimeout(onFinish, 1500)
  }
  const toast =
    amount === null ? null : (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10" role="status" aria-live="polite">
        <div className="flex w-52 flex-col items-center rounded-2xl bg-[#1f2a3d]/90 px-5 py-4 text-center text-white">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
            <Check className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-2 text-title font-semibold">退款成功</p>
          <p className="mt-1 text-caption leading-relaxed text-white/75">
            <span className="tabular-nums">¥{amount}</span> 将原路退回至微信支付账户
          </p>
        </div>
      </div>
    )
  return { show, toast }
}

function OrderBrief({ no, product, examinee, paid, status }: { no: string; product: string; examinee: string; paid: number; status: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-caption tabular-nums text-muted-foreground">订单号 {no}</span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-caption font-medium text-primary">{status}</span>
      </div>
      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <p className="text-body font-medium text-foreground">{product}</p>
          <p className="mt-0.5 text-caption text-muted-foreground">受检人：{examinee}</p>
        </div>
        <p className="text-caption text-muted-foreground">
          实付 <span className="text-title font-semibold tabular-nums text-foreground">¥{paid}</span>
        </p>
      </div>
    </Card>
  )
}

function AmountRows({ rows }: { rows: { label: string; value: string; strong?: boolean; minus?: boolean }[] }) {
  return (
    <dl className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between text-note">
          <dt className={r.strong ? 'font-medium text-foreground' : 'text-muted-foreground'}>{r.label}</dt>
          <dd
            className={cn(
              'tabular-nums',
              r.strong ? 'text-heading font-semibold text-warning' : r.minus ? 'text-warning' : 'text-foreground',
            )}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const options = [
  {
    key: 'return' as const,
    icon: RotateCcw,
    title: '自费寄回采样盒',
    tag: '全额退款',
    amount: shippedOrder.paid,
    desc: '收到采样盒后，未拆封自费寄回实验室，签收确认后全额退款',
  },
  {
    key: 'deduct' as const,
    icon: Receipt,
    title: '扣除采样盒费用退款',
    tag: '无需寄回',
    amount: shippedOrder.paid - KIT_FEE,
    desc: `采样盒无需寄回，扣除采样盒费用 ¥${KIT_FEE} 后退款`,
  },
]

export function ShippedRefundScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>('choose')
  const [option, setOption] = useState<RefundOption | null>(null)
  const [trackingNo, setTrackingNo] = useState('')
  const [copied, setCopied] = useState(false)
  const success = useRefundSuccess(onBack)

  const titles: Record<Step, string> = {
    choose: '申请退款',
    return: '寄回采样盒',
    deduct: '确认退款',
  }

  const handleBack = () => {
    if (step === 'return' || step === 'deduct') setStep('choose')
    else onBack()
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${returnAddress.name} ${returnAddress.phone} ${returnAddress.address}`)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <SubPage title={titles[step]} titleId="refund-title" onBack={handleBack}>
      {step === 'choose' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <div className="flex gap-2.5 rounded-2xl bg-brand-soft p-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                <Truck className="size-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-body font-semibold text-foreground">采样盒已发出</p>
                <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
                  {shippedOrder.tracking}，请选择退款方式
                </p>
              </div>
            </div>

            <OrderBrief {...shippedOrder} />

            <fieldset className="rounded-2xl bg-white p-3.5">
              <legend className="float-left mb-3 text-title font-semibold text-foreground">退款方式</legend>
              <div className="clear-both space-y-2.5">
                {options.map((o) => {
                  const active = option === o.key
                  return (
                    <label
                      key={o.key}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors',
                        active ? 'border-primary bg-[#f3f8ff]' : 'border-border',
                      )}
                    >
                      <input
                        type="radio"
                        name="refund-option"
                        value={o.key}
                        checked={active}
                        onChange={() => setOption(o.key)}
                        className="sr-only"
                      />
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <o.icon className="size-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-body font-medium text-foreground">
                          {o.title}
                          <span className="rounded bg-[#e6f6ec] px-1.5 py-0.5 text-tag text-success">{o.tag}</span>
                        </span>
                        <span className="mt-1 block text-caption leading-relaxed text-muted-foreground">{o.desc}</span>
                        <span className="mt-1.5 block text-caption text-muted-foreground">
                          预计退款{' '}
                          <span className="text-title font-semibold tabular-nums text-warning">¥{o.amount}</span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                          active ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c9d3e0]',
                        )}
                        aria-hidden="true"
                      >
                        {active && <Check className="size-3" />}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <p className="flex gap-1.5 px-1 text-caption leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              寄回运费由您自行承担；采样盒已拆封或缺损的，仅支持扣除采样盒费用后退款。
            </p>
          </div>
          <BottomBar>
            <PrimaryButton disabled={!option} onClick={() => option && setStep(option)}>
              下一步
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'return' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-title font-semibold text-foreground">寄回地址</h2>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex items-center gap-1 text-caption text-primary"
                >
                  {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="mt-2.5 flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-note font-medium text-foreground">
                    {returnAddress.name}{' '}
                    <span className="font-normal tabular-nums text-muted-foreground">{returnAddress.phone}</span>
                  </p>
                  <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">{returnAddress.address}</p>
                </div>
              </div>
            </Card>

            <Card>
              <label htmlFor="return-tracking" className="text-title font-semibold text-foreground">
                回寄快递单号
              </label>
              <input
                id="return-tracking"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value.replace(/[^\w\s-]/g, '').slice(0, 30))}
                placeholder="寄出后填写快递单号"
                className="mt-2 h-10 w-full rounded-xl bg-muted px-3 text-note tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <ul className="mt-2.5 space-y-1.5 text-caption leading-relaxed text-muted-foreground">
                <li className="flex gap-1.5">
                  <PackageOpen className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  采样盒需保持未拆封、配件齐全
                </li>
                <li className="flex gap-1.5">
                  <Package className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  运费自理，请勿使用到付
                </li>
              </ul>
            </Card>

            <Card>
              <AmountRows
                rows={[
                  { label: '实付金额', value: `¥${shippedOrder.paid}` },
                  { label: '退款金额', value: `¥${shippedOrder.paid}`, strong: true },
                ]}
              />
            </Card>
          </div>
          <BottomBar>
            <PrimaryButton disabled={trackingNo.trim().length < 6} onClick={() => success.show(shippedOrder.paid)}>
              确认退款 ¥{shippedOrder.paid}
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'deduct' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <OrderBrief {...shippedOrder} />
            <Card>
              <h2 className="mb-3 text-title font-semibold text-foreground">退款金额</h2>
              <AmountRows
                rows={[
                  { label: '实付金额', value: `¥${shippedOrder.paid}` },
                  { label: '扣除采样盒费用', value: `-¥${KIT_FEE}`, minus: true },
                  { label: '实际退款', value: `¥${shippedOrder.paid - KIT_FEE}`, strong: true },
                ]}
              />
            </Card>
            <p className="flex gap-1.5 px-1 text-caption leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              采样盒无需寄回，可自行处理。提交后订单关闭，退款原路退回至微信支付账户。
            </p>
          </div>
          <BottomBar>
            <PrimaryButton onClick={() => success.show(shippedOrder.paid - KIT_FEE)}>
              确认退款 ¥{shippedOrder.paid - KIT_FEE}
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {success.toast}
    </SubPage>
  )
}

const resampleOrder = {
  no: 'DZ20261009011',
  product: '药物基因检测',
  examinee: '李秀兰',
  paid: 999,
  status: '重采样 · 待检测',
}

export type IncurredFee = { label: string; desc: string; amount: number }

const resampleFees: IncurredFee[] = [
  { label: '采样盒及耗材（2 次）', desc: '首次采样盒 + 重采样采样盒', amount: KIT_FEE * 2 },
  { label: '物流费用', desc: '采样盒寄送及样本回寄（2 次）', amount: 60 },
  { label: '实验检测费用', desc: '已开展的 DNA 提取、质检等环节', amount: 150 },
]

export function IncurredFeeCard({ paid, fees }: { paid: number; fees: IncurredFee[] }) {
  const total = fees.reduce((s, f) => s + f.amount, 0)
  return (
    <Card>
      <h2 className="text-title font-semibold text-foreground">已产生费用</h2>
      <ul className="mt-2.5 divide-y divide-[#eef2f8]">
        {fees.map((f) => (
          <li key={f.label} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
            <div className="min-w-0">
              <p className="text-note text-foreground">{f.label}</p>
              <p className="mt-0.5 text-caption text-muted-foreground">{f.desc}</p>
            </div>
            <span className="shrink-0 text-note tabular-nums text-warning">-¥{f.amount}</span>
          </li>
        ))}
      </ul>
      <div className="mt-1 border-t border-dashed border-[#e3eaf4] pt-3">
        <AmountRows
          rows={[
            { label: '实付金额', value: `¥${paid}` },
            { label: '扣除费用合计', value: `-¥${total}`, minus: true },
            { label: '实际退款', value: `¥${paid - total}`, strong: true },
          ]}
        />
      </div>
    </Card>
  )
}

export function ResampleRefundScreen({ onBack, onContact }: { onBack: () => void; onContact: () => void }) {
  const refund = resampleOrder.paid - resampleFees.reduce((s, f) => s + f.amount, 0)
  const success = useRefundSuccess(onBack)

  return (
    <SubPage title="终止订单并退款" titleId="resample-refund-title" onBack={onBack}>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
        <div className="flex gap-2.5 rounded-2xl bg-warn-soft p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-warning">
            <Receipt className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-body font-semibold text-warning">需扣除已产生的各类费用</p>
            <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
              样本已进入重采样流程，终止后实验室停止检测，剩余金额原路退回。
            </p>
          </div>
        </div>

        <OrderBrief {...resampleOrder} />
        <IncurredFeeCard paid={resampleOrder.paid} fees={resampleFees} />

        <button
          type="button"
          onClick={onContact}
          className="flex w-full items-center justify-center gap-1 py-1 text-caption text-primary"
        >
          <Headphones className="size-3.5" aria-hidden="true" />
          对费用有疑问？联系客服
        </button>
      </div>
      <BottomBar>
        <PrimaryButton onClick={() => success.show(refund)}>确认终止并退款 ¥{refund}</PrimaryButton>
      </BottomBar>
      {success.toast}
    </SubPage>
  )
}

export type TestingRefundOrder = {
  no: string
  product: string
  examinee: string
  paid: number
  status: string
  type: 'self' | 'site'
}

const testingRefundReasons = ['不想检测了', '已在其他机构检测', '检测周期太长', '信息填写有误', '其他原因']

function testingFees(o: TestingRefundOrder): IncurredFee[] {
  const fees: IncurredFee[] =
    o.type === 'self'
      ? [
          { label: '采样盒及耗材', desc: '已寄出并使用的采样盒', amount: KIT_FEE },
          { label: '物流费用', desc: '采样盒寄送及样本回寄', amount: 30 },
        ]
      : [{ label: '采样服务费', desc: '采样机构现场采样及样本寄送', amount: 100 }]
  if (o.status === '待检测' || o.status === '检测中') {
    fees.push({ label: '样本处理费用', desc: '实验室签收、登记及 DNA 提取', amount: 100 })
  }
  if (o.status === '检测中') {
    fees.push({ label: '实验检测费用', desc: '已开展的上机检测环节', amount: 300 })
  }
  return fees
}

export function TestingRefundScreen({
  order,
  onBack,
  onContact,
  onSubmitted,
}: {
  order: TestingRefundOrder
  onBack: () => void
  onContact?: () => void
  onSubmitted?: () => void
}) {
  const [reason, setReason] = useState<string | null>(null)
  const fees = testingFees(order)
  const refund = Math.max(order.paid - fees.reduce((s, f) => s + f.amount, 0), 0)
  const success = useRefundSuccess(() => {
    onSubmitted?.()
    onBack()
  })

  return (
    <SubPage title="申请退款" titleId="testing-refund-title" onBack={onBack}>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
        <div className="flex gap-2.5 rounded-2xl bg-warn-soft p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-warning">
            <Receipt className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-body font-semibold text-warning">需扣除已产生的费用</p>
            <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
              订单当前为「{order.status}」，确认退款后实验室将停止检测并销毁样本，剩余金额原路退回。
            </p>
          </div>
        </div>

        <OrderBrief {...order} />

        <Card>
          <h2 className="text-title font-semibold text-foreground">退款原因</h2>
          <div role="radiogroup" aria-label="退款原因" className="mt-2.5 flex flex-wrap gap-2">
            {testingRefundReasons.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(r)}
                className={cn(
                  'h-8 rounded-full border px-3 text-caption transition-colors',
                  reason === r
                    ? 'border-primary bg-primary/10 font-medium text-primary'
                    : 'border-border text-foreground',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </Card>

        <IncurredFeeCard paid={order.paid} fees={fees} />

        <p className="flex gap-1.5 px-1 text-caption leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          确认后无需等待审核，订单关闭，退款金额原路退回至微信支付账户。
        </p>
        {onContact && (
          <button
            type="button"
            onClick={onContact}
            className="flex w-full items-center justify-center gap-1 py-1 text-caption text-primary"
          >
            <Headphones className="size-3.5" aria-hidden="true" />
            对费用有疑问？联系客服
          </button>
        )}
      </div>
      <BottomBar>
        <PrimaryButton disabled={!reason} onClick={() => success.show(refund)}>
          确认退款 ¥{refund}
        </PrimaryButton>
      </BottomBar>
      {success.toast}
    </SubPage>
  )
}

const pendingOrder = {
  no: 'DZ20261015016',
  product: '个体化用药基因检测 · 全面版',
  examinee: '王建国',
  paid: 1299,
  status: '待发货',
}

export function CancelOrderScreen({
  onBack,
  onCancelled,
  paid = pendingOrder.paid,
  unpaid = false,
}: {
  onBack: () => void
  onCancelled?: () => void
  paid?: number
  unpaid?: boolean
}) {
  return <CancelConfirmDialog paid={paid} unpaid={unpaid} onCancel={onBack} onConfirm={onCancelled ?? onBack} />
}

function CancelConfirmDialog({
  paid,
  unpaid,
  onCancel,
  onConfirm,
}: {
  paid: number
  unpaid: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-8 motion-safe:animate-in motion-safe:fade-in"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-confirm-title"
        aria-describedby="cancel-confirm-desc"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        className="w-full overflow-hidden rounded-2xl bg-white motion-safe:animate-in motion-safe:zoom-in-95"
      >
        <div className="px-5 pb-4 pt-5 text-center">
          <h2 id="cancel-confirm-title" className="text-title font-semibold text-foreground">
            确定取消该订单吗？
          </h2>
          <div id="cancel-confirm-desc" className="mt-2 space-y-1 text-note leading-relaxed text-muted-foreground">
            {unpaid ? (
              <p>该订单尚未支付，取消后订单将关闭</p>
            ) : (
              <p>
                取消后 <span className="font-medium tabular-nums text-warning">¥{paid}</span> 将全额原路退回
              </p>
            )}
            <p>订单取消后不可恢复，如需检测请重新下单</p>
          </div>
        </div>
        <div className="flex border-t border-border">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="h-12 flex-1 text-title text-foreground"
          >
            再想想
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 border-l border-border text-title font-medium text-[#e5484d]"
          >
            确认取消
          </button>
        </div>
      </div>
    </div>
  )
}
