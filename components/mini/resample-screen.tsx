'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Ban,
  Check,
  CircleDollarSign,
  MapPin,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { IncurredFeeCard, useRefundSuccess, type IncurredFee } from '@/components/mini/refund-screen'
import { cn } from '@/lib/utils'

type Step = 'choose' | 'refund' | 'resample' | 'resampleDone'
type Choice = 'refund' | 'resample'

const defaultOrder = {
  no: 'DZ20261008153021',
  product: '药物基因检测',
  examinee: '李秀兰',
  mode: '自采样',
  paid: 897,
  reason: '样本 DNA 浓度不足，无法完成检测',
  notifiedAt: '2026-10-14 10:32',
}

export type ResampleOrder = typeof defaultOrder

const defaultNewOrderNo = 'DZ20261015092417'

const refundReasons = ['不想重新采样', '检测需求已变更', '等待时间过长', '其他原因'] as const

const unqualifiedFees: IncurredFee[] = [
  { label: '采样盒及耗材', desc: '已寄出的采样盒', amount: 80 },
  { label: '实验检测费用', desc: '已开展的 DNA 提取、质检等环节', amount: 150 },
]

const incurredTotal = unqualifiedFees.reduce((s, f) => s + f.amount, 0)

function OrderBrief({
  order,
  status,
  tone = 'warn',
}: {
  order: ResampleOrder
  status: string
  tone?: 'warn' | 'muted'
}) {
  return (
    <div className="rounded-2xl bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-caption tabular-nums text-muted-foreground">订单号 {order.no}</span>
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-caption font-medium',
            tone === 'warn' ? 'bg-warning-soft text-warning' : 'bg-[#eef1f5] text-muted-foreground',
          )}
        >
          {status}
        </span>
      </div>
      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <p className="text-body font-medium text-foreground">{order.product}</p>
          <p className="mt-0.5 text-caption text-muted-foreground">
            {order.examinee} · {order.mode}
          </p>
        </div>
        <p className="text-caption text-muted-foreground">
          实付 <span className="text-title font-semibold tabular-nums text-foreground">¥{order.paid}</span>
        </p>
      </div>
    </div>
  )
}

function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">{children}</div>
  )
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
      className="h-11 w-full rounded-full bg-primary text-title font-medium text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function ResampleScreen({
  onBack,
  initialStep = 'choose',
  order = defaultOrder,
  newOrderNo = defaultNewOrderNo,
  doneLabel = '返回我的',
  onResampled,
  onTerminated,
  onViewNewOrder,
}: {
  onBack: () => void
  initialStep?: Step
  order?: ResampleOrder
  newOrderNo?: string
  doneLabel?: string
  onResampled?: () => void
  onTerminated?: () => void
  onViewNewOrder?: () => void
}) {
  const refundAmount = Math.max(order.paid - incurredTotal, 0)
  const [step, setStep] = useState<Step>(initialStep)
  const [choice, setChoice] = useState<Choice | null>(null)
  const [refundReason, setRefundReason] = useState<string | null>(null)
  const [refundNote, setRefundNote] = useState('')
  const success = useRefundSuccess(onBack)

  const titles: Record<Step, string> = {
    choose: '样本不合格处理',
    refund: '终止订单并退款',
    resample: '确认重采样',
    resampleDone: '重采样结果',
  }

  const handleBack = () => {
    if (step === 'refund' || step === 'resample') setStep('choose')
    else onBack()
  }

  return (
    <SubPage title={titles[step]} titleId="resample-title" onBack={handleBack}>
      {step === 'choose' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <div className="rounded-2xl bg-warn-soft p-3.5">
              <p className="flex items-center gap-1.5 text-title font-semibold text-warning">
                <AlertTriangle className="size-4" aria-hidden="true" />
                样本检测不合格
              </p>
              <p className="mt-1.5 text-caption leading-relaxed text-foreground">原因：{order.reason}</p>
              <p className="mt-2 flex items-center gap-1 text-caption text-muted-foreground">
                <MessageSquareText className="size-3.5" aria-hidden="true" />
                已于 <span className="tabular-nums">{order.notifiedAt}</span> 短信通知您，请选择处理方式
              </p>
            </div>

            <OrderBrief order={order} status="样本不合格" />

            <fieldset className="rounded-2xl bg-white p-3.5">
              <legend className="float-left mb-3 text-title font-semibold text-foreground">请选择处理方式</legend>
              <div className="clear-both space-y-2.5">
                {(
                  [
                    {
                      key: 'resample',
                      icon: RotateCcw,
                      title: '同意重新采样',
                      tag: '推荐',
                      desc:
                        order.mode === '定点采样'
                          ? '原订单关闭，系统生成一笔新的待核销订单（标记为重采样），无需再次付款，到店出示核销码重新采样'
                          : '原订单关闭，系统生成一笔新的待发货订单（标记为重采样），无需再次付款，重新寄送采样盒',
                    },
                    {
                      key: 'refund',
                      icon: CircleDollarSign,
                      title: '终止订单并退款',
                      desc: '实验室停止检测，扣除已产生的各类费用后，剩余金额原路退回',
                    },
                  ] as const
                ).map((o) => {
                  const active = choice === o.key
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
                        name="resample-choice"
                        value={o.key}
                        checked={active}
                        onChange={() => setChoice(o.key)}
                        className="sr-only"
                      />
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <o.icon className="size-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-body font-medium text-foreground">
                          {o.title}
                          {'tag' in o && (
                            <span className="rounded bg-[#e6f6ec] px-1.5 py-0.5 text-tag text-success">{o.tag}</span>
                          )}
                        </span>
                        <span className="mt-1 block text-caption leading-relaxed text-muted-foreground">{o.desc}</span>
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
          </div>
          <BottomBar>
            <PrimaryButton disabled={!choice} onClick={() => choice && setStep(choice)}>
              下一步
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'resample' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <div className="rounded-2xl bg-white p-3.5">
              <h2 className="text-title font-semibold text-foreground">重采样说明</h2>
              <ul className="mt-2.5 space-y-2 text-caption leading-relaxed text-foreground">
                <li className="flex gap-2">
                  <Ban className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  原订单 <span className="tabular-nums">{order.no}</span> 将被关闭
                </li>
                <li className="flex gap-2">
                  <RotateCcw className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  系统自动生成一笔新的{order.mode === '定点采样' ? '待核销' : '待发货'}订单，标记为「重采样」，无需再次支付
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
                  新订单沿用原受检人、检测项目及已签署的知情同意书
                </li>
              </ul>
            </div>

            {order.mode !== '定点采样' && (
            <div className="rounded-2xl bg-white p-3.5">
              <h2 className="text-title font-semibold text-foreground">采样盒寄送地址</h2>
              <button type="button" className="mt-2.5 flex w-full items-start gap-2.5 text-left">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-note font-medium text-foreground">
                    李秀兰 <span className="tabular-nums font-normal text-muted-foreground">138****6688</span>
                  </span>
                  <span className="mt-0.5 block text-caption leading-relaxed text-muted-foreground">
                    上海市浦东新区张江路 1388 号 3 栋 1202 室
                  </span>
                </span>
                <span className="text-caption text-primary">修改</span>
              </button>
            </div>
            )}
          </div>
          <BottomBar>
            <PrimaryButton
              onClick={() => {
                onResampled?.()
                setStep('resampleDone')
              }}
            >
              同意重新采样
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'refund' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <OrderBrief order={order} status="样本不合格" />

            <fieldset className="rounded-2xl bg-white p-3.5">
              <legend className="float-left mb-2.5 text-title font-semibold text-foreground">退款原因</legend>
              <div className="clear-both flex flex-wrap gap-2">
                {refundReasons.map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'cursor-pointer rounded-full border px-3 py-1.5 text-caption transition-colors',
                      refundReason === r
                        ? 'border-primary bg-[#f3f8ff] font-medium text-primary'
                        : 'border-border text-foreground',
                    )}
                  >
                    <input
                      type="radio"
                      name="refund-reason"
                      value={r}
                      checked={refundReason === r}
                      onChange={() => setRefundReason(r)}
                      className="sr-only"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="rounded-2xl bg-white p-3.5">
              <label htmlFor="refund-note" className="text-title font-semibold text-foreground">
                补充说明 <span className="text-caption font-normal text-muted-foreground">选填</span>
              </label>
              <textarea
                id="refund-note"
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="请描述退款原因，便于客服审核"
                className="mt-2 w-full resize-none rounded-xl bg-muted p-2.5 text-note text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <p className="text-right text-caption tabular-nums text-muted-foreground">{refundNote.length}/200</p>
            </div>

            <IncurredFeeCard paid={order.paid} fees={unqualifiedFees} />
          </div>
          <BottomBar>
            <PrimaryButton
              disabled={!refundReason}
              onClick={() => {
                onTerminated?.()
                success.show(refundAmount)
              }}
            >
              确认终止并退款 ¥{refundAmount}
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'resampleDone' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <div className="rounded-2xl bg-white p-4 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <RotateCcw className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-2.5 text-title font-semibold text-foreground">已为您生成重采样订单</p>
              <p className="mt-1 text-caption text-muted-foreground">
                {order.mode === '定点采样'
                  ? '请前往采样机构出示核销码重新采样'
                  : '新的采样盒将尽快寄出，请留意物流信息'}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="rounded bg-warning-soft px-1.5 py-0.5 text-tag font-medium text-warning">重采样</span>
                  <span className="text-caption tabular-nums text-muted-foreground">订单号 {newOrderNo}</span>
                </span>
                <span className="rounded bg-secondary px-1.5 py-0.5 text-caption font-medium text-primary">
                  {order.mode === '定点采样' ? '待核销' : '待发货'}
                </span>
              </div>
              <div className="mt-2.5 flex items-end justify-between">
                <div>
                  <p className="text-body font-medium text-foreground">{order.product}</p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {order.examinee} · {order.mode}
                  </p>
                </div>
                <p className="text-caption text-muted-foreground">
                  已付款 <span className="text-title font-semibold tabular-nums text-foreground">¥0</span>
                </p>
              </div>
              <p className="mt-2 border-t border-border pt-2 text-caption text-muted-foreground">
                关联原订单 <span className="tabular-nums">{order.no}</span>
              </p>
            </div>

            <OrderBrief order={order} status="已关闭" tone="muted" />
          </div>
          <BottomBar>
            <PrimaryButton onClick={onViewNewOrder ?? onBack}>查看新订单</PrimaryButton>
          </BottomBar>
        </>
      )}
      {success.toast}
    </SubPage>
  )
}
