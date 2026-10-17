'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Aperture, Check, Circle, Ellipsis, ImageIcon, Link2, LoaderCircle, QrCode, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'
import { WechatIcon } from '@/components/mini/wechat-icon'

export type ShareItem = { id: number; role: 'user' | 'assistant'; text: string }

export function ShareCheckbox({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors',
        checked ? 'border-primary bg-primary text-white' : 'border-[#c3cddc] bg-white',
        className,
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </span>
  )
}

export function ShareHeader({
  allSelected,
  rounds,
  onToggleAll,
}: {
  allSelected: boolean
  rounds: number
  onToggleAll: () => void
}) {
  return (
    <header className="relative flex h-11 items-center justify-center px-2 text-foreground">
      <button
        type="button"
        role="checkbox"
        aria-checked={allSelected}
        onClick={onToggleAll}
        className="absolute left-3 flex items-center gap-2 rounded-lg py-1 pr-2 text-[14px] text-muted-foreground"
      >
        <ShareCheckbox checked={allSelected} />
        全选
      </button>
      <h2 className="text-[16px] font-semibold" aria-live="polite">
        已选中 {rounds} 轮对话
      </h2>
      <div
        aria-hidden="true"
        className="absolute right-3 flex h-8 items-center gap-3 rounded-full border border-border bg-white/80 px-3"
      >
        <Ellipsis className="size-4" />
        <span className="h-4 w-px bg-border" />
        <Circle className="size-3.5" strokeWidth={3} />
      </div>
    </header>
  )
}

type Overlay = 'qrcode' | 'poster' | null

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}

export function ShareSheet({ items, onClose }: { items: ShareItem[]; onClose: () => void }) {
  const url = `https://yaowen.example.com/share/${items.map((i) => i.id).join('-') || 'empty'}`
  return (
    <ShareSheetBase
      url={url}
      empty={items.length === 0}
      onClose={onClose}
      qrCard={<QrCard url={url} title="药问基因 · AI 咨询" hint="微信扫一扫，查看分享的对话" footnote="内容由 AI 生成，仅供参考" />}
      poster={<PosterCard items={items} url={url} />}
    />
  )
}

export function ShareSheetBase({
  url: shareUrl,
  empty = false,
  notice,
  qrCard,
  poster,
  onClose,
}: {
  url: string
  empty?: boolean
  notice?: ReactNode
  qrCard: ReactNode
  poster: ReactNode
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms))
  }

  function flash(text: string) {
    setToast(text)
    later(() => setToast(null), 1600)
  }

  function withLoading(fn: () => void) {
    if (empty) return flash('请至少选择一条内容')
    setLoading(true)
    later(() => {
      setLoading(false)
      fn()
    }, 700)
  }

  const options: { key: string; label: string; icon: ReactNode; onClick: () => void }[] = [
    {
      key: 'friend',
      label: '微信好友',
      icon: <WechatIcon className="size-7 text-[#07c160]" />,
      onClick: () => withLoading(() => flash('已唤起微信，选择好友发送')),
    },
    {
      key: 'moments',
      label: '朋友圈',
      icon: <Aperture className="size-7 text-[#3b82f6]" />,
      onClick: () => withLoading(() => flash('已生成朋友圈分享卡片')),
    },
    {
      key: 'link',
      label: '复制链接',
      icon: <Link2 className="size-6 text-[#5b6b82]" />,
      onClick: async () => {
        if (empty) return flash('请至少选择一条内容')
        flash((await copyToClipboard(shareUrl)) ? '链接已复制' : '复制失败')
      },
    },
    {
      key: 'qrcode',
      label: '二维码',
      icon: <QrCode className="size-6 text-[#5b6b82]" />,
      onClick: () => withLoading(() => setOverlay('qrcode')),
    },
    {
      key: 'poster',
      label: '生成图片',
      icon: <ImageIcon className="size-6 text-[#5b6b82]" />,
      onClick: () => withLoading(() => setOverlay('poster')),
    },
  ]

  return (
    <>
      <div
        role="dialog"
        aria-labelledby="share-sheet-title"
        className="relative z-10 shrink-0 rounded-t-3xl bg-[#f7f8fa] px-4 pb-8 pt-4 shadow-[0_-6px_24px_#1e2a3d14] animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center justify-between">
          <h2 id="share-sheet-title" className="text-[16px] font-semibold text-foreground">
            分享到
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="取消分享"
            className="flex size-8 items-center justify-center rounded-full text-foreground active:bg-white"
          >
            <X className="size-5" />
          </button>
        </div>
        {notice}
        <ul className="mt-4 grid grid-cols-5 gap-1">
          {options.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                onClick={o.onClick}
                disabled={loading}
                className={cn(
                  'flex w-full flex-col items-center gap-2 rounded-xl py-1 transition-opacity active:opacity-60',
                  empty && 'opacity-40',
                )}
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-white">{o.icon}</span>
                <span className="text-[12px] text-muted-foreground">{o.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {(loading || toast) && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center" role="status">
          <div className="flex min-w-28 flex-col items-center gap-2 rounded-2xl bg-[#1e2a3d]/85 px-5 py-4 text-[13px] text-white">
            {loading ? (
              <>
                <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
                加载中...
              </>
            ) : (
              toast
            )}
          </div>
        </div>
      )}

      {overlay && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setOverlay(null)}
            className="absolute inset-0 bg-[#1e2a3d]/55"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={overlay === 'qrcode' ? '分享二维码' : '分享图片预览'}
            className="relative flex max-h-full w-full max-w-[300px] flex-col animate-in zoom-in-95 fade-in duration-200"
          >
            {overlay === 'qrcode' ? qrCard : poster}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setOverlay(null)}
                className="h-10 flex-1 rounded-full bg-white/90 text-[14px] text-foreground"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  setOverlay(null)
                  flash('已保存到相册')
                }}
                className="h-10 flex-1 rounded-full bg-primary text-[14px] font-medium text-white"
              >
                保存图片
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function QrCard({ url, title, hint, footnote }: { url: string; title: string; hint: string; footnote: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-7 text-center">
      <strong className="text-[16px] font-semibold text-foreground">{title}</strong>
      <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
      <div className="mt-5 rounded-xl border border-border p-3">
        <QRCodeSVG value={url} size={168} fgColor="#1e2a3d" />
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">{footnote}</p>
    </div>
  )
}

function PosterCard({ items, url }: { items: ShareItem[]; url: string }) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[#f3f7fd]">
      <div className="bg-primary px-4 py-3 text-white">
        <strong className="block text-[15px] font-semibold">药问基因 · AI 咨询</strong>
        <span className="text-[11px] text-white/80">内容由 AI 生成，仅供参考</span>
      </div>
      <ul className="flex max-h-[46vh] flex-col gap-2.5 overflow-y-auto p-3 [scrollbar-width:none]">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              'whitespace-pre-line rounded-xl px-3 py-2 text-[12px] leading-5',
              item.role === 'user' ? 'ml-8 bg-primary text-white' : 'mr-4 bg-white text-foreground',
            )}
          >
            {item.text}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 border-t border-[#dbe5f3] bg-white px-4 py-3">
        <QRCodeSVG value={url} size={44} fgColor="#1e2a3d" />
        <span className="text-[11px] leading-4 text-muted-foreground">长按识别二维码<br />查看完整对话</span>
      </div>
    </div>
  )
}
