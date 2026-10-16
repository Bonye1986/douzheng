'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowUp,
  Camera,
  Check,
  ChevronDown,
  FileText,
  GraduationCap,
  Images,
  Keyboard,
  MessageCircle,
  Mic,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type Attachment = { id: string; name: string; kind: 'image' | 'pdf'; url?: string }

const MAX_ATTACHMENTS = 9
const CANCEL_DISTANCE = 60
const voiceSamples = ['华法林和阿司匹林能一起吃吗？', '我的基因报告显示慢代谢，要注意什么？', '降压药需要饭前吃还是饭后吃？']

export type AnswerStyle = 'plain' | 'pro'

const answerStyles: { key: AnswerStyle; label: string; desc: string }[] = [
  { key: 'plain', label: '通俗版', desc: '用日常语言解释，适合患者和家属' },
  { key: 'pro', label: '专业版', desc: '包含机制、证据与指南，适合医药专业人士' },
]

export function ChatComposer({
  disabled,
  onSend,
  answerStyle,
  onAnswerStyleChange,
}: {
  disabled: boolean
  onSend: (text: string, attachments: Attachment[]) => void
  answerStyle: AnswerStyle
  onAnswerStyleChange: (style: AnswerStyle) => void
}) {
  const [styleMenuOpen, setStyleMenuOpen] = useState(false)
  const currentStyle = answerStyles.find((s) => s.key === answerStyle) ?? answerStyles[0]
  const [inputMode, setInputMode] = useState<'keyboard' | 'voice'>('keyboard')
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [recording, setRecording] = useState<{ cancel: boolean } | null>(null)
  const startY = useRef(0)
  const voiceIndex = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canSend = !disabled && (draft.trim().length > 0 || attachments.length > 0)

  function send(text: string) {
    if (disabled || (!text.trim() && attachments.length === 0)) return
    onSend(text.trim(), attachments)
    setDraft('')
    setAttachments([])
  }

  function toggleInputMode() {
    if (inputMode === 'keyboard') {
      setInputMode('voice')
    } else {
      setInputMode('keyboard')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    setSheetOpen(false)
    if (files.length === 0) return
    setAttachments((prev) => {
      const room = MAX_ATTACHMENTS - prev.length
      const added = files.slice(0, room).map<Attachment>((file, i) => {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        return {
          id: `${Date.now()}-${i}`,
          name: file.name,
          kind: isPdf ? 'pdf' : 'image',
          url: isPdf ? undefined : URL.createObjectURL(file),
        }
      })
      return [...prev, ...added]
    })
  }

  return (
    <>
      <div className="relative shrink-0 border-t border-border bg-white px-3 pb-7 pt-2">
        <div className="mb-2 flex items-center px-1">
          <button
            type="button"
            onClick={() => setStyleMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={styleMenuOpen}
            aria-label={`回答风格：${currentStyle.label}，点击切换`}
            className="flex h-7 items-center gap-1 rounded-full bg-secondary pl-2 pr-1.5 text-[12px] font-medium text-primary active:opacity-80"
          >
            {answerStyle === 'plain' ? <MessageCircle className="size-3.5" /> : <GraduationCap className="size-3.5" />}
            {currentStyle.label}
            <ChevronDown className={cn('size-3.5 transition-transform', styleMenuOpen && 'rotate-180')} />
          </button>
        </div>

        {styleMenuOpen && (
          <>
            <button
              type="button"
              aria-label="关闭回答风格菜单"
              onClick={() => setStyleMenuOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <ul
              role="listbox"
              aria-label="回答风格"
              className="absolute bottom-full left-3 z-20 mb-1 w-64 rounded-2xl border border-border bg-white p-1.5 shadow-[0_8px_24px_#1e2a3d1f] animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              {answerStyles.map((s) => {
                const selected = s.key === answerStyle
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onAnswerStyleChange(s.key)
                        setStyleMenuOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left',
                        selected ? 'bg-secondary' : 'active:bg-secondary',
                      )}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                        {s.key === 'plain' ? <MessageCircle className="size-4" /> : <GraduationCap className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-foreground">{s.label}</span>
                        <span className="mt-0.5 block text-[12px] leading-[18px] text-muted-foreground">{s.desc}</span>
                      </span>
                      {selected && <Check className="mt-1 size-4 shrink-0 text-primary" strokeWidth={2.6} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {attachments.length > 0 && (
          <ul aria-label="待发送附件" className="mb-2.5 flex gap-2 overflow-x-auto px-1 pt-1.5 [scrollbar-width:none]">
            {attachments.map((a) => (
              <li key={a.id} className="relative shrink-0">
                {a.kind === 'image' && a.url ? (
                  <img src={a.url} alt={a.name} className="size-14 rounded-xl border border-border object-cover" />
                ) : (
                  <span className="flex h-14 w-32 items-center gap-2 rounded-xl border border-border bg-[#f6f9fd] px-2.5">
                    <FileText className="size-6 shrink-0 text-[#e5603a]" />
                    <span className="line-clamp-2 text-[11px] leading-4 text-foreground">{a.name}</span>
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`移除 ${a.name}`}
                  onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                  className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#1e2a3d]/70 text-white"
                >
                  <X className="size-3" strokeWidth={3} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleInputMode}
            aria-label={inputMode === 'keyboard' ? '切换为语音输入' : '切换为键盘输入'}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground active:bg-secondary"
          >
            {inputMode === 'keyboard' ? <Mic className="size-[22px]" /> : <Keyboard className="size-[22px]" />}
          </button>

          {inputMode === 'keyboard' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(draft)
              }}
              className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-[#f1f5fb] px-4 focus-within:ring-1 focus-within:ring-primary"
            >
              <label htmlFor="ai-ask" className="sr-only">
                输入想咨询的问题
              </label>
              <input
                ref={inputRef}
                id="ai-ask"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
                }}
                placeholder="输入想咨询的问题"
                enterKeyHint="send"
                className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-[#a3adc2]"
              />
            </form>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                startY.current = e.clientY
                setRecording({ cancel: false })
              }}
              onPointerMove={(e) => {
                if (!recording) return
                const cancel = startY.current - e.clientY > CANCEL_DISTANCE
                if (cancel !== recording.cancel) setRecording({ cancel })
              }}
              onPointerUp={() => {
                if (!recording) return
                const cancelled = recording.cancel
                setRecording(null)
                if (!cancelled) {
                  send(voiceSamples[voiceIndex.current % voiceSamples.length])
                  voiceIndex.current++
                }
              }}
              onPointerCancel={() => setRecording(null)}
              className={cn(
                'h-11 min-w-0 flex-1 touch-none select-none rounded-full text-[15px] font-semibold transition-colors disabled:opacity-50',
                recording ? 'bg-[#dfeafb] text-primary' : 'bg-[#f1f5fb] text-foreground',
              )}
            >
              {recording ? '松开 发送' : '按住 说话'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            disabled={disabled || attachments.length >= MAX_ATTACHMENTS}
            aria-label="上传附件"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground active:bg-secondary disabled:opacity-40"
          >
            <Plus className="size-6 rounded-full border-[1.8px] border-current p-0.5" strokeWidth={2.4} />
          </button>

          {inputMode === 'keyboard' && canSend && (
            <button
              type="button"
              onClick={() => send(draft)}
              aria-label="发送"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white animate-in zoom-in-75 duration-150"
            >
              <ArrowUp className="size-[18px]" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      {recording && <RecordingOverlay cancel={recording.cancel} />}

      {sheetOpen && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-[#1e2a3d]/35"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="上传附件"
            className="relative rounded-t-3xl bg-white px-4 pb-8 pt-5 animate-in slide-in-from-bottom duration-300"
          >
            <p className="text-center text-[12px] text-muted-foreground">支持上传图片和 PDF 文件，最多 {MAX_ATTACHMENTS} 个</p>
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: '拍照', icon: Camera, ref: cameraRef },
                { label: '相册', icon: Images, ref: albumRef },
                { label: '文件', icon: FileText, ref: fileRef },
              ].map(({ label, icon: Icon, ref }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-2xl py-3 active:bg-secondary"
                  >
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-[13px] text-foreground">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-4 h-11 w-full rounded-full bg-[#f1f5fb] text-[15px] font-medium text-foreground"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFiles} />
      <input ref={albumRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
      <input ref={fileRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={handleFiles} />
    </>
  )
}

function RecordingOverlay({ cancel }: { cancel: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center" role="status">
      <div
        className={cn(
          'flex w-44 flex-col items-center gap-3 rounded-3xl px-4 py-5 text-white shadow-lg transition-colors',
          cancel ? 'bg-[#e5603a]' : 'bg-[#1e2a3d]/85',
        )}
      >
        <span className="flex h-8 items-end gap-1" aria-hidden="true">
          {[0, 120, 240, 360, 480, 600, 720].map((delay) => (
            <span
              key={delay}
              className="w-1 animate-pulse rounded-full bg-white"
              style={{ height: `${10 + ((delay / 120) % 4) * 6}px`, animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className="text-[13px]">{cancel ? '松开手指，取消发送' : '正在聆听，上滑取消'}</span>
      </div>
    </div>
  )
}
