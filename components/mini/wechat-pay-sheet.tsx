'use client'

import { useRef, useState } from 'react'
import { Check, ChevronRight, Delete, Loader2, Wallet, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 'confirm' | 'password' | 'processing' | 'success'

type Props = {
  amount: number
  merchant?: string
  onCancel: () => void
  onSuccess: () => void
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const

export function WechatPaySheet({ amount, merchant = '精准用药 · 基因检测服务', onCancel, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('confirm')
  const [pwd, setPwd] = useState('')
  const pwdRef = useRef('')
  const timers = useRef<number[]>([])
  const amountText = amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const press = (k: (typeof keys)[number]) => {
    if (step !== 'password' || k === '') return
    if (k === 'del') {
      pwdRef.current = pwdRef.current.slice(0, -1)
      setPwd(pwdRef.current)
      return
    }
    if (pwdRef.current.length >= 6) return
    const next = pwdRef.current + k
    pwdRef.current = next
    setPwd(next)
    if (next.length === 6) {
      timers.current.push(
        window.setTimeout(() => setStep('processing'), 200),
        window.setTimeout(() => setStep('success'), 1600),
        window.setTimeout(onSuccess, 2600),
      )
    }
  }

  const cancel = () => {
    if (step === 'processing' || step === 'success') return
    timers.current.forEach(clearTimeout)
    onCancel()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wxpay-title"
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50 motion-safe:animate-in motion-safe:fade-in"
    >
      <button type="button" aria-label="取消支付" onClick={cancel} className="flex-1 cursor-default" tabIndex={-1} />

      <div className="rounded-t-2xl bg-white motion-safe:animate-in motion-safe:slide-in-from-bottom">
        <div className="relative flex h-12 items-center justify-center border-b border-[#f0f0f0]">
          {step !== 'processing' && step !== 'success' && (
            <button
              type="button"
              onClick={cancel}
              aria-label="关闭"
              className="absolute left-2 flex size-9 items-center justify-center rounded-full text-[#333]"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          )}
          <h2 id="wxpay-title" className="text-[15px] font-medium text-[#1a1a1a]">
            {step === 'password' ? '请输入支付密码' : '微信支付'}
          </h2>
        </div>

        {(step === 'confirm' || step === 'password') && (
          <div className="px-6 pb-5 pt-5 text-center">
            <p className="text-[13px] text-[#666]">{merchant}</p>
            <p className="mt-1.5 font-semibold tabular-nums text-[#1a1a1a]">
              <span className="text-[22px]">¥</span>
              <span className="text-[36px] leading-none">{amountText}</span>
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-[#f0f0f0] pt-3.5 text-[13px]">
              <span className="text-[#888]">支付方式</span>
              <span className="flex items-center gap-1.5 text-[#1a1a1a]">
                <span className="flex size-4 items-center justify-center rounded bg-[#07c160]">
                  <Wallet className="size-2.5 text-white" aria-hidden="true" />
                </span>
                零钱
                <ChevronRight className="size-3.5 text-[#bbb]" aria-hidden="true" />
              </span>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="px-6 pb-8">
            <button
              type="button"
              onClick={() => setStep('password')}
              className="h-11 w-full rounded-lg bg-[#07c160] text-[16px] font-medium text-white active:bg-[#06ad56]"
            >
              确认支付
            </button>
          </div>
        )}

        {step === 'password' && (
          <>
            <div className="flex justify-center px-6 pb-5" aria-label={`已输入 ${pwd.length} 位，共 6 位`}>
              <div className="grid h-11 w-full max-w-[276px] grid-cols-6 divide-x divide-[#e5e5e5] rounded-md border border-[#e5e5e5]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="flex items-center justify-center" aria-hidden="true">
                    {i < pwd.length && <span className="size-2.5 rounded-full bg-[#1a1a1a]" />}
                  </span>
                ))}
              </div>
            </div>
            <p className="pb-3 text-center text-[11px] text-[#a0a0a0]">演示环境，输入任意 6 位数字即可</p>
            <div className="grid grid-cols-3 gap-px bg-[#e6e6e6] pb-6">
              {keys.map((k, i) =>
                k === '' ? (
                  <span key={i} className="h-[52px] bg-[#d2d5db]" aria-hidden="true" />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => press(k)}
                    aria-label={k === 'del' ? '删除' : k}
                    className={cn(
                      'flex h-[52px] items-center justify-center text-[22px] text-[#1a1a1a]',
                      k === 'del' ? 'bg-[#d2d5db] active:bg-white' : 'bg-white active:bg-[#d2d5db]',
                    )}
                  >
                    {k === 'del' ? <Delete className="size-5" aria-hidden="true" /> : k}
                  </button>
                ),
              )}
            </div>
          </>
        )}

        {(step === 'processing' || step === 'success') && (
          <div className="flex flex-col items-center px-6 pb-12 pt-10" aria-live="polite">
            {step === 'processing' ? (
              <Loader2 className="size-12 animate-spin text-[#07c160]" aria-hidden="true" />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-full bg-[#07c160] motion-safe:animate-in motion-safe:zoom-in">
                <Check className="size-7 text-white" strokeWidth={3} aria-hidden="true" />
              </span>
            )}
            <p className="mt-4 text-[15px] text-[#1a1a1a]">{step === 'processing' ? '正在支付…' : '支付成功'}</p>
            <p className="mt-1 text-[13px] tabular-nums text-[#888]">¥{amountText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
