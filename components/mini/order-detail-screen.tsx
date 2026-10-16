'use client'

import { Building2, Clock, House, MapPin, UserRound } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'

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
  payable: number
  status?: string
  statusDesc?: string
  /** 管理端发货时自动生成，自采样订单已发货及后续状态展示 */
  sampleCodes?: { name: string; code: string }[]
  /** 客服改价信息，待付款且已改价订单展示改价前后金额 */
  priceAdjust?: { before: number; after: number }
  /** 底部操作按钮，与订单列表同状态的操作保持一致 */
  actions?: React.ReactNode
  onBack: () => void
}

const yuan = (n: number) => `¥${n.toLocaleString('zh-CN')}`

export function OrderDetailScreen({
  orderNo,
  payTime,
  mode,
  receiver,
  site,
  groups,
  goodsTotal,
  couponOff,
  payable,
  status: statusProp,
  statusDesc: statusDescProp,
  sampleCodes,
  priceAdjust,
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
          <p className="flex items-center gap-1.5 text-[17px] font-semibold">
            <Clock className="size-4" aria-hidden="true" />
            {status}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-primary-foreground/85">{statusDesc}</p>
        </section>

        <section aria-labelledby="od-sampling" className="mt-2.5 rounded-2xl bg-white p-4">
          <h2 id="od-sampling" className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
            {isSelf ? (
              <House className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <Building2 className="size-4 text-primary" aria-hidden="true" />
            )}
            {isSelf ? '居家自采样' : '定点采样'}
          </h2>
          {isSelf && receiver && (
            <div className="mt-2.5 flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">
                  {receiver.name}
                  <span className="ml-2 font-normal tabular-nums text-muted-foreground">{receiver.phone}</span>
                </p>
                <p className="mt-0.5 text-[12px] leading-[18px] text-muted-foreground">{receiver.detail}</p>
              </div>
            </div>
          )}
          {!isSelf && site && (
            <div className="mt-2.5 flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground">{site.name}</p>
                <p className="mt-0.5 text-[12px] leading-[18px] text-muted-foreground">{site.address}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{site.time}</p>
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="od-items" className="mt-2.5 rounded-2xl bg-white p-4">
          <h2 id="od-items" className="text-[14px] font-semibold text-foreground">
            检测项目
          </h2>
          <ul className="mt-1">
            {groups.map((g) => (
              <li key={g.id} className="border-b border-border py-2.5 last:border-0">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                  <UserRound className="size-3.5 text-primary" aria-hidden="true" />
                  {g.name}
                </p>
                <ul className="mt-1.5 flex flex-col gap-2">
                  {g.items.map((s) => (
                    <li key={s.id} className="text-[12px]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-muted-foreground">{s.name}</span>
                        <span className="shrink-0 tabular-nums text-foreground">{yuan(s.price)}</span>
                      </div>
                      {s.sampleType && (
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          样本类型
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                            {s.sampleType}
                          </span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <dl className="mt-1 flex flex-col gap-1.5 border-t border-border pt-3 text-[12px]">
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
                  <dd className="tabular-nums text-[#e5603a]">
                    {priceAdjust.after <= priceAdjust.before ? '-' : '+'}
                    {yuan(Math.abs(priceAdjust.before - priceAdjust.after))}
                  </dd>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">优惠券</dt>
                <dd className="tabular-nums text-[#e5603a]">{couponOff > 0 ? `-${yuan(couponOff)}` : '未使用'}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-1">
              <dt className="text-[13px] text-foreground">{isPaid ? '实付款' : '需付款'}</dt>
              <dd className="text-[16px] font-semibold tabular-nums text-foreground">{yuan(payable)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="od-info" className="mt-2.5 rounded-2xl bg-white p-4">
          <h2 id="od-info" className="text-[14px] font-semibold text-foreground">
            订单信息
          </h2>
          <dl className="mt-2 flex flex-col gap-2 text-[12px]">
            {[
              ['订单编号', orderNo],
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
