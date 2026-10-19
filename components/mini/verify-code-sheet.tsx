'use client'

import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { MapPin, X } from 'lucide-react'

type VerifyCodeSheetProps = {
  orderNo: string
  product: string
  examinees: string
  siteName?: string
  onClose: () => void
}

export function toVerifyCode(orderNo: string) {
  const digits = orderNo.replace(/\D/g, '')
  const seed = digits.slice(-8).padStart(8, '0')
  const mixed = Array.from(seed, (c, i) => (Number(c) * 7 + i * 3) % 10).join('')
  return `${mixed.slice(0, 4)} ${mixed.slice(4, 8)} ${digits.slice(-4)}`
}

export function VerifyCodeSheet({ orderNo, product, examinees, siteName, onClose }: VerifyCodeSheetProps) {
  const code = toVerifyCode(orderNo)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-code-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[300px] rounded-2xl bg-white px-5 pb-5 pt-6 text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-muted-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <h2 id="verify-code-title" className="text-[16px] font-semibold text-foreground">
          核销码
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground">请向采样机构工作人员出示</p>

        <div className="mx-auto mt-4 w-fit rounded-xl border border-[#e6ebf3] p-3">
          <QRCodeSVG value={`DZVERIFY:${orderNo}:${code.replace(/\s/g, '')}`} size={168} level="M" />
        </div>
        <p className="mt-3 font-mono text-[20px] font-semibold tracking-widest tabular-nums text-foreground">{code}</p>

        <dl className="mt-4 space-y-1.5 rounded-xl bg-muted px-3 py-2.5 text-left text-[12px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">检测项目</dt>
            <dd className="truncate text-foreground">{product}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">受检人</dt>
            <dd className="text-foreground">{examinees}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">订单编号</dt>
            <dd className="tabular-nums text-foreground">{orderNo}</dd>
          </div>
        </dl>
        {siteName && (
          <p className="mt-3 flex items-center justify-center gap-1 text-[12px] text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {siteName}
          </p>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">核销码有效期 30 天，请勿截图转发他人</p>
      </div>
    </div>
  )
}
