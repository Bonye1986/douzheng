'use client'

import { useState } from 'react'
import {
  AlarmClock,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  FileSignature,
  FileText,
  FlaskConical,
  Gift,
  Headphones,
  Info,
  MapPin,
  RotateCcw,
  Settings,
  Sparkles,
  TestTube,
  TicketPercent,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { AuthorizationScreen } from '@/components/mini/authorization-screen'
import { ResampleScreen } from '@/components/mini/resample-screen'
import { OrderListScreen, countOrders, type OrderPhase } from '@/components/mini/order-list-screen'
import { initialExaminees } from '@/components/mini/checkout-data'

/**
 * 面向用户的 5 个阶段，后台细分状态归并其中：
 * 待采样 = 待发货 / 已发货 / 待核销 / 待采样；检测中 = 已寄样 / 已收样 / 检测中；
 * 售后 = 样本不合格待处理 + 退款。订单类型（自采样 / 定点采样）与已关闭订单在订单列表中筛选。
 */
const orderPhases: { key: Exclude<OrderPhase, 'all' | 'closed'>; label: string; icon: LucideIcon }[] = [
  { key: 'toPay', label: '待付款', icon: Wallet },
  { key: 'toSample', label: '待采样', icon: TestTube },
  { key: 'testing', label: '检测中', icon: FlaskConical },
  { key: 'done', label: '已完成', icon: BadgeCheck },
  { key: 'after', label: '退款/售后', icon: RotateCcw },
]

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
}: {
  initialAuthOpen?: boolean
  initialResampleOpen?: boolean
}) {
  const [authOpen, setAuthOpen] = useState(initialAuthOpen)
  const [resampleOpen, setResampleOpen] = useState(initialResampleOpen)
  const [orderListPhase, setOrderListPhase] = useState<OrderPhase | null>(null)
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
            <SectionHeader
              id="mine-orders"
              title="我的订单"
              action="查看全部"
              onAction={() => setOrderListPhase('all')}
            />
          </div>
          <ul className="mt-4 grid grid-cols-5 px-1">
            {orderPhases.map((p) => {
              const count = countOrders(p.key)
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => setOrderListPhase(p.key)}
                    className="flex w-full flex-col items-center gap-1.5"
                  >
                    <span className="relative">
                      <p.icon className="size-6 text-primary" strokeWidth={1.6} aria-hidden="true" />
                      {count > 0 && (
                        <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f07a2c] px-1 text-[10px] font-medium tabular-nums text-white ring-2 ring-white">
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

      {orderListPhase && (
        <OrderListScreen
          initialPhase={orderListPhase}
          onBack={() => setOrderListPhase(null)}
          onHandleUnqualified={() => setResampleOpen(true)}
        />
      )}
      {authOpen && <AuthorizationScreen onBack={() => setAuthOpen(false)} />}
      {resampleOpen && <ResampleScreen onBack={() => setResampleOpen(false)} />}
    </div>
  )
}
