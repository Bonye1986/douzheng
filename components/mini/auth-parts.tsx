'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandMark({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#5aa6f5_0%,#3b8beb_55%,#5cc6d6_100%)] font-bold text-white shadow-[0_10px_30px_#3b8beb38]',
        size === 'lg' ? 'size-16 text-3xl' : 'size-11 text-xl',
        className,
      )}
    >
      D
    </div>
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
  return (
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
        <a href="#" className={cn('mx-0.5', isLight ? 'text-white' : 'text-primary')}>
          《用户服务协议》
        </a>
        和
        <a href="#" className={cn('mx-0.5', isLight ? 'text-white' : 'text-primary')}>
          《隐私政策》
        </a>
      </p>
    </div>
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
