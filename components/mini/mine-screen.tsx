'use client'

import { useState } from 'react'
import {
  AlarmClock,
  BadgeCheck,
  Ban,
  BookOpen,
  Building2,
  ChevronRight,
  FileSignature,
  FileText,
  FlaskConical,
  Gift,
  Headphones,
  House,
  Inbox,
  Info,
  MapPin,
  PackageCheck,
  QrCode,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  TestTube,
  TicketPercent,
  Truck,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { AuthorizationScreen } from '@/components/mini/authorization-screen'
import { initialExaminees } from '@/components/mini/checkout-data'
import { cn } from '@/lib/utils'

type StatusKey =
  | 'toShip'
  | 'shipped'
  | 'toVerify'
  | 'toSample'
  | 'sent'
  | 'received'
  | 'testing'
  | 'done'
  | 'closed'

const statusMeta: Record<StatusKey, { label: string; icon: LucideIcon; count?: number }> = {
  toShip: { label: '待发货', icon: PackageCheck },
  shipped: { label: '已发货', icon: Truck, count: 1 },
  toVerify: { label: '待核销', icon: QrCode, count: 1 },
  toSample: { label: '待采样', icon: TestTube },
  sent: { label: '已寄样', icon: Send },
  received: { label: '已收样', icon: Inbox },
  testing: { label: '检测中', icon: FlaskConical, count: 2 },
  done: { label: '已完成', icon: BadgeCheck },
  closed: { label: '已关闭', icon: Ban },
}

const orderTabs = [
  {
    key: 'all',
    label: '全部订单',
    statuses: ['toShip', 'shipped', 'toVerify', 'toSample', 'sent', 'received', 'testing', 'done'],
  },
  {
    key: 'self',
    label: '自采样订单',
    statuses: ['toShip', 'shipped', 'toSample', 'sent', 'received', 'testing', 'done'],
  },
  {
    key: 'site',
    label: '定点采样订单',
    statuses: ['toVerify', 'toSample', 'sent', 'received', 'testing', 'done'],
  },
] as const satisfies readonly { key: string; label: string; statuses: readonly StatusKey[] }[]

type OrderTabKey = (typeof orderTabs)[number]['key']

const afterSales = [
  { key: 'self', label: '自采重采样订单', desc: '重新寄送采样盒', icon: House, count: 1 },
  { key: 'site', label: '定点重采样订单', desc: '预约机构重新采样', icon: Building2, count: 0 },
] as const

const tools = [
  { key: 'examinee', label: '检测人管理', icon: Users },
  { key: 'address', label: '地址管理', icon: MapPin },
  { key: 'auth', label: '授权与同意书', icon: FileSignature },
  { key: 'reminder', label: '用药提醒', icon: AlarmClock },
  { key: 'guide', label: '使用指南', icon: BookOpen },
  { key: 'about', label: '关于我们', icon: Info },
  { key: 'service', label: '联系客服', icon: Headphones },
  { key: 'account', label: '账号设置', icon: Settings },
] as const

function SectionHeader({ id, title, action }: { id: string; title: string; action: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 id={id} className="text-[15px] font-semibold text-foreground">
        {title}
      </h2>
      <button type="button" className="flex items-center text-[12px] text-muted-foreground">
        {action}
        <ChevronRight className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export function MineScreen({ initialAuthOpen = false }: { initialAuthOpen?: boolean }) {
  const [authOpen, setAuthOpen] = useState(initialAuthOpen)
  const [orderTab, setOrderTab] = useState<OrderTabKey>('all')
  const self = initialExaminees[0]
  const activeTab = orderTabs.find((t) => t.key === orderTab) ?? orderTabs[0]
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
          <button type="button" className="flex w-full items-center gap-3 px-1 text-left">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-sm">
              <UserRound className="size-7" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[18px] font-semibold text-foreground">{self.name}</span>
              <span className="mt-0.5 block text-[12px] tabular-nums text-muted-foreground">{maskedPhone}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">进入个人资料</span>
          </button>
        </section>

        {/* 我的订单 */}
        <section aria-labelledby="mine-orders" className="mt-4 rounded-2xl bg-white pb-3 pt-3.5">
          <div className="px-3.5">
            <SectionHeader id="mine-orders" title="我的订单" action="查看全部" />
            <div role="tablist" aria-label="订单类型" className="mt-2 flex gap-5 border-b border-[#eef2f8]">
              {orderTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={orderTab === t.key}
                  onClick={() => setOrderTab(t.key)}
                  className={cn(
                    'relative h-9 text-[13px] transition-colors',
                    orderTab === t.key ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t.label}
                  {orderTab === t.key && (
                    <span className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-primary" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <ul role="tabpanel" aria-label={activeTab.label} className="mt-3 grid grid-cols-4 gap-y-3.5 px-1.5">
            {activeTab.statuses.map((key) => {
              const s = statusMeta[key]
              return (
                <li key={key}>
                  <button type="button" className="flex w-full flex-col items-center gap-1.5">
                    <span className="relative flex size-10 items-center justify-center rounded-full bg-[#eef5ff]">
                      <s.icon className="size-5 text-primary" strokeWidth={1.7} aria-hidden="true" />
                      {s.count ? (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f07a2c] px-1 text-[10px] font-medium tabular-nums text-white ring-2 ring-white">
                          {s.count}
                          <span className="sr-only">笔</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="text-[12px] text-foreground">{s.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* 售后订单 / 已关闭 */}
          <div className="mx-3.5 mt-3.5 flex items-center rounded-xl bg-[#f8fafe] py-2.5 pl-3">
            <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-foreground">
              <RotateCcw className="size-3.5 text-[#f07a2c]" aria-hidden="true" />
              售后
            </span>
            <ul aria-label="售后订单" className="flex min-w-0 flex-1">
              {afterSales.map((a) => (
                <li key={a.key} className="flex-1 border-l border-[#e3eaf4] first:ml-3">
                  <button type="button" className="flex w-full items-center justify-center gap-1 whitespace-nowrap text-[12px] text-foreground">
                    {a.label.replace('订单', '')}
                    {a.count > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f07a2c] px-1 text-[10px] tabular-nums text-white">
                        {a.count}
                        <span className="sr-only">笔处理中</span>
                      </span>
                    )}
                  </button>
                </li>
              ))}
              <li className="flex-1 border-l border-[#e3eaf4]">
                <button type="button" className="flex w-full items-center justify-center gap-1 whitespace-nowrap text-[12px] text-muted-foreground">
                  <Ban className="size-3.5" aria-hidden="true" />
                  已关闭
                </button>
              </li>
            </ul>
          </div>
        </section>

        {/* 我的报告 */}
        <section aria-labelledby="mine-report" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <SectionHeader id="mine-report" title="我的报告" action="报告列表" />
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#eef5ff] to-[#f8fbff] p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
              <FileText className="size-5" aria-hidden="true" />
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
          <button type="button" className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 text-left">
            <TicketPercent className="size-6 shrink-0 text-[#f07a2c]" strokeWidth={1.6} aria-hidden="true" />
            <span>
              <span className="block text-[14px] font-medium text-foreground">我的优惠券</span>
              <span className="block text-[11px] text-muted-foreground">
                <span className="tabular-nums text-[#f07a2c]">2</span> 张可用
              </span>
            </span>
          </button>
          <button type="button" className="flex items-center gap-2.5 rounded-2xl bg-white p-3.5 text-left">
            <Gift className="size-6 shrink-0 text-[#f07a2c]" strokeWidth={1.6} aria-hidden="true" />
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
                  onClick={() => t.key === 'auth' && setAuthOpen(true)}
                  className="flex w-full flex-col items-center gap-1.5"
                >
                  <t.icon className="size-6 text-primary" strokeWidth={1.6} aria-hidden="true" />
                  <span className="text-[12px] text-foreground">{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {authOpen && <AuthorizationScreen onBack={() => setAuthOpen(false)} />}
    </div>
  )
}
