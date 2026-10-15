'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ClipboardList,
  FileSignature,
  FileText,
  FlaskConical,
  Headphones,
  MapPin,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  TicketPercent,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { AuthorizationScreen } from '@/components/mini/authorization-screen'
import { examineeMeta, initialExaminees, initialResearchAuths } from '@/components/mini/checkout-data'

const orderStatus = [
  { key: 'unpaid', label: '待支付', icon: Wallet, count: 1 },
  { key: 'shipping', label: '待寄回样本', icon: Package, count: 1 },
  { key: 'testing', label: '检测中', icon: FlaskConical, count: 2 },
  { key: 'done', label: '已出报告', icon: FileText, count: 0 },
] as const

const signedCount = initialResearchAuths.filter((a) => a.status === 'signed').length

const services = [
  { key: 'auth', label: '授权管理', icon: FileSignature, extra: `${signedCount} 项已授权` },
  { key: 'address', label: '地址管理', icon: MapPin },
  { key: 'coupon', label: '我的优惠券', icon: TicketPercent, extra: '2 张可用' },
  { key: 'service', label: '联系客服', icon: Headphones, extra: '9:00–21:00' },
  { key: 'settings', label: '设置', icon: Settings },
] as const

const avatarTone = ['bg-[#e8f1fe] text-primary', 'bg-[#fdeef3] text-[#e05a86]', 'bg-[#fff4e8] text-[#f07a2c]']

export function MineScreen({ initialAuthOpen = false }: { initialAuthOpen?: boolean }) {
  const [authOpen, setAuthOpen] = useState(initialAuthOpen)
  const self = initialExaminees[0]

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
        <section aria-label="个人信息" className="flex items-center gap-3 px-1">
          <span className="flex size-14 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-sm">
            <UserRound className="size-7" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-semibold text-foreground">{self.name}</p>
            <p className="mt-0.5 text-[12px] tabular-nums text-muted-foreground">{self.phone}</p>
          </div>
          <button type="button" className="flex items-center text-[12px] text-muted-foreground">
            个人资料
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </section>

        <section aria-labelledby="mine-orders" className="mt-4 rounded-2xl bg-white px-3.5 pb-3 pt-3.5">
          <div className="flex items-center justify-between">
            <h2 id="mine-orders" className="text-[15px] font-semibold text-foreground">我的订单</h2>
            <button type="button" className="flex items-center text-[12px] text-muted-foreground">
              全部订单
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-3 flex">
            {orderStatus.map((s) => (
              <li key={s.key} className="flex-1">
                <button type="button" className="flex w-full flex-col items-center gap-1.5">
                  <span className="relative">
                    <s.icon className="size-6 text-primary" strokeWidth={1.6} aria-hidden="true" />
                    {s.count > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f07a2c] px-1 text-[10px] font-medium tabular-nums text-white">
                        {s.count}
                        <span className="sr-only">笔</span>
                      </span>
                    )}
                  </span>
                  <span className="text-[12px] text-foreground">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="mine-progress" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="size-4 text-primary" aria-hidden="true" />
            <h2 id="mine-progress" className="text-[13px] font-semibold text-foreground">检测进度</h2>
            <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">GX20261012008</span>
          </div>
          <p className="mt-2 text-[13px] text-foreground">心脑血管用药基因检测 · 王建国</p>
          <ol className="mt-3 flex items-center" aria-label="当前进度：实验室检测中">
            {['已下单', '样本已签收', '检测中', '出报告'].map((step, i) => {
              const done = i < 2
              const current = i === 2
              return (
                <li key={step} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-center">
                    <span className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : done || current ? 'bg-primary' : 'bg-border'}`} />
                    <span
                      className={`size-2.5 rounded-full ${current ? 'bg-primary ring-4 ring-[#d6e7ff]' : done ? 'bg-primary' : 'bg-border'}`}
                    />
                    <span className={`h-0.5 flex-1 ${i === 3 ? 'invisible' : done ? 'bg-primary' : 'bg-border'}`} />
                  </div>
                  <span className={`text-[11px] ${current ? 'font-medium text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="mt-2.5 rounded-lg bg-[#f4f8fe] px-2.5 py-2 text-[11px] text-muted-foreground">
            预计 10 月 19 日前出具报告，出报告后将通过微信服务通知提醒您
          </p>
        </section>

        <section aria-labelledby="mine-members" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <div className="flex items-center justify-between">
            <h2 id="mine-members" className="text-[15px] font-semibold text-foreground">
              受检人档案
              <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">{initialExaminees.length} 人</span>
            </h2>
            <button type="button" className="flex items-center text-[12px] text-muted-foreground">
              管理
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {initialExaminees.map((m, i) => (
              <li key={m.id} className="shrink-0">
                <button type="button" className="flex w-[92px] flex-col items-center rounded-xl bg-[#f8fafe] px-2 py-2.5">
                  <span className={`flex size-9 items-center justify-center rounded-full text-[14px] font-semibold ${avatarTone[i % avatarTone.length]}`}>
                    {m.name.slice(-1)}
                  </span>
                  <span className="mt-1.5 text-[13px] font-medium text-foreground">{m.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {m.relation} · {examineeMeta(m).split(' · ')[1]}
                  </span>
                </button>
              </li>
            ))}
            <li className="shrink-0">
              <button
                type="button"
                className="flex h-full w-[92px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#c9d4e6] text-[12px] text-muted-foreground"
              >
                <Plus className="size-5" aria-hidden="true" />
                添加
              </button>
            </li>
          </ul>
        </section>

        <nav aria-label="常用服务" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <ul>
            {services.map((item) => (
              <li key={item.key} className="border-b border-border last:border-0">
                <button
                  type="button"
                  onClick={() => item.key === 'auth' && setAuthOpen(true)}
                  className="flex h-12 w-full items-center gap-2.5 text-left"
                >
                  <item.icon className="size-[18px] text-primary" aria-hidden="true" />
                  <span className="text-[14px] text-foreground">{item.label}</span>
                  <span className="ml-auto text-[12px] text-muted-foreground">{'extra' in item ? item.extra : ''}</span>
                  <ChevronRight className="size-4 text-[#b8c2d6]" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-[#a9b3c6]">
          <ShieldCheck className="size-3" aria-hidden="true" />
          基因数据加密存储，仅本人及授权成员可查看
        </p>
      </div>

      {authOpen && <AuthorizationScreen onBack={() => setAuthOpen(false)} />}
    </div>
  )
}
