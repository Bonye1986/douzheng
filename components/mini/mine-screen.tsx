'use client'

import { useState } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { DEFAULT_NICKNAME, DefaultAvatar } from '@/components/mini/default-avatar'
import { AuthorizationScreen } from '@/components/mini/authorization-screen'
import { ResampleScreen } from '@/components/mini/resample-screen'
import { OrderListScreen, countOrders, type OrderPhase } from '@/components/mini/order-list-screen'
import { AfterSalesScreen, pendingAfterSalesCount } from '@/components/mini/after-sales-screen'
import { initialExaminees } from '@/components/mini/checkout-data'
import { ReportListScreen, unreadReportCount } from '@/components/mini/report-list-screen'
import { CouponCenterScreen, MyCouponsScreen, usableCouponCount } from '@/components/mini/coupon-screens'
import { ExamineeManageScreen, type ExamineeView } from '@/components/mini/examinee-manage-screen'
import { AddressManageScreen, type AddressView } from '@/components/mini/address-manage-screen'
import { MedicationReminderScreen, type ReminderView } from '@/components/mini/medication-reminder-screen'
import { GuideScreen, type GuideView } from '@/components/mini/guide-screen'
import { AboutScreen } from '@/components/mini/about-screen'
import { CustomerServiceScreen } from '@/components/mini/customer-service-screen'
import { AccountSettingsScreen, type AccountView } from '@/components/mini/account-settings-screen'

/**
 * 面向用户的 5 个阶段，后台细分状态归并其中：
 * 待采样 = 待发货 / 已发货 / 待核销 / 待采样；检测中 = 已寄样 / 已收样 / 检测中；
 * 退款/售后为独立页面（样本不合格待处理、退款、重采样）。订单类型（自采样 / 定点采样）与已关闭订单在订单列表中筛选。
 */
const iconSrc = (name: string) => `/images/icons/mine-${name}.png`

const orderPhases: { key: Exclude<OrderPhase, 'all' | 'closed'> | 'after'; label: string; icon: string }[] = [
  { key: 'toPay', label: '待付款', icon: iconSrc('topay') },
  { key: 'toSample', label: '待采样', icon: iconSrc('tosample') },
  { key: 'testing', label: '检测中', icon: iconSrc('testing') },
  { key: 'done', label: '已完成', icon: iconSrc('done') },
  { key: 'after', label: '退款/售后', icon: iconSrc('after') },
]

const tools = [
  { key: 'examinee', label: '检测人管理', icon: iconSrc('examinee') },
  { key: 'address', label: '地址管理', icon: iconSrc('address') },
  { key: 'auth', label: '授权与同意书', icon: iconSrc('auth') },
  { key: 'reminder', label: '用药提醒', icon: iconSrc('reminder') },
  { key: 'guide', label: '使用指南', icon: iconSrc('guide') },
  { key: 'about', label: '关于我们', icon: iconSrc('about') },
  { key: 'service', label: '联系客服', icon: iconSrc('service') },
  { key: 'account', label: '账号设置', icon: iconSrc('account') },
] as const

function MineIcon({ src, className = 'size-8' }: { src: string; className?: string }) {
  const padded = src.includes('mine-examinee')
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={96}
      height={96}
      className={`${className} object-cover mix-blend-multiply ${padded ? 'scale-[1.3]' : ''}`}
    />
  )
}

function SectionHeader({
  id,
  title,
  action,
  onAction,
}: {
  id: string
  title: string
  action: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 id={id} className="text-[15px] font-semibold text-foreground">
        {title}
      </h2>
      <button type="button" onClick={onAction} className="flex items-center text-[12px] text-muted-foreground">
        {action}
        <ChevronRight className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export function MineScreen({
  initialAuthOpen = false,
  initialResampleOpen = false,
  initialReportOpen = false,
  initialReportDetailId,
  initialCoupon = null,
  initialExamineeView = null,
  initialAddressView = null,
  initialAuthTab = 'test',
  initialReminderView = null,
  initialGuideView = null,
  initialAboutOpen = false,
  initialServiceOpen = false,
  initialAccountView = null,
}: {
  initialAccountView?: AccountView | null
  initialAboutOpen?: boolean
  initialServiceOpen?: boolean
  initialGuideView?: GuideView | null
  initialReminderView?: ReminderView | null
  initialAuthTab?: 'test' | 'research'
  initialAuthOpen?: boolean
  initialResampleOpen?: boolean
  initialReportOpen?: boolean
  initialReportDetailId?: string
  initialCoupon?: 'mine' | 'center' | null
  initialExamineeView?: ExamineeView | null
  initialAddressView?: AddressView | null
}) {
  const [examineeView, setExamineeView] = useState<ExamineeView | null>(initialExamineeView)
  const [addressView, setAddressView] = useState<AddressView | null>(initialAddressView)
  const [reminderView, setReminderView] = useState<ReminderView | null>(initialReminderView)
  const [guideView, setGuideView] = useState<GuideView | null>(initialGuideView)
  const [aboutOpen, setAboutOpen] = useState(initialAboutOpen)
  const [serviceOpen, setServiceOpen] = useState(initialServiceOpen)
  const [accountView, setAccountView] = useState<AccountView | null>(initialAccountView)
  const [myCouponsOpen, setMyCouponsOpen] = useState(initialCoupon === 'mine')
  const [couponCenterOpen, setCouponCenterOpen] = useState(initialCoupon === 'center')
  const [reportOpen, setReportOpen] = useState(initialReportOpen)
  const [authOpen, setAuthOpen] = useState(initialAuthOpen)
  const [resampleOpen, setResampleOpen] = useState(initialResampleOpen)
  const [orderListPhase, setOrderListPhase] = useState<OrderPhase | null>(null)
  const [afterSalesOpen, setAfterSalesOpen] = useState(false)
  const self = initialExaminees[0]
  const maskedPhone = (self.phone ?? '').replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')

  return (
    <div className="relative flex h-full flex-col bg-[#f4f8fe]">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#d6e7ff] to-[#f4f8fe]" aria-hidden="true" />
      <div className="relative">
        <StatusBar />
        <header className="relative flex h-11 shrink-0 items-center justify-center">
          <h1 className="text-[17px] font-semibold text-foreground">我的</h1>
          <Capsule className="absolute right-3" />
        </header>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 pb-24 pt-2 [scrollbar-width:none]">
        {/* 用户信息：头像 / 昵称 / 手机号 */}
        <section aria-label="用户信息">
          <button
            type="button"
            onClick={() => setAccountView('main')}
            className="flex w-full items-center gap-3 px-1 text-left"
          >
            <DefaultAvatar className="size-14 shrink-0 border-2 border-white shadow-sm" />
            <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-semibold text-foreground">{DEFAULT_NICKNAME}</span>
                <span className="mt-0.5 block text-[12px] tabular-nums text-muted-foreground">{maskedPhone}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">进入个人资料</span>
          </button>
        </section>

        {/* 我的订单 */}
        <section aria-labelledby="mine-orders" className="mt-4 rounded-2xl bg-white pb-3 pt-3.5">
          <div className="px-3.5">
            <SectionHeader
              id="mine-orders"
              title="我的订单"
              action="查看全部"
              onAction={() => setOrderListPhase('all')}
            />
          </div>
          <ul className="mt-4 grid grid-cols-5 px-1">
            {orderPhases.map((p) => {
              const count = p.key === 'after' ? pendingAfterSalesCount : countOrders(p.key)
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => (p.key === 'after' ? setAfterSalesOpen(true) : setOrderListPhase(p.key))}
                    className="flex w-full flex-col items-center gap-1.5"
                  >
                    <span className="relative">
                      <MineIcon src={p.icon} />
                      {count > 0 && (
                        <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e0651c] px-1 text-[10px] font-medium tabular-nums text-white ring-2 ring-white">
                          {count}
                          <span className="sr-only">笔</span>
                        </span>
                      )}
                    </span>
                    <span className="whitespace-nowrap text-[12px] text-foreground">{p.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* 我的报告 */}
        <section aria-labelledby="mine-report" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <SectionHeader
            id="mine-report"
            title="我的报告"
            action={`全部报告${unreadReportCount ? ` · ${unreadReportCount} 份新` : ''}`}
            onAction={() => setReportOpen(true)}
          />
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#eef5ff] to-[#f8fbff] p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <MineIcon src={iconSrc('report')} className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">儿童安全用药基因检测</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                李秀兰 · <span className="tabular-nums">2026-10-08</span> 出具
              </p>
            </div>
            <button
              type="button"
              className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 text-[12px] font-medium text-primary-foreground"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              AI 解读
            </button>
          </div>
        </section>

        {/* 我的优惠券 / 领券中心 */}
        <section aria-label="优惠券" className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setMyCouponsOpen(true)}
            className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 text-left"
          >
            <MineIcon src={iconSrc('coupon')} className="size-9 shrink-0" />
            <span>
              <span className="block text-[14px] font-medium text-foreground">我的优惠券</span>
              <span className="block text-[11px] text-muted-foreground">
                <span className="tabular-nums text-[#e0651c]">{usableCouponCount}</span> 张可用
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCouponCenterOpen(true)}
            className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 text-left"
          >
            <MineIcon src={iconSrc('gift')} className="size-9 shrink-0" />
            <span>
              <span className="block text-[14px] font-medium text-foreground">领券中心</span>
              <span className="block text-[11px] text-muted-foreground">新人券待领取</span>
            </span>
          </button>
        </section>

        {/* 常用功能 */}
        <nav aria-labelledby="mine-tools" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <h2 id="mine-tools" className="text-[15px] font-semibold text-foreground">
            常用功能
          </h2>
          <ul className="mt-3 grid grid-cols-4 gap-y-4">
            {tools.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (t.key === 'auth') setAuthOpen(true)
                    if (t.key === 'examinee') setExamineeView('list')
                    if (t.key === 'address') setAddressView('list')
                    if (t.key === 'reminder') setReminderView('list')
                    if (t.key === 'guide') setGuideView('list')
                    if (t.key === 'about') setAboutOpen(true)
                    if (t.key === 'service') setServiceOpen(true)
                    if (t.key === 'account') setAccountView('main')
                  }}
                  className="flex w-full flex-col items-center gap-1.5"
                >
                  <MineIcon src={t.icon} />
                  <span className="text-[12px] text-foreground">{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {orderListPhase && (
        <OrderListScreen
          initialPhase={orderListPhase}
          onBack={() => setOrderListPhase(null)}
          onHandleUnqualified={() => setResampleOpen(true)}
        />
      )}
      {afterSalesOpen && (
        <AfterSalesScreen onBack={() => setAfterSalesOpen(false)} onHandleUnqualified={() => setResampleOpen(true)} />
      )}
      {reportOpen && <ReportListScreen onBack={() => setReportOpen(false)} initialDetailId={initialReportDetailId} />}
      {authOpen && <AuthorizationScreen initialTab={initialAuthTab} onBack={() => setAuthOpen(false)} />}
      {resampleOpen && <ResampleScreen onBack={() => setResampleOpen(false)} />}
      {myCouponsOpen && (
        <MyCouponsScreen onBack={() => setMyCouponsOpen(false)} onOpenCenter={() => setCouponCenterOpen(true)} />
      )}
      {couponCenterOpen && <CouponCenterScreen onBack={() => setCouponCenterOpen(false)} />}
      {examineeView && <ExamineeManageScreen initialView={examineeView} onBack={() => setExamineeView(null)} />}
      {addressView && <AddressManageScreen initialView={addressView} onBack={() => setAddressView(null)} />}
      {reminderView && (
        <MedicationReminderScreen initialView={reminderView} onBack={() => setReminderView(null)} />
      )}
      {guideView && (
        <GuideScreen initialView={guideView} onBack={() => setGuideView(null)} onContact={() => setServiceOpen(true)} />
      )}
      {aboutOpen && <AboutScreen onBack={() => setAboutOpen(false)} />}
      {serviceOpen && <CustomerServiceScreen onBack={() => setServiceOpen(false)} />}
      {accountView && <AccountSettingsScreen initialView={accountView} onBack={() => setAccountView(null)} />}
    </div>
  )
}
