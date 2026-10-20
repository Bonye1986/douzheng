'use client'

import { useState } from 'react'
import { Check, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandMark } from './auth-parts'
import { WelcomeScreen } from './welcome-screen'

export function WechatAuthScreen({ onAllow, onDeny }: { onAllow?: () => void; onDeny?: () => void }) {
  const [selected, setSelected] = useState(0)
  const [result, setResult] = useState<'' | 'allowed' | 'denied'>('')

  const respond = (next: 'allowed' | 'denied') => {
    setResult(next)
    const callback = next === 'allowed' ? onAllow : onDeny
    if (callback) window.setTimeout(callback, next === 'denied' ? 0 : 700)
  }

  if (result === 'denied' && !onDeny) {
    return (
      <WelcomeScreen
        defaultAgreed
        notice="需授权手机号才能登录，请重新点击授权"
        noticeDuration={2500}
        onWechatLogin={() => setResult('')}
      />
    )
  }

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
          <BrandMark className="size-7 rounded-lg text-note shadow-none" />
          <span className="text-body font-medium">药问基因</span>
          <span className="text-note text-muted-foreground">申请</span>
          <Info className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
        </div>

        <h2 id="wx-auth-title" className="mt-5 text-heading font-semibold text-[#191919]">
          获取你的手机号
        </h2>
        <p className="mt-1.5 text-body text-[#9e9e9e]">用于登录账号、接收检测进度与报告通知</p>

        <ul className="mt-4 border-t border-[#ededed]" role="radiogroup" aria-label="选择手机号">
          {['138****2608', '186****0417'].map((number, index) => (
            <li key={number} className="border-b border-[#ededed]">
              <button
                type="button"
                role="radio"
                aria-checked={selected === index}
                onClick={() => setSelected(index)}
                className="flex w-full items-center py-3.5 text-left"
              >
                <span className="flex-1">
                  <span className="block text-heading text-[#191919]">{number}</span>
                  <span className="mt-0.5 block text-caption text-[#9e9e9e]">
                    {index === 0 ? '微信绑定号码' : '上次提供'}
                  </span>
                </span>
                <Check
                  className={cn('size-5 text-[#07c160]', selected === index ? 'opacity-100' : 'opacity-0')}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-3.5 text-title text-[#576b95]">
          使用其它手机号码
        </button>

        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => respond('denied')}
            className="h-10 w-[120px] rounded-lg bg-[#f2f2f2] text-title font-medium text-[#07c160]"
          >
            拒绝
          </button>
          <button
            type="button"
            onClick={() => respond('allowed')}
            className="h-10 w-[120px] rounded-lg bg-[#07c160] text-title font-medium text-white"
          >
            允许
          </button>
        </div>
  {result === 'allowed' && (
  <p role="status" className="mt-3 text-center text-caption text-muted-foreground">
  授权成功，正在登录…
  </p>
  )}
      </div>
    </div>
  )
}
