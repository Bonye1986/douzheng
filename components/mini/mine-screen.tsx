'use client'

import { useState } from 'react'
import { ChevronRight, UserRound } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { SectionHeading } from '@/components/mini/section-heading'
import { DEFAULT_NICKNAME, DefaultAvatar } from '@/components/mini/default-avatar'
import { AuthorizationScreen } from '@/components/mini/authorization-screen'
import { ResampleScreen } from '@/components/mini/resample-screen'
import { CancelOrderScreen, ResampleRefundScreen, ShippedRefundScreen } from '@/components/mini/refund-screen'
import type { RefundKind } from '@/components/mini/order-list-screen'
import { OrderListScreen, countOrders, type OrderTabKey } from '@/components/mini/order-list-screen'
import { AfterSalesScreen, pendingAfterSalesCount } from '@/components/mini/after-sales-screen'
import { initialExaminees } from '@/components/mini/checkout-data'
import { ReportListScreen } from '@/components/mini/report-list-screen'

const LATEST_REPORT_ID = 'BG20261008001'
import { CouponCenterScreen, MyCouponsScreen, usableCouponCount } from '@/components/mini/coupon-screens'
import { ExamineeManageScreen, type ExamineeView } from '@/components/mini/examinee-manage-screen'
import { AddressManageScreen, type AddressView } from '@/components/mini/address-manage-screen'
import { MedicationReminderScreen, type ReminderView } from '@/components/mini/medication-reminder-screen'
import { GuideScreen, type GuideView } from '@/components/mini/guide-screen'
import { AboutScreen } from '@/components/mini/about-screen'
import { CustomerServiceScreen } from '@/components/mini/customer-service-screen'
import { AccountSettingsScreen, type AccountView } from '@/components/mini/account-settings-screen'

/**
 * 「我的」页仅展示 4 个阶段快捷入口，后台细分状态归并其中：
 * 待使用 = 待发货 / 待收货 / 待核销；待采样 = 待采样 / 待寄样；检测中订单不设快捷入口，从「查看全部」查看；
 * 退款/售后为独立页面（样本不合格待处理、退款、重采样）。订单类型（自采样 / 定点采样）与已关闭订单在订单列表中筛选。
 */
const iconSrc = (name: string) => `/images/icons/mine-${name}.png`

const orderPhases: { key: Exclude<OrderTabKey, 'all'> | 'after'; label: string; icon: string }[] = [
  { key: 'toPay', label: '待付款', icon: iconSrc('topay') },
  { key: 'toUse', label: '待使用', icon: iconSrc('guide') },
  { key: 'toSample', label: '待采样', icon: iconSrc('tosample') },
  { key: 'done', label: '已完成', icon: iconSrc('done') },
  { key: 'after', label: '退款/售后', icon: iconSrc('after') },
]

const tools = [
  { key: 'examinee', label: '受检人管理', icon: iconSrc('examinee') },
  { key: 'address', label: '地址管理', icon: iconSrc('address') },
  { key: 'auth', label: '授权与同意书', icon: iconSrc('auth') },
  { key: 'reminder', label: '用药提醒', icon: iconSrc('reminder') },
  { key: 'guide', label: '使用指南', icon: iconSrc('guide') },
  { key: 'about', label: '关于我们', icon: iconSrc('about') },
  { key: 'service', label: '联系客服', icon: iconSrc('service') },
  { key: 'account', label: '账号设置', icon: iconSrc('account') },
] as const

function MineIcon({ src, className = 'size-8' }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={96}
      height={96}
      className={`${className} object-contain`}
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
  return <SectionHeading id={id} title={title} action={action} onAction={onAction} icon={SECTION_ICONS[id]} />
}

const SECTION_ICONS: Record<string, string> = {
  'mine-orders': '/images/icons/sec-orders.png',
  'mine-report': '/images/icons/sec-reports.png',
}

export function MineScreen({
  initialAuthOpen = false,
  initialResampleOpen = false,
  initialReportOpen = false,
  initialReportDetailId,
  initialReportSharing = false,
  initialCoupon = null,
  initialExamineeView = null,
  initialAddressView = null,
  initialAuthFlow,
  initialAuthEmpty = false,
  initialReminderView = null,
  initialGuideView = null,
  initialAboutOpen = false,
  initialServiceOpen = false,
  initialAccountView = null,
  onOpenTests,
  loggedIn = true,
  onRequireLogin,
  onOpenChat,
}: {
  onOpenChat?: (question?: string) => void
  onOpenTests?: () => void
  loggedIn?: boolean
  /** Called with the feature name when a guest taps something that needs login. */
  onRequireLogin?: (feature: string) => void
  initialAccountView?: AccountView | null
  initialAboutOpen?: boolean
  initialServiceOpen?: boolean
  initialGuideView?: GuideView | null
  initialReminderView?: ReminderView | null
  initialAuthFlow?: 'sign' | 'withdraw'
  initialAuthEmpty?: boolean
  initialAuthOpen?: boolean
  initialResampleOpen?: boolean
  initialReportOpen?: boolean
  initialReportDetailId?: string
  initialReportSharing?: boolean
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
  const [reportDetailId, setReportDetailId] = useState<string | undefined>(initialReportDetailId)
  const [authOpen, setAuthOpen] = useState(initialAuthOpen)
  const [resampleOpen, setResampleOpen] = useState(initialResampleOpen)
  const [orderListPhase, setOrderListPhase] = useState<OrderTabKey | null>(null)
  const [afterSalesOpen, setAfterSalesOpen] = useState(false)
  const [refundKind, setRefundKind] = useState<RefundKind | null>(null)
  const self = initialExaminees[0]
  const maskedPhone = (self.phone ?? '').replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
  const guard = (feature: string, action: () => void) => () => {
    if (loggedIn) action()
    else onRequireLogin?.(feature)
  }
  const publicTools = new Set<string>(['guide', 'about', 'service'])

  return (
    <div className="relative flex h-full flex-col bg-background">
      <div className="absolute inset-x-0 top-0 h-64 bg-brand-hero" aria-hidden="true" />
      <div className="relative">
        <StatusBar />
        <header className="relative flex h-11 shrink-0 items-center justify-center">
          <h1 className="text-heading font-semibold text-foreground">我的</h1>
          <Capsule className="absolute right-3" />
        </header>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 pb-24 pt-2 [scrollbar-width:none]">
        {/* 用户信息：头像 / 昵称 / 手机号 */}
        <section aria-label="用户信息">
          {loggedIn ? (
            <button
              type="button"
              onClick={() => setAccountView('main')}
              className="flex w-full items-center gap-3 px-1 text-left"
            >
              <DefaultAvatar className="size-14 shrink-0 border-2 border-white shadow-sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-heading font-semibold text-foreground">{DEFAULT_NICKNAME}</span>
                <span className="mt-0.5 block text-caption tabular-nums text-muted-foreground">{maskedPhone}</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">进入个人资料</span>
            </button>
          ) : (
            <div className="flex w-full items-center gap-3 px-1">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#dbe6f7] shadow-sm">
                <UserRound className="size-7 text-[#8fa6c8]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-heading font-semibold text-foreground">未登录</span>
                <span className="mt-0.5 block text-caption text-muted-foreground">登录后查看订单、报告与优惠券</span>
              </span>
              <button
                type="button"
                onClick={() => onRequireLogin?.('登录')}
                className="flex h-8 shrink-0 items-center rounded-full bg-primary px-4 text-note font-medium text-primary-foreground"
              >
                登录 / 注册
              </button>
            </div>
          )}
        </section>

        {/* 我的订单 */}
        <section aria-labelledby="mine-orders" className="mt-4 rounded-2xl bg-white pb-3 pt-3.5">
          <div className="px-3.5">
            <SectionHeader
              id="mine-orders"
              title="我的订单"
              action="查看全部"
              onAction={guard('我的订单', () => setOrderListPhase('all'))}
            />
          </div>
          <ul className="mt-4 grid grid-cols-6 px-0.5">
            {orderPhases.map((p) => {
              const count = !loggedIn ? 0 : p.key === 'after' ? pendingAfterSalesCount : countOrders(p.key)
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={guard('我的订单', () =>
                      p.key === 'after' ? setAfterSalesOpen(true) : setOrderListPhase(p.key),
                    )}
                    className="flex w-full flex-col items-center gap-1.5"
                  >
                    <span className="relative">
                      <MineIcon src={p.icon} />
                      {count > 0 && (
                        <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-tag font-medium tabular-nums text-white ring-2 ring-white">
                          {count}
                          <span className="sr-only">笔</span>
                        </span>
                      )}
                    </span>
                    <span className="whitespace-nowrap text-caption text-foreground">{p.label}</span>
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
            action="全部报告"
            onAction={guard('我的报告', () => {
              setReportDetailId(undefined)
              setReportOpen(true)
            })}
          />
          {!loggedIn ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-brand-soft p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <MineIcon src={iconSrc('report')} className="size-7 opacity-50" />
              </span>
              <p className="min-w-0 flex-1 text-caption text-muted-foreground">登录后查看您的基因检测报告</p>
              <button
                type="button"
                onClick={() => onRequireLogin?.('我的报告')}
                className="flex h-7 shrink-0 items-center rounded-full border border-primary px-3.5 text-caption font-medium text-primary"
              >
                去登录
              </button>
            </div>
          ) : (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-brand-soft p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <MineIcon src={iconSrc('report')} className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-note font-medium text-foreground">儿童安全用药基因检测</p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                李秀兰 · <span className="tabular-nums">2026-10-08</span> 出具
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReportDetailId(LATEST_REPORT_ID)
                setReportOpen(true)
              }}
              aria-label="查看儿童安全用药基因检测报告"
              className="flex h-7 shrink-0 items-center rounded-full bg-primary px-3.5 text-caption font-medium text-primary-foreground"
            >
              查看
            </button>
          </div>
          )}
        </section>

        {/* 我的优惠券 / 领券中心 */}
        <section aria-label="优惠券" className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={guard('我的优惠券', () => setMyCouponsOpen(true))}
            className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 text-left"
          >
            <MineIcon src={iconSrc('coupon')} className="size-9 shrink-0" />
            <span>
              <span className="block text-body font-medium text-foreground">我的优惠券</span>
              <span className="block text-caption text-muted-foreground">
                {loggedIn ? (
                  <>
                    <span className="tabular-nums text-warning">{usableCouponCount}</span> 张可用
                  </>
                ) : (
                  '登录后查看'
                )}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={guard('领券中心', () => setCouponCenterOpen(true))}
            className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 text-left"
          >
            <MineIcon src={iconSrc('gift')} className="size-9 shrink-0" />
            <span>
              <span className="block text-body font-medium text-foreground">领券中心</span>
              <span className="block text-caption text-muted-foreground">满减券待领取</span>
            </span>
          </button>
        </section>

        {/* 常用功能 */}
        <nav aria-labelledby="mine-tools" className="mt-2.5 rounded-2xl bg-white p-3.5">
  <SectionHeading id="mine-tools" title="常用功能" icon="/images/icons/sec-tools.png" />
          <ul className="mt-3 grid grid-cols-4 gap-y-4">
            {tools.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (!loggedIn && !publicTools.has(t.key)) {
                      onRequireLogin?.(t.label)
                      return
                    }
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
                  <span className="text-caption text-foreground">{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {orderListPhase && (
        <OrderListScreen
          initialTab={orderListPhase}
          onBack={() => setOrderListPhase(null)}
          onHandleUnqualified={() => setResampleOpen(true)}
          onRefund={setRefundKind}
        />
      )}
      {afterSalesOpen && (
        <AfterSalesScreen
          onBack={() => setAfterSalesOpen(false)}
          onHandleUnqualified={() => setResampleOpen(true)}
          onTerminateResample={() => setRefundKind('resample')}
        />
      )}
      {refundKind === 'cancel' && <CancelOrderScreen onBack={() => setRefundKind(null)} />}
      {refundKind === 'shipped' && <ShippedRefundScreen onBack={() => setRefundKind(null)} />}
      {refundKind === 'resample' && (
        <ResampleRefundScreen onBack={() => setRefundKind(null)} onContact={() => setServiceOpen(true)} />
      )}
      {reportOpen && (
        <ReportListScreen
          key={reportDetailId ?? 'list'}
          onBack={() => setReportOpen(false)}
          initialDetailId={reportDetailId}
          initialSharing={initialReportSharing}
        />
      )}
      {authOpen && <AuthorizationScreen initialFlow={initialAuthFlow} empty={initialAuthEmpty} onBack={() => setAuthOpen(false)} />}
      {resampleOpen && <ResampleScreen onBack={() => setResampleOpen(false)} />}
      {myCouponsOpen && (
        <MyCouponsScreen
  onBack={() => setMyCouponsOpen(false)}
  onOpenCenter={() => setCouponCenterOpen(true)}
  onUse={() => {
  setMyCouponsOpen(false)
  onOpenTests?.()
  }}
  />
      )}
      {couponCenterOpen && <CouponCenterScreen onBack={() => setCouponCenterOpen(false)} />}
      {examineeView && <ExamineeManageScreen initialView={examineeView} onBack={() => setExamineeView(null)} />}
      {addressView && <AddressManageScreen initialView={addressView} onBack={() => setAddressView(null)} />}
      {reminderView && (
        <MedicationReminderScreen initialView={reminderView} onBack={() => setReminderView(null)} />
      )}
      {guideView && (
        <GuideScreen
          initialView={guideView}
          onBack={() => setGuideView(null)}
          onContact={() => setServiceOpen(true)}
          onAskAi={onOpenChat ? (title) => onOpenChat(`关于「${title}」，我还有一些疑问`) : undefined}
        />
      )}
      {aboutOpen && <AboutScreen onBack={() => setAboutOpen(false)} />}
      {serviceOpen && <CustomerServiceScreen onBack={() => setServiceOpen(false)} />}
      {accountView && <AccountSettingsScreen initialView={accountView} onBack={() => setAccountView(null)} />}
    </div>
  )
}
