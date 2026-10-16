'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { LegalDocScreen, type LegalDocKind } from '@/components/mini/legal-doc-screen'
import { cn } from '@/lib/utils'

export function BrandMark({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative shrink-0', size === 'lg' ? 'size-16' : 'size-11', className)}
    >
      <Image src="/images/drugene-icon.png" alt="" fill sizes="64px" className="object-contain" />
    </div>
  )
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/drugene-logo.png"
      alt="DRUGENE 临床精准用药助手"
      width={436}
      height={147}
      className={cn('h-auto w-[180px]', className)}
    />
  )
}

export function Agreement({
  checked,
  onChange,
  tone = 'dark',
  highlight = false,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  tone?: 'light' | 'dark'
  highlight?: boolean
}) {
  const isLight = tone === 'light'
  const [doc, setDoc] = useState<LegalDocKind | null>(null)
  const linkClass = cn('mx-0.5', isLight ? 'text-white' : 'text-primary')
  return (
    <>
    <div
      className={cn(
        'flex items-start gap-2 text-[12px] leading-5 transition-transform',
        isLight ? 'text-white/70' : 'text-muted-foreground',
        highlight && 'animate-[shake_0.4s_ease-in-out]',
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label="同意用户协议与隐私政策"
        onClick={() => onChange(!checked)}
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          checked
            ? 'border-primary bg-primary text-white'
            : isLight
              ? 'border-white/60'
              : 'border-[#b8c2d6] bg-white',
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </button>
      <p>
        我已阅读并同意
        <button type="button" onClick={() => setDoc('terms')} className={linkClass}>
          《用户服务协议》
        </button>
        和
        <button type="button" onClick={() => setDoc('privacy')} className={linkClass}>
          《隐私政策》
        </button>
      </p>
    </div>
    {doc && <LegalDocScreen kind={doc} onBack={() => setDoc(null)} />}
    </>
  )
}

export function FieldRow({
  icon,
  children,
  trailing,
  error,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  trailing?: React.ReactNode
  error?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10',
        error ? 'border-destructive' : 'border-border',
      )}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div className="flex min-w-0 flex-1 items-center">{children}</div>
      {trailing}
    </div>
  )
}

export const inputClass =
  'h-full w-full min-w-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-[#a3adc2]'

export function PrimaryButton({
  children,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[16px] font-medium text-white shadow-[0_10px_24px_#3b8beb38] transition-all active:scale-[0.98] disabled:bg-[#b5d3f6] disabled:shadow-none',
        className,
      )}
    >
      {children}
    </button>
  )
}
