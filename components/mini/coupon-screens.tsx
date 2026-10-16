'use client'

import { useState } from 'react'
import { Check, ChevronRight, Gift, TicketPercent } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

type CouponStatus = 'usable' | 'used' | 'expired'

type MyCoupon = {
  id: string
  amount: number
  threshold: number
  title: string
  scope: string
  expire: string
  status: CouponStatus
}

const myCoupons: MyCoupon[] = [
  { id: 'm1', amount: 100, threshold: 1000, title: '满 1000 减 100', scope: '全部检测项目可用', expire: '2026.12.31 到期', status: 'usable' },
  { id: 'm2', amount: 50, threshold: 500, title: '满 500 减 50', scope: '全部检测项目可用', expire: '2026.10.20 到期', status: 'usable' },
  { id: 'm3', amount: 30, threshold: 0, title: '新人专享 立减 30', scope: '首单可用', expire: '2026.09.30 使用', status: 'used' },
  { id: 'm4', amount: 80, threshold: 800, title: '国庆特惠 满 800 减 80', scope: '心血管用药基因检测', expire: '2026.10.07 已过期', status: 'expired' },
]

export const usableCouponCount = myCoupons.filter((c) => c.status === 'usable').length

const statusTabs: { key: CouponStatus; label: string }[] = [
  { key: 'usable', label: '可使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
]

const EXPIRING_SOON = new Set(['m2'])

function CouponCard({
  amount,
  threshold,
  title,
  scope,
  expire,
  dim,
  tag,
  action,
}: {
  amount: number
  threshold: number
  title: string
  scope: string
  expire: string
  dim?: boolean
  tag?: string
  action?: React.ReactNode
}) {
  return (
    <div className={cn('relative flex overflow-hidden rounded-2xl bg-white', dim && 'opacity-60')}>
      <div
        className={cn(
          'flex w-[96px] shrink-0 flex-col items-center justify-center py-4',
          dim ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
        )}
      >
        <p className="leading-none">
          <span className="text-[13px] font-medium">¥</span>
          <span className="text-[28px] font-bold tabular-nums">{amount}</span>
        </p>
        <p className="mt-1.5 text-[11px]">{threshold ? `满 ${threshold} 可用` : '无门槛'}</p>
      </div>
      <span
        className="absolute left-[96px] top-0 h-full border-l border-dashed border-primary/30"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-medium text-foreground">{title}</span>
            {tag && (
              <span className="shrink-0 rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">{tag}</span>
            )}
          </p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{scope}</p>
          <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">{expire}</p>
        </div>
        {action}
      </div>
    </div>
  )
}

export function MyCouponsScreen({ onBack, onOpenCenter }: { onBack: () => void; onOpenCenter: () => void }) {
  const [tab, setTab] = useState<CouponStatus>('usable')
  const list = myCoupons.filter((c) => c.status === tab)

  return (
    <SubPage title="我的优惠券" titleId="my-coupons-title" onBack={onBack}>
      <div role="tablist" aria-label="优惠券状态" className="flex shrink-0 gap-6 bg-white px-4">
        {statusTabs.map((t) => {
          const count = myCoupons.filter((c) => c.status === t.key).length
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                'relative py-3 text-[14px]',
                active ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {t.label}
              <span className="ml-0.5 tabular-nums">({count})</span>
              {active && (
                <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-primary" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-24 pt-3 [scrollbar-width:none]">
        <button
          type="button"
          onClick={onOpenCenter}
          className="flex w-full items-center gap-2 rounded-2xl bg-gradient-to-r from-primary/10 to-white px-3.5 py-3 text-left"
        >
          <Gift className="size-5 text-primary" aria-hidden="true" />
          <span className="flex-1 text-[13px] text-foreground">领券中心有新券可领</span>
          <span className="flex items-center text-[12px] text-primary">
            去领券
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </span>
        </button>

        {list.length ? (
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {list.map((c) => (
              <li key={c.id}>
                <CouponCard
                  {...c}
                  dim={c.status !== 'usable'}
                  tag={c.status === 'usable' && EXPIRING_SOON.has(c.id) ? '即将过期' : undefined}
                  action={
                    c.status === 'usable' ? (
                      <button
                        type="button"
                        className="h-7 shrink-0 rounded-full bg-primary px-3 text-[12px] font-medium text-white"
                      >
                        去使用
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                        {c.status === 'used' ? '已使用' : '已过期'}
                      </span>
                    )
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <TicketPercent className="size-10" strokeWidth={1.4} aria-hidden="true" />
            <p className="mt-2 text-[13px]">暂无优惠券</p>
          </div>
        )}

        <section aria-labelledby="coupon-rules" className="mt-4 rounded-2xl bg-white p-3.5">
          <h2 id="coupon-rules" className="text-[13px] font-medium text-foreground">
            使用说明
          </h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-[11px] leading-relaxed text-muted-foreground">
            <li>下单结算时自动选择最优优惠券，也可手动切换</li>
            <li>每笔订单限用 1 张，不可叠加，不可兑换现金</li>
            <li>订单全额退款后，未过期的优惠券将退回账户</li>
          </ul>
        </section>
      </div>
    </SubPage>
  )
}

type CenterCoupon = {
  id: string
  amount: number
  threshold: number
  title: string
  scope: string
  expire: string
  stock: number
  claimed: boolean
}

const centerCoupons: CenterCoupon[] = [
  { id: 'n1', amount: 30, threshold: 0, title: '新人专享 立减 30', scope: '首单可用 · 每人限领 1 张', expire: '领取后 30 天内有效', stock: 100, claimed: false },
  { id: 'n2', amount: 150, threshold: 1500, title: '家庭套餐 满 1500 减 150', scope: '多位受检人合并下单可用', expire: '2026.12.31 前有效', stock: 62, claimed: false },
  { id: 'n3', amount: 60, threshold: 600, title: '儿童安全用药 专享券', scope: '儿童安全用药基因检测', expire: '2026.11.30 前有效', stock: 35, claimed: false },
  { id: 'n4', amount: 50, threshold: 500, title: '满 500 减 50', scope: '全部检测项目可用', expire: '2026.11.30 前有效', stock: 0, claimed: true },
]

export function CouponCenterScreen({ onBack }: { onBack: () => void }) {
  const [claimed, setClaimed] = useState<Set<string>>(
    () => new Set(centerCoupons.filter((c) => c.claimed).map((c) => c.id)),
  )
  const [toast, setToast] = useState<string | null>(null)

  const claim = (c: CenterCoupon) => {
    setClaimed((prev) => new Set(prev).add(c.id))
    setToast(`已领取「${c.title}」`)
    window.setTimeout(() => setToast(null), 1600)
  }

  return (
    <SubPage title="领券中心" titleId="coupon-center-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto pb-24 [scrollbar-width:none]">
        <div className="bg-gradient-to-b from-primary/15 to-[#f4f8fe] px-4 pb-6 pt-5">
          <p className="text-[20px] font-bold text-primary">基因检测 限时领券</p>
          <p className="mt-1 text-[12px] text-muted-foreground">先领券再下单，结算时自动抵扣</p>
        </div>

        <ul className="-mt-2 flex flex-col gap-2.5 px-3">
          {centerCoupons.map((c) => {
            const isClaimed = claimed.has(c.id)
            const soldOut = !isClaimed && c.stock === 0
            return (
              <li key={c.id}>
                <CouponCard
                  amount={c.amount}
                  threshold={c.threshold}
                  title={c.title}
                  scope={c.scope}
                  expire={c.expire}
                  dim={soldOut}
                  tag={c.threshold === 0 ? '新人' : undefined}
                  action={
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      {isClaimed ? (
                        <span className="flex h-7 items-center gap-0.5 rounded-full border border-primary px-2.5 text-[12px] text-primary">
                          <Check className="size-3.5" aria-hidden="true" />
                          已领取
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={soldOut}
                          onClick={() => claim(c)}
                          className="h-7 rounded-full bg-primary px-3 text-[12px] font-medium text-white disabled:bg-muted disabled:text-muted-foreground"
                        >
                          {soldOut ? '已抢光' : '立即领取'}
                        </button>
                      )}
                      {!isClaimed && c.stock > 0 && (
                        <span className="text-[10px] tabular-nums text-muted-foreground">剩余 {c.stock}%</span>
                      )}
                    </div>
                  }
                />
              </li>
            )
          })}
        </ul>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">领取的优惠券可在「我的 - 我的优惠券」查看</p>
      </div>

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-50 mx-auto w-fit max-w-[80%] -translate-y-1/2 rounded-lg bg-foreground/85 px-4 py-2.5 text-center text-[13px] text-white"
        >
          {toast}
        </div>
      )}
    </SubPage>
  )
}
