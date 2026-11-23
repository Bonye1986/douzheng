'use client'

import { ShieldCheck } from 'lucide-react'

type Props = {
  desc: string
  skipLabel?: string
  onVerify: () => void
  onSkip: () => void
}

export function RealNameGuideDialog({ desc, skipLabel = '暂不认证', onVerify, onSkip }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-8">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="realname-guide-title"
        aria-describedby="realname-guide-desc"
        className="w-full rounded-2xl bg-white px-5 pb-4 pt-5 text-center motion-safe:animate-in motion-safe:zoom-in-95"
      >
        <span
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary"
          aria-hidden="true"
        >
          <ShieldCheck className="size-6" />
        </span>
        <h2 id="realname-guide-title" className="mt-3 text-title font-semibold text-foreground">
          完成本人实名认证
        </h2>
        <p id="realname-guide-desc" className="mt-1.5 text-note leading-5 text-muted-foreground">
          {desc}
        </p>
        <button
          type="button"
          onClick={onVerify}
          className="mt-4 h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
        >
          去认证
        </button>
        <button type="button" onClick={onSkip} className="mt-1 h-9 w-full text-note text-muted-foreground">
          {skipLabel}
        </button>
      </div>
    </div>
  )
}
