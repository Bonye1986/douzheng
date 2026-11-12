'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowUp,
  Camera,
  FileText,
  Images,
  Keyboard,
  Mic,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import type React from 'react'
import { cn } from '@/lib/utils'

export type Attachment = { id: string; name: string; kind: 'image' | 'pdf'; url?: string }

const MAX_ATTACHMENTS = 9
const CANCEL_DISTANCE = 60
const voiceSamples = ['华法林和阿司匹林能一起吃吗？', '我的基因报告显示慢代谢，要注意什么？', '降压药需要饭前吃还是饭后吃？']

export type AnswerStyle = 'plain' | 'pro'

export const answerStyles: { key: AnswerStyle; label: string; short: string; desc: string }[] = [
  { key: 'plain', label: '通俗版', short: '通俗', desc: '用日常语言解释，适合患者和家属' },
  { key: 'pro', label: '专业版', short: '专业', desc: '包含机制、证据与指南，适合医药专业人士' },
]

export function ChatComposer({
  disabled,
  onSend,
  compact = false,
  variant = 'bar',
  accessory,
}: {
  /** pill 版底部左侧附加内容（如受检人选择）；传入后变为上输入、下工具栏的两行卡片 */
  accessory?: React.ReactNode
  /** bar：底部输入栏；card：大输入卡；pill：首页一体式胶囊输入（语音 / 加号上传） */
  variant?: 'bar' | 'card' | 'pill'
  /** 底部有 TabBar 时不再预留 home indicator 安全区 */
  compact?: boolean
  disabled: boolean
  onSend: (text: string, attachments: Attachment[]) => void
}) {
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

  const [expanded, setExpanded] = useState(false)
  const expandedRef = useRef<HTMLDivElement>(null)

  const canSend = !disabled && (draft.trim().length > 0 || attachments.length > 0)

  // 首页 pill：聚焦输入框时展开为带受检人选择的卡片；点到卡片外且未输入内容时收起
  useEffect(() => {
    if (!expanded) return
    function handlePointerDown(e: PointerEvent) {
      if (expandedRef.current?.contains(e.target as Node)) return
      if (sheetOpen || draft.trim() || attachments.length > 0) return
      setExpanded(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [expanded, sheetOpen, draft, attachments.length])

  function expandPill() {
    if (!accessory || expanded) return
    setExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

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

  const attachmentList = attachments.length > 0 && (
    <ul aria-label="待发送附件" className="mb-2.5 flex gap-2 overflow-x-auto px-1 pt-1.5 [scrollbar-width:none]">
      {attachments.map((a) => (
        <li key={a.id} className="relative shrink-0">
          {a.kind === 'image' && a.url ? (
            <img src={a.url} alt={a.name} className="size-14 rounded-xl border border-border object-cover" />
          ) : (
            <span className="flex h-14 w-32 items-center gap-2 rounded-xl border border-border bg-[#f6f9fd] px-2.5">
              <FileText className="size-6 shrink-0 text-destructive" />
              <span className="line-clamp-2 text-caption leading-4 text-foreground">{a.name}</span>
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
  )

  const holdToTalkProps = {
    type: 'button' as const,
    disabled,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      startY.current = e.clientY
      setRecording({ cancel: false })
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!recording) return
      const cancel = startY.current - e.clientY > CANCEL_DISTANCE
      if (cancel !== recording.cancel) setRecording({ cancel })
    },
    onPointerUp: () => {
      if (!recording) return
      const cancelled = recording.cancel
      setRecording(null)
      if (!cancelled) {
        send(voiceSamples[voiceIndex.current % voiceSamples.length])
        voiceIndex.current++
      }
    },
    onPointerCancel: () => setRecording(null),
  }

  const attachDisabled = disabled || attachments.length >= MAX_ATTACHMENTS
  const toolBtn =
    'flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-secondary disabled:opacity-40'

  const card = (
    <div className="relative rounded-[24px] border-[1.5px] border-[#d3e0f7] bg-white px-4 pb-3 pt-4 shadow-[0_10px_28px_#3a82e41a]">
      {attachmentList}
      {inputMode === 'keyboard' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
          className="flex items-center gap-2.5"
        >
          <Sparkles className="size-5 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
          <label htmlFor="ai-ask-card" className="sr-only">
            输入想咨询的问题
          </label>
          <input
            ref={inputRef}
            id="ai-ask-card"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            placeholder="有问题，尽管问我～"
            enterKeyHint="send"
            className="h-8 min-w-0 flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-faint"
          />
        </form>
      ) : (
        <button
          {...holdToTalkProps}
          className={cn(
            'h-10 w-full touch-none select-none rounded-full text-title font-semibold transition-colors disabled:opacity-50',
            recording ? 'bg-[#dfeafb] text-primary' : 'bg-muted text-foreground',
          )}
        >
          {recording ? '松开 发送' : '按住 说话'}
        </button>
      )}

      <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={toggleInputMode}
          aria-label={inputMode === 'keyboard' ? '切换为语音输入' : '切换为键盘输入'}
          className={toolBtn}
        >
          {inputMode === 'keyboard' ? <Mic className="size-5" /> : <Keyboard className="size-5" />}
        </button>
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={attachDisabled}
          aria-label="拍照提问"
          className={toolBtn}
        >
          <Camera className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          disabled={attachDisabled}
          aria-label="上传附件"
          className={toolBtn}
        >
          <Plus className="size-5 rounded-full border-[1.6px] border-current p-px" strokeWidth={2.4} />
        </button>
        <span className="ml-1 text-[12px] text-faint">支持文字、语音、图片</span>
        <button
          type="button"
          onClick={() => send(draft)}
          disabled={!canSend}
          aria-label="发送"
          className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_6px_14px_#3a82e440] transition-opacity disabled:opacity-40 disabled:shadow-none"
        >
          <ArrowUp className="size-5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )

  const textInput = (id: string, className: string) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        send(draft)
      }}
      className="flex h-full min-w-0 flex-1 items-center"
    >
      <label htmlFor={id} className="sr-only">
        输入想咨询的问题
      </label>
      <input
        ref={inputRef}
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
        }}
        placeholder="说说您或家人的用药问题"
        enterKeyHint="send"
        className={className}
      />
    </form>
  )

  const pillWithAccessory = (
    <div
      ref={expandedRef}
      className="relative rounded-[24px] bg-white px-4 pb-3 pt-3.5 shadow-[0_6px_20px_#3a82e414] ring-1 ring-[#e6eefb] animate-in fade-in zoom-in-[0.98] duration-150 focus-within:ring-primary/50"
    >
      {attachmentList}
      <div className="flex h-9 items-center">
        {inputMode === 'keyboard' ? (
          textInput('ai-ask-pill', 'h-full min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-faint')
        ) : (
          <button
            {...holdToTalkProps}
            className={cn(
              'h-9 min-w-0 flex-1 touch-none select-none rounded-full text-[15px] font-semibold transition-colors disabled:opacity-50',
              recording ? 'bg-[#dfeafb] text-primary' : 'bg-muted text-foreground',
            )}
          >
            {recording ? '松开 发送' : '按住 说话'}
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1">
        <div className="min-w-0 flex-1">{accessory}</div>
        <button
          type="button"
          onClick={toggleInputMode}
          aria-label={inputMode === 'keyboard' ? '切换为语音输入' : '切换为键盘输入'}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground active:bg-secondary"
        >
          {inputMode === 'keyboard' ? <Mic className="size-5.5" /> : <Keyboard className="size-5.5" />}
        </button>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          disabled={attachDisabled}
          aria-label="拍照或上传报告"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground active:bg-secondary disabled:opacity-40"
        >
          <Plus className="size-5.5 rounded-full border-[1.6px] border-current p-px" strokeWidth={2.4} />
        </button>
        {inputMode === 'keyboard' && canSend && (
          <button
            type="button"
            onClick={() => send(draft)}
            aria-label="发送"
            className="ml-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white animate-in zoom-in-75 duration-150"
          >
            <ArrowUp className="size-3.5" strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  )

  const pill = accessory && expanded ? pillWithAccessory : (
    <div className="relative">
      {attachmentList}
      <div className="flex items-center gap-2.5">
        <div className="flex h-12 min-w-0 flex-1 items-center gap-1 rounded-full bg-white px-1.5 shadow-[0_6px_20px_#3a82e414] ring-1 ring-[#e6eefb] focus-within:ring-primary/50">
          <button
            type="button"
            onClick={toggleInputMode}
            aria-label={inputMode === 'keyboard' ? '切换为语音输入' : '切换为键盘输入'}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground active:bg-secondary"
          >
            {inputMode === 'keyboard' ? <Mic className="size-5.5" /> : <Keyboard className="size-5.5" />}
          </button>
          {inputMode === 'keyboard' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(draft)
              }}
              className="flex h-full min-w-0 flex-1 items-center"
            >
              <label htmlFor="ai-ask-pill" className="sr-only">
                输入想咨询的问题
              </label>
              <input
                ref={inputRef}
                id="ai-ask-pill"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={expandPill}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
                }}
                placeholder="说说您或家人的用药问题"
                enterKeyHint="send"
                className="h-full min-w-0 flex-1 bg-transparent px-1 text-[15px] text-foreground outline-none placeholder:text-faint"
              />
            </form>
          ) : (
            <button
              {...holdToTalkProps}
              className={cn(
                'h-9 min-w-0 flex-1 touch-none select-none rounded-full text-[15px] font-semibold transition-colors disabled:opacity-50',
                recording ? 'bg-[#dfeafb] text-primary' : 'text-foreground',
              )}
            >
              {recording ? '松开 发送' : '按住 说话'}
            </button>
          )}
          {inputMode === 'keyboard' && canSend && (
            <button
              type="button"
              onClick={() => send(draft)}
              aria-label="发送"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white animate-in zoom-in-75 duration-150"
            >
              <ArrowUp className="size-4" strokeWidth={2.4} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            disabled={attachDisabled}
            aria-label="拍照或上传报告"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground active:bg-secondary disabled:opacity-40"
          >
            <Plus className="size-5.5 rounded-full border-[1.6px] border-current p-px" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {variant === 'card' ? card : variant === 'pill' ? pill : (
      <div className={cn('relative shrink-0 border-t border-border bg-white px-3 pt-2', compact ? 'pb-2' : 'pb-7')}>
        {attachments.length > 0 && (
          <ul aria-label="待发送附件" className="mb-2.5 flex gap-2 overflow-x-auto px-1 pt-1.5 [scrollbar-width:none]">
            {attachments.map((a) => (
              <li key={a.id} className="relative shrink-0">
                {a.kind === 'image' && a.url ? (
                  <img src={a.url} alt={a.name} className="size-14 rounded-xl border border-border object-cover" />
                ) : (
                  <span className="flex h-14 w-32 items-center gap-2 rounded-xl border border-border bg-[#f6f9fd] px-2.5">
                    <FileText className="size-6 shrink-0 text-destructive" />
                    <span className="line-clamp-2 text-caption leading-4 text-foreground">{a.name}</span>
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
            {inputMode === 'keyboard' ? <Mic className="size-6" /> : <Keyboard className="size-6" />}
          </button>

          {inputMode === 'keyboard' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(draft)
              }}
              className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-muted px-4 focus-within:ring-1 focus-within:ring-primary"
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
                className="h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-faint"
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
                'h-11 min-w-0 flex-1 touch-none select-none rounded-full text-title font-semibold transition-colors disabled:opacity-50',
                recording ? 'bg-[#dfeafb] text-primary' : 'bg-muted text-foreground',
              )}
            >
              {recording ? '松开 发送' : '按住 说话'}
            </button>
          )}

          {!(inputMode === 'keyboard' && canSend) && (
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={disabled || attachments.length >= MAX_ATTACHMENTS}
              aria-label="拍照提问"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground active:bg-secondary disabled:opacity-40"
            >
              <Camera className="size-6" />
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
              <ArrowUp className="size-4.5" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>
      )}

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
            <p className="text-center text-caption text-muted-foreground">支持上传图片和 PDF 文件，最多 {MAX_ATTACHMENTS} 个</p>
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
                    <span className="text-note text-foreground">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="mt-4 h-11 w-full rounded-full bg-muted text-title font-medium text-foreground"
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
          cancel ? 'bg-destructive' : 'bg-[#1e2a3d]/85',
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
        <span className="text-note">{cancel ? '松开手指，取消发送' : '正在聆听，上滑取消'}</span>
      </div>
    </div>
  )
}
