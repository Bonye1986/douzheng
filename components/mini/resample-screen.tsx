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
import { cn } from '@/lib/utils'

type Step = 'choose' | 'refund' | 'resample' | 'refundDone' | 'resampleDone'
type Choice = 'refund' | 'resample'

const order = {
  no: 'DZ20261008153021',
  product: '药物基因检测',
  examinee: '李秀兰',
  mode: '自采样',
  paid: 897,
  reason: '样本 DNA 浓度不足，无法完成检测',
  notifiedAt: '2026-10-14 10:32',
}

const newOrderNo = 'DZ20261015092417'

const refundReasons = ['不想重新采样', '检测需求已变更', '等待时间过长', '其他原因'] as const

function OrderBrief({ status, tone = 'warn' }: { status: string; tone?: 'warn' | 'muted' }) {
  return (
    <div className="rounded-2xl bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] tabular-nums text-muted-foreground">订单号 {order.no}</span>
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[11px] font-medium',
            tone === 'warn' ? 'bg-[#fff1e6] text-[#d9621a]' : 'bg-[#eef1f5] text-muted-foreground',
          )}
        >
          {status}
        </span>
      </div>
      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <p className="text-[14px] font-medium text-foreground">{order.product}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {order.examinee} · {order.mode}
          </p>
        </div>
        <p className="text-[12px] text-muted-foreground">
          实付 <span className="text-[15px] font-semibold tabular-nums text-foreground">¥{order.paid}</span>
        </p>
      </div>
    </div>
  )
}

function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 border-t border-[#eef2f8] bg-white px-4 pb-6 pt-2.5">{children}</div>
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
      className="h-11 w-full rounded-full bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function Timeline({ items }: { items: { title: string; desc: string; state: 'done' | 'current' | 'todo' }[] }) {
  return (
    <ol className="space-y-0">
      {items.map((it, i) => (
        <li key={it.title} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full',
                it.state === 'done' && 'bg-primary text-primary-foreground',
                it.state === 'current' && 'bg-[#f07a2c] text-white',
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

export function ResampleScreen({ onBack, initialStep = 'choose' }: { onBack: () => void; initialStep?: Step }) {
  const [step, setStep] = useState<Step>(initialStep)
  const [choice, setChoice] = useState<Choice | null>(null)
  const [refundReason, setRefundReason] = useState<string | null>(null)
  const [refundNote, setRefundNote] = useState('')

  const titles: Record<Step, string> = {
    choose: '样本不合格处理',
    refund: '申请退款',
    resample: '确认重采样',
    refundDone: '退款申请详情',
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
            <div className="rounded-2xl bg-gradient-to-br from-[#fff4ea] to-white p-3.5">
              <p className="flex items-center gap-1.5 text-[15px] font-semibold text-[#c2541a]">
                <AlertTriangle className="size-4" aria-hidden="true" />
                样本检测不合格
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-foreground">原因：{order.reason}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MessageSquareText className="size-3.5" aria-hidden="true" />
                已于 <span className="tabular-nums">{order.notifiedAt}</span> 短信通知您，请选择处理方式
              </p>
            </div>

            <OrderBrief status="样本不合格" />

            <fieldset className="rounded-2xl bg-white p-3.5">
              <legend className="float-left mb-3 text-[15px] font-semibold text-foreground">请选择处理方式</legend>
              <div className="clear-both space-y-2.5">
                {(
                  [
                    {
                      key: 'resample',
                      icon: RotateCcw,
                      title: '免费重新采样',
                      tag: '推荐',
                      desc: '原订单关闭，系统生成一笔新的已付款订单（标记为重采样），无需再次付款，重新寄送采样盒',
                    },
                    {
                      key: 'refund',
                      icon: CircleDollarSign,
                      title: '申请退款',
                      desc: '提交退款申请，由后台审核后确定全额或部分退款，原路退回',
                    },
                  ] as const
                ).map((o) => {
                  const active = choice === o.key
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
                        name="resample-choice"
                        value={o.key}
                        checked={active}
                        onChange={() => setChoice(o.key)}
                        className="sr-only"
                      />
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef5ff] text-primary">
                        <o.icon className="size-[18px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[14px] font-medium text-foreground">
                          {o.title}
                          {'tag' in o && (
                            <span className="rounded bg-[#e6f6ec] px-1.5 py-0.5 text-[10px] text-[#1f8a4c]">{o.tag}</span>
                          )}
                        </span>
                        <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">{o.desc}</span>
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
              <h2 className="text-[15px] font-semibold text-foreground">重采样说明</h2>
              <ul className="mt-2.5 space-y-2 text-[12px] leading-relaxed text-foreground">
                <li className="flex gap-2">
                  <Ban className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  原订单 <span className="tabular-nums">{order.no}</span> 将被关闭
                </li>
                <li className="flex gap-2">
                  <RotateCcw className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  系统自动生成一笔新的已付款订单，标记为「重采样」，无需再次支付
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#1f8a4c]" aria-hidden="true" />
                  新订单沿用原受检人、检测项目及已签署的知情同意书
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-3.5">
              <h2 className="text-[15px] font-semibold text-foreground">采样盒寄送地址</h2>
              <button type="button" className="mt-2.5 flex w-full items-start gap-2.5 text-left">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-foreground">
                    李秀兰 <span className="tabular-nums font-normal text-muted-foreground">138****6688</span>
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground">
                    上海市浦东新区张江路 1388 号 3 栋 1202 室
                  </span>
                </span>
                <span className="text-[12px] text-primary">修改</span>
              </button>
            </div>
          </div>
          <BottomBar>
            <PrimaryButton onClick={() => setStep('resampleDone')}>确认重新采样</PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'refund' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <OrderBrief status="样本不合格" />

            <fieldset className="rounded-2xl bg-white p-3.5">
              <legend className="float-left mb-2.5 text-[15px] font-semibold text-foreground">退款原因</legend>
              <div className="clear-both flex flex-wrap gap-2">
                {refundReasons.map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'cursor-pointer rounded-full border px-3 py-1.5 text-[12px] transition-colors',
                      refundReason === r
                        ? 'border-primary bg-[#f3f8ff] font-medium text-primary'
                        : 'border-[#e6ecf4] text-foreground',
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
              <label htmlFor="refund-note" className="text-[15px] font-semibold text-foreground">
                补充说明 <span className="text-[12px] font-normal text-muted-foreground">选填</span>
              </label>
              <textarea
                id="refund-note"
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="请描述退款原因，便于客服审核"
                className="mt-2 w-full resize-none rounded-xl bg-[#f6f8fc] p-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <p className="text-right text-[11px] tabular-nums text-muted-foreground">{refundNote.length}/200</p>
            </div>

            <div className="flex gap-2 rounded-2xl bg-[#fff8f2] p-3 text-[11px] leading-relaxed text-[#8a5a33]">
              <CircleDollarSign className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <p>
                退款金额以后台审核结果为准：可能为全额退款（¥{order.paid}），或扣除已发生的采样盒及检测成本后部分退款。审核通过后原路退回。
              </p>
            </div>
          </div>
          <BottomBar>
            <PrimaryButton disabled={!refundReason} onClick={() => setStep('refundDone')}>
              提交退款申请
            </PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'refundDone' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <div className="rounded-2xl bg-white p-4 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fff1e6] text-[#f07a2c]">
                <CircleDollarSign className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-2.5 text-[16px] font-semibold text-foreground">退款申请已提交</p>
              <p className="mt-1 text-[12px] text-muted-foreground">后台将在 1-3 个工作日内审核，结果将短信通知您</p>
            </div>
            <div className="rounded-2xl bg-white p-3.5">
              <h2 className="mb-3 text-[15px] font-semibold text-foreground">退款进度</h2>
              <Timeline
                items={[
                  { title: '提交退款申请', desc: `原因：${refundReason ?? '—'}`, state: 'done' },
                  { title: '后台审核中', desc: '审核确定全额退款或部分退款金额', state: 'current' },
                  { title: '退款到账', desc: '审核通过后原路退回至微信支付账户', state: 'todo' },
                ]}
              />
            </div>
            <OrderBrief status="退款审核中" />
          </div>
          <BottomBar>
            <PrimaryButton onClick={onBack}>返回我的</PrimaryButton>
          </BottomBar>
        </>
      )}

      {step === 'resampleDone' && (
        <>
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
            <div className="rounded-2xl bg-white p-4 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#eef5ff] text-primary">
                <RotateCcw className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-2.5 text-[16px] font-semibold text-foreground">已为您生成重采样订单</p>
              <p className="mt-1 text-[12px] text-muted-foreground">新的采样盒将尽快寄出，请留意物流信息</p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="rounded bg-[#fff1e6] px-1.5 py-0.5 text-[10px] font-medium text-[#d9621a]">重采样</span>
                  <span className="text-[12px] tabular-nums text-muted-foreground">订单号 {newOrderNo}</span>
                </span>
                <span className="rounded bg-[#eef5ff] px-1.5 py-0.5 text-[11px] font-medium text-primary">待发货</span>
              </div>
              <div className="mt-2.5 flex items-end justify-between">
                <div>
                  <p className="text-[14px] font-medium text-foreground">{order.product}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {order.examinee} · {order.mode}
                  </p>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  已付款 <span className="text-[15px] font-semibold tabular-nums text-foreground">¥0</span>
                </p>
              </div>
              <p className="mt-2 border-t border-[#eef2f8] pt-2 text-[11px] text-muted-foreground">
                关联原订单 <span className="tabular-nums">{order.no}</span>
              </p>
            </div>

            <OrderBrief status="已关闭" tone="muted" />
          </div>
          <BottomBar>
            <PrimaryButton onClick={onBack}>查看新订单</PrimaryButton>
          </BottomBar>
        </>
      )}
    </SubPage>
  )
}
