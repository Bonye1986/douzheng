'use client'

import { useState } from 'react'
import { Building2, ChevronUp, CircleCheck, Clock, House, MapPin } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

type MemberGroup = {
  id: string
  name: string
  items: { id: string; name: string; price: number; sampleType?: string }[]
}

type Props = {
  orderNo: string
  payTime: string
  mode: 'self' | 'site'
  receiver?: { name: string; phone: string; detail: string }
  site?: { name: string; address: string; time: string } | null
  groups: MemberGroup[]
  goodsTotal: number
  couponOff: number
  /** 优惠来自合并支付的优惠券，按金额比例分摊到本订单 */
  couponShared?: boolean
  /** 使用的优惠券名称，如「满 1000 减 100」 */
  couponName?: string
  /** 合并支付时该券的总抵扣金额 */
  couponTotal?: number
  /** 合并支付单号，拆单后的子订单展示 */
  parentOrderNo?: string
  payable: number
  status?: string
  statusDesc?: string
  /** 管理端发货时自动生成，自采样订单已发货及后续状态展示 */
  sampleCodes?: { name: string; code: string }[]
  /** 客服改价信息，待付款且已改价订单展示改价前后金额 */
  priceAdjust?: { before: number; after: number }
  /** 定点采样订单核销完成后展示 */
  verification?: { operator: string; time: string }
  /** 底部操作按钮，与订单列表同状态的操作保持一致 */
  actions?: React.ReactNode
  onBack: () => void
}

const yuan = (n: number) => `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`

function CouponRow({
  couponOff,
  couponName,
  couponTotal,
}: {
  couponOff: number
  couponName?: string
  couponTotal?: number
}) {
  const [open, setOpen] = useState(true)
  if (couponOff <= 0 || !couponName) {
    return (
      <div className="flex justify-between">
        <dt className="text-muted-foreground">优惠券</dt>
        <dd className="tabular-nums text-destructive">{couponOff > 0 ? `-${yuan(couponOff)}` : '未使用'}</dd>
      </div>
    )
  }
  return (
    <div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">优惠券</dt>
        <dd>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="od-coupon-detail"
            className="flex items-center gap-0.5 font-medium tabular-nums text-destructive"
          >
            -{yuan(couponOff)}
            <ChevronUp
              className={cn('size-3.5 text-muted-foreground transition-transform', !open && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
        </dd>
      </div>
      {open && (
        <dd id="od-coupon-detail" className="mt-1.5 rounded-lg bg-background px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-foreground">{couponName}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">本单 -{yuan(couponOff)}</span>
          </div>
          {couponTotal != null && couponTotal > couponOff && (
            <p className="mt-1 leading-4 text-muted-foreground">
              合并支付共抵扣 {yuan(couponTotal)}，按各子订单商品金额比例分摊，退款时按本单实付金额退回
            </p>
          )}
        </dd>
      )}
    </div>
  )
}

export function OrderDetailScreen({
  orderNo,
  payTime,
  mode,
  receiver,
  site,
  groups,
  goodsTotal,
  couponOff,
  couponName,
  couponTotal,
  parentOrderNo,
  payable,
  status: statusProp,
  statusDesc: statusDescProp,
  sampleCodes,
  priceAdjust,
  verification,
  actions,
  onBack,
}: Props) {
  const isSelf = mode === 'self'
  const status = statusProp ?? (isSelf ? '待发货' : '待核销')
  const statusDesc =
    statusDescProp ?? (isSelf ? '已支付，实验室将在 24 小时内寄出采样盒' : '请按预约时间前往采样机构，出示核销码完成采样')
  const isPaid = status !== '待付款'

  return (
    <SubPage title="订单详情" titleId="order-detail-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]">
        <section className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <p className="flex items-center gap-1.5 text-heading font-semibold">
            <Clock className="size-4" aria-hidden="true" />
            {status}
          </p>
          <p className="mt-1 text-caption leading-5 text-primary-foreground/85">{statusDesc}</p>
        </section>

        <section
          aria-label={isSelf ? '收货地址' : '采样机构'}
          className="mt-2.5 rounded-2xl bg-white p-4"
        >
          {isSelf && receiver && (
            <div className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-note font-medium text-foreground">
                  {receiver.name}
                  <span className="ml-2 font-normal tabular-nums text-muted-foreground">{receiver.phone}</span>
                </p>
                <p className="mt-0.5 text-caption leading-[18px] text-muted-foreground">{receiver.detail}</p>
              </div>
            </div>
          )}
          {!isSelf && site && (
            <div className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-note font-medium text-foreground">{site.name}</p>
                <p className="mt-0.5 text-caption leading-[18px] text-muted-foreground">{site.address}</p>
                <p className="mt-0.5 text-caption text-muted-foreground">{site.time}</p>
              </div>
            </div>
          )}
          {!isSelf && verification && (
            <dl
              aria-label="核销信息"
              className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-caption"
            >
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">核销状态</dt>
                <dd className="flex items-center gap-1 font-medium text-success">
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                  已核销
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">核销人员</dt>
                <dd className="text-foreground">{verification.operator}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">核销时间</dt>
                <dd className="tabular-nums text-foreground">{verification.time}</dd>
              </div>
            </dl>
          )}
        </section>

        <section aria-labelledby="od-items" className="mt-2.5 rounded-2xl bg-white p-4">
          <h2 id="od-items" className="text-title font-semibold text-foreground">
            检测项目
          </h2>
          <ul className="mt-1">
            {groups.flatMap((g) =>
              g.items.map((s) => (
                <li key={`${g.id}-${s.id}`} className="border-b border-border py-3 last:border-0">
                  <dl className="flex flex-col gap-2 text-caption">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">检测项目</dt>
                      <dd className="min-w-0 text-right font-medium text-foreground">{s.name}</dd>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">采样方式</dt>
                      <dd className="text-foreground">{isSelf ? '居家自采样' : '定点采样'}</dd>
                    </div>
                    {s.sampleType && (
                      <div className="flex items-center justify-between gap-4">
                        <dt className="shrink-0 text-muted-foreground">样本类型</dt>
                        <dd className="text-foreground">{s.sampleType}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">受检人</dt>
                      <dd className="text-foreground">{g.name}</dd>
                    </div>
                  </dl>
                </li>
              )),
            )}
          </ul>
          <dl className="mt-1 flex flex-col gap-1.5 border-t border-border pt-3 text-caption">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">商品金额</dt>
              <dd className="tabular-nums text-foreground">{yuan(goodsTotal)}</dd>
            </div>
            {priceAdjust ? (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">改价前</dt>
                  <dd className="tabular-nums text-muted-foreground line-through">{yuan(priceAdjust.before)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">改价后</dt>
                  <dd className="tabular-nums text-foreground">{yuan(priceAdjust.after)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">客服改价</dt>
                  <dd className="tabular-nums text-destructive">
                    {priceAdjust.after <= priceAdjust.before ? '-' : '+'}
                    {yuan(Math.abs(priceAdjust.before - priceAdjust.after))}
                  </dd>
                </div>
              </>
            ) : (
              <CouponRow couponOff={couponOff} couponName={couponName} couponTotal={couponTotal} />
            )}
            <div className="flex items-baseline justify-between pt-1">
              <dt className="text-note text-foreground">{isPaid ? '实付款' : '需付款'}</dt>
              <dd className="text-title font-semibold tabular-nums text-foreground">{yuan(payable)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="od-info" className="mt-2.5 rounded-2xl bg-white p-4">
          <h2 id="od-info" className="text-title font-semibold text-foreground">
            订单信息
          </h2>
          <dl className="mt-2 flex flex-col gap-2 text-caption">
            {[
              ['订单编号', orderNo],
              ...(parentOrderNo ? [['合并单号', parentOrderNo]] : []),
              ['下单时间', payTime],
              ...(isPaid
                ? [
                    ['支付方式', '微信支付'],
                    ['支付时间', payTime],
                  ]
                : []),
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 flex-1 text-right tabular-nums text-foreground">{v}</dd>
              </div>
            ))}
            {isPaid && sampleCodes && sampleCodes.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-muted-foreground">样本编码</dt>
                <dd className="min-w-0 flex-1">
                  <ul className="flex flex-col items-end gap-1">
                    {sampleCodes.map((s) => (
                      <li key={s.code} className="flex items-center gap-1.5 text-foreground">
                        {sampleCodes.length > 1 && <span className="text-muted-foreground">{s.name}</span>}
                        <span className="font-mono tabular-nums">{s.code}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-white px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          {actions}
        </div>
      )}
    </SubPage>
  )
}
