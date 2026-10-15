'use client'

import { useState } from 'react'
import { ChevronRight, FileSignature, Headphones, MapPin, ReceiptText, UserRound, Users } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { AuthorizationScreen } from '@/components/mini/authorization-screen'
import { initialExaminees } from '@/components/mini/checkout-data'

const menu = [
  { key: 'orders', label: '我的订单', icon: ReceiptText },
  { key: 'members', label: '受检人管理', icon: Users, extra: `${initialExaminees.length} 人` },
  { key: 'address', label: '地址管理', icon: MapPin },
  { key: 'auth', label: '授权管理', icon: FileSignature, extra: '科研样本授权' },
  { key: 'service', label: '联系客服', icon: Headphones },
] as const

export function MineScreen({ initialAuthOpen = false }: { initialAuthOpen?: boolean }) {
  const [authOpen, setAuthOpen] = useState(initialAuthOpen)
  const self = initialExaminees[0]

  return (
    <div className="relative flex h-full flex-col bg-[#f4f8fe]">
      <StatusBar />
      <header className="relative flex h-11 shrink-0 items-center justify-center">
        <h1 className="text-[17px] font-semibold text-foreground">我的</h1>
        <Capsule className="absolute right-3" />
      </header>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2 [scrollbar-width:none]">
        <section className="flex items-center gap-3 rounded-2xl bg-white p-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#e8f1fe] text-primary">
            <UserRound className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[16px] font-semibold text-foreground">{self.name}</p>
            <p className="mt-0.5 text-[12px] tabular-nums text-muted-foreground">{self.phone}</p>
          </div>
        </section>
        <nav aria-label="个人中心菜单" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <ul>
            {menu.map((item) => (
              <li key={item.key} className="border-b border-border last:border-0">
                <button
                  type="button"
                  onClick={() => item.key === 'auth' && setAuthOpen(true)}
                  className="flex h-12 w-full items-center gap-2.5 text-left"
                >
                  <item.icon className="size-[18px] text-primary" aria-hidden="true" />
                  <span className="text-[14px] text-foreground">{item.label}</span>
                  {'extra' in item && <span className="ml-auto text-[12px] text-muted-foreground">{item.extra}</span>}
                  <ChevronRight className={`size-4 text-[#b8c2d6] ${'extra' in item ? '' : 'ml-auto'}`} aria-hidden="true" />
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
