'use client'

import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import type { AfterCase } from '@/components/mini/after-sales-screen'
import { cn } from '@/lib/utils'

type Step = { label: string; time?: string; desc?: string }

type CaseDetail = {
  serviceNo: string
  serviceType: string
  applyTime: string
  reason: string
  headline: string
  headlineDesc: string
  steps: Step[]
  current: number
  refundRows?: [string, string][]
  refundTotal?: { label: string; value: string }
}

const details: Record<string, CaseDetail> = {
  DZ20261012003: {
    serviceNo: 'SH20261014001',
    serviceType: '样本不合格处理',
    applyTime: '2026-10-14 09:12',
    reason: '样本 DNA 浓度不足，未达到检测要求',
    headline: '待您处理',
    headlineDesc: '请在 7 天内选择免费重新采样或终止订单并退款，逾期将由客服联系您',
    steps: [
      { label: '实验室质检', time: '2026-10-13 16:40', desc: '样本 DNA 浓度不足' },
      { label: '短信通知用户', time: '2026-10-14 09:12' },
      { label: '用户选择处理方式', desc: '重新采样 / 终止并退款' },
      { label: '处理完成' },
    ],
    current: 2,
  },
  DZ20261015004: {
    serviceNo: 'SH20261015002',
    serviceType: '发货前取消订单',
    applyTime: '2026-10-15 10:22',
    reason: '已支付未发货，用户主动取消',
    headline: '退款成功',
    headlineDesc: '¥1299 已全额原路退回微信支付账户，预计 1-3 个工作日到账',
    steps: [
      { label: '取消订单', time: '2026-10-15 10:22', desc: '采样盒尚未发货' },
      { label: '订单关闭', time: '2026-10-15 10:22' },
      { label: '退款到账', time: '2026-10-15 10:25', desc: '全额原路退回微信支付' },
    ],
    current: 3,
    refundRows: [
      ['实付金额', '¥1299'],
      ['扣除费用', '¥0'],
      ['退款方式', '原路退回'],
    ],
    refundTotal: { label: '退款金额', value: '¥1299' },
  },
  DZ20260918002: {
    serviceNo: 'SH20260920006',
    serviceType: '发货后申请退款',
    applyTime: '2026-09-20 14:05',
    reason: '计划有变，暂不需要检测',
    headline: '退款成功',
    headlineDesc: '¥600 已原路退回微信支付账户，预计 1-3 个工作日到账',
    steps: [
      { label: '提交申请', time: '2026-09-20 14:05', desc: '扣除采样盒费用后退款' },
      { label: '平台审核通过', time: '2026-09-20 17:32' },
      { label: '退款到账', time: '2026-09-21 10:18', desc: '原路退回微信支付' },
    ],
    current: 3,
    refundRows: [
      ['实付金额', '¥899'],
      ['采样盒费用', '-¥299'],
      ['退款方式', '原路退回'],
    ],
    refundTotal: { label: '退款金额', value: '¥600' },
  },
  DZ20261001007: {
    serviceNo: 'SH20261008003',
    serviceType: '样本不合格 · 重采样',
    applyTime: '2026-10-08 11:26',
    reason: '样本溶血，无法完成检测',
    headline: '已转重采样',
    headlineDesc: '原订单已关闭，已生成新的已付款订单，请按新订单完成采样',
    steps: [
      { label: '实验室质检', time: '2026-10-07 15:02', desc: '样本溶血' },
      { label: '用户同意重采样', time: '2026-10-08 11:26' },
      { label: '生成重采样订单', time: '2026-10-08 11:26', desc: '新订单 DZ20261009011' },
    ],
    current: 3,
  },
}

export function AfterSalesDetailScreen({
  item,
  onBack,
  onHandleUnqualified,
  onTerminateResample,
}: {
  item: AfterCase
  onBack: () => void
  onHandleUnqualified: () => void
  onTerminateResample: () => void
}) {
  const d = details[item.id]
  const done = d.current >= d.steps.length
  const warn = item.kind === 'pending'

  return (
    <SubPage title="售后详情" titleId="after-sales-detail-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]">
        <section className={cn('rounded-2xl p-4 text-white', warn ? 'bg-[#e0651c]' : 'bg-primary')}>
          <p className="flex items-center gap-1.5 text-heading font-semibold">
            {warn ? (
              <AlertTriangle className="size-4" aria-hidden="true" />
            ) : done ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : (
              <Clock className="size-4" aria-hidden="true" />
            )}
            {d.headline}
          </p>
          <p className="mt-1 text-caption leading-5 text-white/85">{d.headlineDesc}</p>
        </section>

        {d.refundRows && d.refundTotal && (
          <section aria-labelledby="asd-refund" className="mt-2.5 rounded-2xl bg-white p-4">
            <h2 id="asd-refund" className="text-title font-semibold text-foreground">
              退款信息
            </h2>
            <dl className="mt-2 flex flex-col gap-1.5 text-caption">
              {d.refundRows.map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className={cn('tabular-nums', v.startsWith('-') ? 'text-destructive' : 'text-foreground')}>{v}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between border-t border-border pt-2">
                <dt className="text-note text-foreground">{d.refundTotal.label}</dt>
                <dd className="text-title font-semibold tabular-nums text-warning">{d.refundTotal.value}</dd>
              </div>
            </dl>
          </section>
        )}

        {item.newOrderId && (
          <section aria-labelledby="asd-new" className="mt-2.5 rounded-2xl bg-white p-4">
            <h2 id="asd-new" className="text-title font-semibold text-foreground">
              重采样订单
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-caption tabular-nums text-muted-foreground">
              <span className="line-through">{item.id}</span>
              <ArrowRight className="size-3" aria-hidden="true" />
              <span className="text-foreground">{item.newOrderId}</span>
              <span className="rounded bg-primary/10 px-1 text-tag font-medium text-primary">重采样</span>
            </p>
            <p className="mt-2 rounded-lg bg-muted px-2.5 py-1.5 text-caption leading-relaxed text-muted-foreground">
              如需终止检测并退款，需联系客服确认，扣除已产生的各类费用后原路退回
            </p>
          </section>
        )}

        <section aria-labelledby="asd-order" className="mt-2.5 rounded-2xl bg-white p-4">
          <h2 id="asd-order" className="text-title font-semibold text-foreground">
            检测项目
          </h2>
          <dl className="mt-2 flex flex-col gap-2 text-caption">
            {[
              ['检测项目', item.product],
              ['受检人', item.examinee],
              ['商品金额', item.amount],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 flex-1 text-right tabular-nums text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="asd-info" className="mt-2.5 rounded-2xl bg-white p-4">
          <h2 id="asd-info" className="text-title font-semibold text-foreground">
            售后信息
          </h2>
          <dl className="mt-2 flex flex-col gap-2 text-caption">
            {[
              ['售后编号', d.serviceNo],
              ['售后类型', d.serviceType],
              ['售后原因', d.reason],
              ['订单编号', item.id],
              ['采样方式', item.type === 'self' ? '居家自采样' : '定点采样'],
              ['申请时间', d.applyTime],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 flex-1 text-right tabular-nums text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {item.action && (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-white px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          <button
            type="button"
            onClick={() => {
              if (item.action?.handle) onHandleUnqualified()
              if (item.action?.terminate) onTerminateResample()
            }}
            className={cn(
              'h-8 rounded-full px-4 text-note font-medium',
              item.action.primary ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground',
            )}
          >
            {item.action.label}
          </button>
        </div>
      )}
    </SubPage>
  )
}
