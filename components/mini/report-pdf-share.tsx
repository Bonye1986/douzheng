'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Download, FileText, Link2, LoaderCircle, Search, ShieldAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WechatIcon } from '@/components/mini/wechat-icon'
import type { ReportSummary } from '@/components/mini/report-detail-screen'

type Step = 'sheet' | 'pick' | 'confirm'

type Chat = { id: string; name: string; color: string }

const recentChats: Chat[] = [
  { id: 'filehelper', name: '文件传输助手', color: 'bg-[#07c160]' },
  { id: 'family', name: '相亲相爱一家人', color: 'bg-[#f0883e]' },
  { id: 'doctor', name: '张医生（儿科）', color: 'bg-[#3b82f6]' },
  { id: 'spouse', name: '王建国', color: 'bg-[#8b5cf6]' },
  { id: 'mom', name: '妈妈', color: 'bg-[#e0567a]' },
]

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function FileCard({ name, size, className }: { name: string; size: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl bg-white p-3', className)}>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-all text-note font-medium leading-5 text-foreground">{name}</p>
        <p className="mt-1 text-caption tabular-nums text-muted-foreground">{size}</p>
      </div>
      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#e5484d] text-white">
        <FileText className="size-5" aria-hidden="true" />
        <span className="text-tag font-semibold leading-none">PDF</span>
      </span>
    </div>
  )
}

function Avatar({ chat }: { chat: Chat }) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg text-title font-medium text-white', chat.color)}
    >
      {chat.name.slice(0, 1)}
    </span>
  )
}

export function ReportPdfShare({ report, onClose }: { report: ReportSummary; onClose: () => void }) {
  const fileName = `${report.product}-${report.examinee}-${report.date}.pdf`
  const fileSize = '2.4 MB'
  const downloadUrl = `https://yaowen.example.com/report/${report.id}.pdf`

  const [step, setStep] = useState<Step>('sheet')
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [target, setTarget] = useState<Chat | null>(null)
  const [message, setMessage] = useState('')
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms))
  }

  function flash(text: string, then?: () => void) {
    setToast(text)
    later(() => {
      setToast(null)
      then?.()
    }, 1500)
  }

  function generate(text: string, fn: () => void) {
    setLoading(text)
    later(() => {
      setLoading(null)
      fn()
    }, 900)
  }

  function send() {
    generate('正在发送...', () => flash(`已发送给「${target?.name}」`, onClose))
  }

  const options: { key: string; label: string; icon: ReactNode; onClick: () => void }[] = [
    {
      key: 'wechat',
      label: '发送给朋友',
      icon: <WechatIcon className="size-7 text-[#07c160]" />,
      onClick: () => generate('正在生成 PDF 报告...', () => setStep('pick')),
    },
    {
      key: 'save',
      label: '保存到手机',
      icon: <Download className="size-6 text-muted-foreground" />,
      onClick: () => generate('正在生成 PDF 报告...', () => flash('PDF 已保存到手机')),
    },
    {
      key: 'link',
      label: '复制下载链接',
      icon: <Link2 className="size-6 text-muted-foreground" />,
      onClick: async () => flash((await copyText(downloadUrl)) ? '下载链接已复制，7 天内有效' : '复制失败，请重试'),
    },
  ]

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      <button type="button" aria-label="取消分享" onClick={onClose} className="absolute inset-0 bg-[#1e2a3d]/45" />

      {step === 'sheet' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-share-title"
          className="relative z-10 rounded-t-3xl bg-[#f7f8fa] px-4 pb-8 pt-4 shadow-[0_-6px_24px_#1e2a3d14] animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-center justify-between">
            <h2 id="pdf-share-title" className="text-title font-semibold text-foreground">
              分享 PDF 报告
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
          <FileCard name={fileName} size={fileSize} className="mt-3" />
          <p className="mt-2 flex gap-1.5 rounded-xl bg-warning-soft px-3 py-2 text-caption leading-relaxed text-[#b4602a]">
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            报告包含受检人基因与健康信息，请仅分享给信任的家人或医生。
          </p>
          <ul className="mt-4 grid grid-cols-3 gap-1">
            {options.map((o) => (
              <li key={o.key}>
                <button
                  type="button"
                  onClick={o.onClick}
                  disabled={!!loading}
                  className="flex w-full flex-col items-center gap-2 rounded-xl py-1 transition-opacity active:opacity-60"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-white">{o.icon}</span>
                  <span className="text-caption text-muted-foreground">{o.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step !== 'sheet' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-pick-title"
          className="relative z-10 flex h-[78%] flex-col rounded-t-3xl bg-[#ededed] animate-in slide-in-from-bottom duration-300"
        >
          <header className="relative flex h-12 shrink-0 items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 text-title text-foreground"
            >
              取消
            </button>
            <h2 id="pdf-pick-title" className="text-title font-semibold text-foreground">
              选择一个聊天
            </h2>
          </header>
          <div className="mx-3 flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white px-3 text-note text-muted-foreground">
            <Search className="size-4" aria-hidden="true" />
            搜索
          </div>
          <p className="px-4 pb-1.5 pt-3 text-caption text-muted-foreground">最近聊天</p>
          <ul className="flex-1 overflow-y-auto bg-white [scrollbar-width:none]">
            {recentChats.map((chat) => (
              <li key={chat.id} className="border-b border-[#f0f0f0] last:border-b-0">
                <button
                  type="button"
                  onClick={() => {
                    setTarget(chat)
                    setStep('confirm')
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left active:bg-[#f5f5f5]"
                >
                  <Avatar chat={chat} />
                  <span className="text-title text-foreground">{chat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'confirm' && target && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-8">
          <button
            type="button"
            aria-label="返回选择聊天"
            onClick={() => setStep('pick')}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-confirm-title"
            className="relative w-full max-w-[300px] overflow-hidden rounded-2xl bg-white animate-in zoom-in-95 fade-in duration-200"
          >
            <div className="px-5 pb-4 pt-5">
              <h3 id="pdf-confirm-title" className="text-title font-semibold text-foreground">
                发送给：
              </h3>
              <div className="mt-3 flex items-center gap-2.5">
                <Avatar chat={target} />
                <span className="text-body text-foreground">{target.name}</span>
              </div>
              <FileCard name={fileName} size={fileSize} className="mt-3 bg-[#f5f6f8]" />
              <label htmlFor="pdf-message" className="sr-only">
                给朋友留言
              </label>
              <input
                id="pdf-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="给朋友留言"
                className="mt-3 h-9 w-full rounded-lg bg-[#f5f6f8] px-3 text-note text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[#07c160]/40"
              />
            </div>
            <div className="flex border-t border-[#eeeeee] text-title">
              <button
                type="button"
                onClick={() => setStep('pick')}
                className="h-12 flex-1 text-foreground active:bg-[#f5f5f5]"
              >
                取消
              </button>
              <span className="w-px bg-[#eeeeee]" aria-hidden="true" />
              <button
                type="button"
                onClick={send}
                disabled={!!loading}
                className="h-12 flex-1 font-medium text-[#07c160] active:bg-[#f5f5f5]"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}

      {(loading || toast) && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center" role="status">
          <div className="flex min-w-28 max-w-[70%] flex-col items-center gap-2 rounded-2xl bg-[#1e2a3d]/85 px-5 py-4 text-center text-note text-white">
            {loading ? (
              <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-7" aria-hidden="true" />
            )}
            {loading ?? toast}
          </div>
        </div>
      )}
    </div>
  )
}
