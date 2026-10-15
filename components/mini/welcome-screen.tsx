'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CircleAlert, FileSearch, MessageCircleHeart, ShieldCheck, Smartphone } from 'lucide-react'
import { Agreement, BrandLogo } from './auth-parts'
import { NavBar, StatusBar } from './phone-frame'

const highlights = [
  { icon: FileSearch, label: '报告查询' },
  { icon: ShieldCheck, label: '隐私加密' },
  { icon: MessageCircleHeart, label: '用药咨询' },
]

export function WelcomeScreen({
  onWechatLogin,
  onCancel,
  defaultAgreed = false,
  notice,
}: {
  onWechatLogin?: () => void
  onCancel?: () => void
  defaultAgreed?: boolean
  notice?: string
}) {
  const [agreed, setAgreed] = useState(defaultAgreed)
  const [warn, setWarn] = useState(false)

  const guard = (action?: () => void) => () => {
    if (!agreed) {
      setWarn(false)
      requestAnimationFrame(() => setWarn(true))
      return
    }
    action?.()
  }

  return (
    <div className="relative flex h-full flex-col bg-navy text-foreground">
      <Image
        src="/images/login-hero-light.png"
        alt=""
        fill
        priority
        sizes="375px"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f4f8fe00_0%,#f4f8fe00_38%,#f4f8fee6_60%,#f4f8fe_100%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <StatusBar />
        <NavBar />

        <div className="flex flex-1 flex-col justify-end px-7 pb-8">
          <div className="mb-6">
            <BrandLogo />
          </div>

          <h1 className="text-balance text-[30px] font-bold leading-[1.3]">
            看懂基因，
            <br />
            <span className="text-primary">更好地了解用药</span>
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
            登录后即可预约检测、查询报告、获取个体化用药参考
          </p>

          <ul className="mt-6 flex gap-2">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-white/80 px-3 py-1.5 text-[12px] text-secondary-foreground backdrop-blur"
              >
                <Icon className="size-3.5 text-accent" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3">
            <button
              type="button"
              onClick={guard(onWechatLogin)}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[16px] font-medium text-primary-foreground shadow-[0_10px_24px_#3b8beb38] transition-transform active:scale-[0.98]"
            >
              <Smartphone className="size-[18px]" aria-hidden="true" />
              微信手机号快捷登录
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-12 items-center justify-center rounded-full border border-border bg-white text-[16px] font-medium text-muted-foreground transition-colors active:bg-secondary"
            >
              暂不登录
            </button>
            <p className="text-center text-[12px] text-muted-foreground">未注册的手机号授权后将自动创建账号</p>
          </div>

          {notice && (
            <div
              role="alert"
              className="pointer-events-none absolute inset-x-0 top-[42%] mx-auto flex w-fit max-w-[260px] flex-col items-center gap-2 rounded-xl bg-[#2a3a52]/80 px-5 py-4 text-center backdrop-blur"
            >
              <CircleAlert className="size-7 text-white" aria-hidden="true" />
              <p className="text-[14px] leading-5 text-white">{notice}</p>
            </div>
          )}

          <div className="mt-6">
            <Agreement checked={agreed} onChange={setAgreed} highlight={warn} />
            {warn && !agreed && (
              <p role="alert" className="mt-2 pl-6 text-[12px] text-destructive">
                请先阅读并勾选协议
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
