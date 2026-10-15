'use client'

import { useState } from 'react'
import { Check, CircleUserRound, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandMark } from './auth-parts'
import { WelcomeScreen } from './welcome-screen'

export function WechatAuthScreen() {
  const [selected, setSelected] = useState(0)
  const [result, setResult] = useState<'' | 'allowed' | 'denied'>('')

  return (
    <div className="relative h-full">
      <div aria-hidden="true" inert className="h-full">
        <WelcomeScreen defaultAgreed />
      </div>
      <div className="absolute inset-0 z-20 bg-black/50" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wx-auth-title"
        className="absolute inset-x-0 bottom-0 z-30 rounded-t-[20px] bg-white px-5 pb-8 pt-5 text-foreground"
      >
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-7 rounded-lg text-[13px] shadow-none" />
          <span className="text-[14px] font-medium">药问基因</span>
          <span className="text-[13px] text-muted-foreground">申请</span>
          <Info className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
        </div>

        <h2 id="wx-auth-title" className="mt-5 text-[17px] font-bold">
          获取你的手机号
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">用于登录账号、接收检测进度与报告通知</p>

        <ul className="mt-5 divide-y divide-border border-y border-border" role="radiogroup" aria-label="选择手机号">
          {['138****2608', '186****0417'].map((number, index) => (
            <li key={number}>
              <button
                type="button"
                role="radio"
                aria-checked={selected === index}
                onClick={() => setSelected(index)}
                className="flex w-full items-center gap-3 py-4 text-left"
              >
                <CircleUserRound className="size-5 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-[16px] font-medium tracking-wide">{number}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {index === 0 ? '微信绑定号码' : '上次提供'}
                  </span>
                </span>
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full',
                    selected === index ? 'bg-primary text-primary-foreground' : 'border border-[#c8cdd6]',
                  )}
                >
                  {selected === index && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-3 text-[14px] text-[#576b95]">
          使用其他手机号码
        </button>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setResult('denied')}
            className="h-11 flex-1 rounded-lg bg-[#f2f2f2] text-[15px] font-medium text-primary"
          >
            拒绝
          </button>
          <button
            type="button"
            onClick={() => setResult('allowed')}
            className="h-11 flex-1 rounded-lg bg-primary text-[15px] font-medium text-primary-foreground"
          >
            允许
          </button>
        </div>
        {result && (
          <p role="status" className="mt-3 text-center text-[12px] text-muted-foreground">
            {result === 'allowed' ? '授权成功，正在登录…' : '需授权手机号才能登录，请重新授权'}
          </p>
        )}
      </div>
    </div>
  )
}
