'use client'

import { useState } from 'react'
import {
  Check,
  CircleDollarSign,
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
  status: '已发货',
  tracking: '顺丰 SF1407 3382 9015',
}

const returnAddress = {
  name: '都正医学检验实验室 售后组',
  phone: '021-6058 8899',
  address: '上海市浦东新区张江高科技园区蔡伦路 780 号 5 楼',
}

type RefundOption = 'return' | 'deduct'
type Step = 'choose' | 'return' | 'deduct' | 'done'

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl bg-white p-3.5', className)}>{children}</div>
}

function BottomBar({ children }: { children: React.ReactNode }) {
  return <div className="shrink-0 border-t border-[#eef2f8] bg-white px-4 pb-6 pt-2.5">{children}</div>
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
      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function OrderBrief({ no, product, examinee, paid, status }: { no: string; product: string; examinee: string; paid: number; status: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-[12px] tabular-nums text-muted-foreground">订单号 {no}</span>
        <span className="rounded bg-[#eef5ff] px-1.5 py-0.5 text-[11px] font-medium text-primary">{status}</span>
      </div>
      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <p className="text-[14px] font-medium text-foreground">{product}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">受检人：{examinee}</p>
        </div>
        <p className="text-[12px] text-muted-foreground">
          实付 <span className="text-[15px] font-semibold tabular-nums text-foreground">¥{paid}</span>
        </p>
      </div>
    </Card>
  )
}

function AmountRows({ rows }: { rows: { label: string; value: string; strong?: boolean; minus?: boolean }[] }) {
  return (
    <dl className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between text-[13px]">
          <dt className={r.strong ? 'font-medium text-foreground' : 'text-muted-foreground'}>{r.label}</dt>
          <dd
            className={cn(
              'tabular-nums',
              r.strong ? 'text-[17px] font-semibold text-[#e0651c]' : r.minus ? 'text-[#e0651c]' : 'text-foreground',
            )}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Timeline({ items }: { items: { title: string; desc: string; state: 'done' | 'current' | 'todo' }[] }) {
  return (
    <ol>
      {items.map((it, i) => (
        <li key={it.title} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full',
                it.state === 'done' && 'bg-primary text-primary-foreground',
                it.state === 'current' && 'bg-primary text-primary-foreground ring-4 ring-primary/15',
                it.state === 'todo' && 'border border-[#d4dce8] bg-white',
              )}
            >
              {it.state === 'done' && <Check className="size-3" aria-hidden="true" />}
              {it.state === 'current' && <span className="size-1.5 rounded-full bg-white" />}
            </span>
            {i < items.length - 1 && <span className="w-px flex-1 bg-[#e3eaf4]" aria-hidden="true" />}
          </div>
          <div className="pb-4">
            <p className={cn('text-[13px] font-medium', it.state === 'todo' ? 'text-muted-foreground' : 'text-foreground')}>
              {it.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{it.desc}</p>
          </div>
        </li>
      ))}
    </ol>
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

  const selected = options.find((o) => o.key === option)
  const titles: Record<Step, string> = {
    choose: '申请退款',
    return: '寄回采样盒',
    deduct: '确认退款',
    done: '退款申请详情',
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
                <Truck className="size-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-foreground">采样盒已发出</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {shippedOrder.tracking}，请选择退款方式
                </p>
              </div>
            </div>

            <OrderBrief {...shippedOrder} />

            <fieldset className="rounded-2xl bg-white p-3.5">
              <legend className="float-left mb-3 text-[15px] font-semibold text-foreground">退款方式</legend>
              <div className="clear-both space-y-2.5">
                {options.map((o) => {
                  const active = option === o.key
                  return (
                    <label
                      key={o.key}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors',
                        active ? 'border-primary bg-[#f3f8ff]' : 'border-[#e6ecf4]',
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
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-primary">
                        <o.icon className="size-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
                          {o.title}
                          <span className="rounded bg-[#e6f6ec] px-1.5 py-0.5 text-[10px] text-[#1f8a4c]">{o.tag}</span>
                        </span>
                        <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">{o.desc}</span>
                        <span className="mt-1.5 block text-[12px] text-muted-foreground">
                          预计退款{' '}
                          <span className="text-[15px] font-semibold tabular-nums text-[#e0651c]">¥{o.amount}</span>
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

            <p className="flex gap-1.5 px-1 text-[11px] leading-relaxed text-muted-foreground">
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
                <h2 className="text-[15px] font-semibold text-foreground">寄回地址</h2>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex items-center gap-1 text-[12px] text-primary"
                >
                  {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="mt-2.5 flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">
                    {returnAddress.name}{' '}
                    <span className="font-normal tabular-nums text-muted-foreground">{returnAddress.phone}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{returnAddress.address}</p>
                </div>
              </div>
            </Card>

            <Card>
              <label htmlFor="return-tracking" className="text-[15px] font-semibold text-foreground">
                回寄快递单号
              </label>
              <input
                id="return-tracking"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value.replace(/[^\w\s-]/g, '').slice(0, 30))}
                placeholder="寄出后填写快递单号"
                className="mt-2 h-10 w-full rounded-xl bg-[#f6f8fc] px-3 text-[13px] tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <ul className="mt-2.5 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
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
            <PrimaryButton disabled={trackingNo.trim().length < 6} onClick={() => setStep('done')}>
              提交退款申请
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'deduct' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <OrderBrief {...shippedOrder} />
            <Card>
              <h2 className="mb-3 text-[15px] font-semibold text-foreground">退款金额</h2>
              <AmountRows
                rows={[
                  { label: '实付金额', value: `¥${shippedOrder.paid}` },
                  { label: '扣除采样盒费用', value: `-¥${KIT_FEE}`, minus: true },
                  { label: '实际退款', value: `¥${shippedOrder.paid - KIT_FEE}`, strong: true },
                ]}
              />
            </Card>
            <p className="flex gap-1.5 px-1 text-[11px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              采样盒无需寄回，可自行处理。提交后订单关闭，退款原路退回至微信支付账户。
            </p>
          </div>
          <BottomBar>
            <PrimaryButton onClick={() => setStep('done')}>确认退款 ¥{shippedOrder.paid - KIT_FEE}</PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'done' && selected && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <Card className="p-4 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fff1e6] text-[#e0651c]">
                <CircleDollarSign className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-2.5 text-[16px] font-semibold text-foreground">退款申请已提交</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {option === 'return' ? '实验室签收采样盒后' : '审核通过后'}将退款{' '}
                <span className="font-medium tabular-nums text-[#e0651c]">¥{selected.amount}</span>
              </p>
            </Card>
            <Card>
              <h2 className="mb-3 text-[15px] font-semibold text-foreground">退款进度</h2>
              <Timeline
                items={
                  option === 'return'
                    ? [
                        { title: '提交退款申请', desc: `自费寄回 · 快递单号 ${trackingNo}`, state: 'done' },
                        { title: '采样盒回寄中', desc: '实验室签收并确认采样盒完好', state: 'current' },
                        { title: '全额退款到账', desc: `¥${selected.amount} 原路退回至微信支付账户`, state: 'todo' },
                      ]
                    : [
                        { title: '提交退款申请', desc: `扣除采样盒费用 ¥${KIT_FEE}`, state: 'done' },
                        { title: '审核中', desc: '预计 1 个工作日内完成', state: 'current' },
                        { title: '退款到账', desc: `¥${selected.amount} 原路退回至微信支付账户`, state: 'todo' },
                      ]
                }
              />
            </Card>
            <OrderBrief {...shippedOrder} status="退款中" />
          </div>
          <BottomBar>
            <PrimaryButton onClick={onBack}>返回订单</PrimaryButton>
          </BottomBar>
        </>
      )}
    </SubPage>
  )
}

const resampleOrder = {
  no: 'DZ20261009011',
  product: '药物基因检测',
  examinee: '李秀兰',
  paid: 999,
  status: '重采样 · 已收样',
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
      <h2 className="text-[15px] font-semibold text-foreground">已产生费用</h2>
      <ul className="mt-2.5 divide-y divide-[#eef2f8]">
        {fees.map((f) => (
          <li key={f.label} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
            <div className="min-w-0">
              <p className="text-[13px] text-foreground">{f.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{f.desc}</p>
            </div>
            <span className="shrink-0 text-[13px] tabular-nums text-[#e0651c]">-¥{f.amount}</span>
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
  const [done, setDone] = useState(false)
  const refund = resampleOrder.paid - resampleFees.reduce((s, f) => s + f.amount, 0)

  if (done) {
    return (
      <SubPage title="退款详情" titleId="resample-refund-title" onBack={onBack}>
        <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
          <Card className="p-4 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fff1e6] text-[#e0651c]">
              <CircleDollarSign className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-2.5 text-[16px] font-semibold text-foreground">订单已终止</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              扣除已产生费用后将退款 <span className="font-medium tabular-nums text-[#e0651c]">¥{refund}</span>
            </p>
          </Card>
          <Card>
            <h2 className="mb-3 text-[15px] font-semibold text-foreground">退款进度</h2>
            <Timeline
              items={[
                { title: '终止检测', desc: '实验室已停止检测，订单关闭', state: 'done' },
                { title: '退款处理中', desc: '预计 1-3 个工作日内完成', state: 'current' },
                { title: '退款到账', desc: `¥${refund} 原路退回至微信支付账户`, state: 'todo' },
              ]}
            />
          </Card>
          <OrderBrief {...resampleOrder} status="已关闭" />
        </div>
        <BottomBar>
          <PrimaryButton onClick={onBack}>返回订单</PrimaryButton>
        </BottomBar>
      </SubPage>
    )
  }

  return (
    <SubPage title="终止订单并退款" titleId="resample-refund-title" onBack={onBack}>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
        <div className="flex gap-2.5 rounded-2xl bg-warn-soft p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#e0651c]">
            <Receipt className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[#c2541a]">需扣除已产生的各类费用</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              样本已进入重采样流程，终止后实验室停止检测，剩余金额原路退回。
            </p>
          </div>
        </div>

        <OrderBrief {...resampleOrder} />
        <IncurredFeeCard paid={resampleOrder.paid} fees={resampleFees} />

        <button
          type="button"
          onClick={onContact}
          className="flex w-full items-center justify-center gap-1 py-1 text-[12px] text-primary"
        >
          <Headphones className="size-3.5" aria-hidden="true" />
          对费用有疑问？联系客服
        </button>
      </div>
      <BottomBar>
        <PrimaryButton onClick={() => setDone(true)}>确认终止并退款 ¥{refund}</PrimaryButton>
      </BottomBar>
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

export function CancelOrderScreen({ onBack }: { onBack: () => void }) {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <SubPage title="退款详情" titleId="cancel-order-title" onBack={onBack}>
        <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
          <Card className="p-4 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e6f6ec] text-[#1f8a4c]">
              <Check className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-2.5 text-[16px] font-semibold text-foreground">订单已取消</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              <span className="font-medium tabular-nums text-[#e0651c]">¥{pendingOrder.paid}</span> 将全额原路退回
            </p>
          </Card>
          <Card>
            <h2 className="mb-3 text-[15px] font-semibold text-foreground">退款进度</h2>
            <Timeline
              items={[
                { title: '取消订单', desc: '采样盒尚未发货，订单已直接取消', state: 'done' },
                { title: '退款处理中', desc: '无需审核，系统自动发起退款', state: 'current' },
                { title: '退款到账', desc: '预计 1-3 个工作日退回至微信支付账户', state: 'todo' },
              ]}
            />
          </Card>
          <OrderBrief {...pendingOrder} status="已取消" />
        </div>
        <BottomBar>
          <PrimaryButton onClick={onBack}>返回订单</PrimaryButton>
        </BottomBar>
      </SubPage>
    )
  }

  return <CancelConfirmDialog paid={pendingOrder.paid} onCancel={onBack} onConfirm={() => setDone(true)} />
}

function CancelConfirmDialog({
  paid,
  onCancel,
  onConfirm,
}: {
  paid: number
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
          <h2 id="cancel-confirm-title" className="text-[16px] font-semibold text-foreground">
            确定取消该订单吗？
          </h2>
          <div id="cancel-confirm-desc" className="mt-2 space-y-1 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              取消后 <span className="font-medium tabular-nums text-[#e0651c]">¥{paid}</span> 将全额原路退回
            </p>
            <p>订单取消后不可恢复，如需检测请重新下单</p>
          </div>
        </div>
        <div className="flex border-t border-[#eef2f8]">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="h-12 flex-1 text-[15px] text-foreground"
          >
            再想想
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 border-l border-[#eef2f8] text-[15px] font-medium text-[#e5484d]"
          >
            确认取消
          </button>
        </div>
      </div>
    </div>
  )
}
