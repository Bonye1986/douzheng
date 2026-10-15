'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  BookOpenCheck,
  Check,
  ChevronRight,
  FileText,
  ImagePlus,
  Mic,
  ScanLine,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from '@/components/mini/phone-frame'
import { BrandMark } from '@/components/mini/auth-parts'
import {
  getAnswer,
  quickPrompts,
  skills,
  testeeLabel,
  testees,
  type AiAnswer,
  type Mode,
  type Testee,
} from '@/components/mini/ai-data'

type Message =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; answer: AiAnswer | null }

const tools = [
  { label: '上传图片', icon: ImagePlus },
  { label: '上传PDF', icon: FileText },
  { label: '语音输入', icon: Mic },
  { label: '识别药盒', icon: ScanLine, question: '帮我识别药盒上的药物' },
]

export function AiChatScreen({
  initialMode = 'plain',
  initialTesteeId,
  initialQuestion,
  initialSheetOpen = false,
  onBack,
}: {
  initialMode?: Mode
  initialTesteeId?: string
  initialQuestion?: string
  initialSheetOpen?: boolean
  onBack?: () => void
}) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [testee, setTestee] = useState<Testee | null>(
    () => testees.find((t) => t.id === initialTesteeId) ?? null,
  )
  const [sheetOpen, setSheetOpen] = useState(initialSheetOpen)
  const [messages, setMessages] = useState<Message[]>(() =>
    initialQuestion
      ? [
          { id: 1, role: 'user', text: initialQuestion },
          { id: 2, role: 'assistant', answer: getAnswer(initialQuestion, initialMode, Boolean(initialTesteeId)) },
        ]
      : [],
  )
  const [draft, setDraft] = useState('')
  const nextId = useRef(messages.length + 1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isReplying = messages.some((m) => m.role === 'assistant' && m.answer === null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function ask(text: string) {
    const question = text.trim()
    if (!question || isReplying) return
    const userId = nextId.current++
    const replyId = nextId.current++
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user', text: question },
      { id: replyId, role: 'assistant', answer: null },
    ])
    setDraft('')
    const answer = getAnswer(question, mode, Boolean(testee))
    window.setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, answer } : m)))
    }, 1200)
  }

  const greeting = testee
    ? `你好，${testee.name}。已关联${testee.reports > 0 ? `${testee.reports}份历史报告` : '基本信息（暂无历史报告）'}，我会结合这些资料回答。`
    : '你好。本次未关联检测人，我会按通用知识回答；你也可以随时选择检测人或上传外部报告。'

  return (
    <div className="relative flex h-full flex-col bg-[linear-gradient(180deg,#e6f1fe_0%,#f4f8fe_30%)]">
      <StatusBar />
      <NavBar title="AI咨询" showBack onBack={onBack} />

      <div className="shrink-0 px-4 pb-3 pt-2">
        <div role="group" aria-label="回答风格" className="grid grid-cols-2 rounded-2xl bg-[#dfeafb] p-1">
          {(
            [
              { key: 'plain', label: '通俗版' },
              { key: 'pro', label: '专业版' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={mode === item.key}
              onClick={() => setMode(item.key)}
              className={cn(
                'h-9 rounded-xl text-[14px] transition-colors',
                mode === item.key ? 'bg-white font-semibold text-primary shadow-sm' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white px-3.5 py-3 text-left shadow-[0_4px_14px_#3b8beb0d]"
        >
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl',
              testee ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground',
            )}
          >
            {testee ? <UserRoundCheck className="size-[18px]" /> : <UserRound className="size-[18px]" />}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[14px] font-semibold text-foreground">
              {testee ? `当前检测人：${testeeLabel(testee)}` : '未选择检测人'}
            </strong>
            <span className="block truncate text-[12px] text-muted-foreground">
              {testee
                ? `${testee.meta} · ${testee.reports > 0 ? `${testee.reports}份历史报告` : '暂无历史报告'}`
                : '本次按通用信息回答，不读取检测人资料'}
            </span>
          </span>
          <span className="text-[12px] text-primary">{testee ? '切换' : '选择'}</span>
          <ChevronRight className="-ml-2 size-4 text-[#b8c2d6]" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-3 [scrollbar-width:none]">
        <section className="rounded-2xl border border-[#d6e6fb] bg-white/70 p-4">
          <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            药问智能咨询
          </h3>
          <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">
            回答基于已授权资料和知识来源生成。医疗问题需结合专业人员判断；紧急或严重不适请及时就医。
          </p>
          <ul className="mt-3 flex gap-2">
            {skills.map((skill) => (
              <li key={skill.key}>
                <button
                  type="button"
                  onClick={() => ask(skill.question)}
                  disabled={isReplying}
                  className="rounded-full bg-secondary px-3 py-1.5 text-[12px] font-medium text-secondary-foreground transition-colors active:bg-[#d3e6fc] disabled:opacity-50"
                >
                  {skill.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <ul className="mt-4 flex flex-col gap-4" aria-live="polite">
          <li className="flex gap-2">
            <BrandMark className="size-8 shrink-0 rounded-lg text-sm shadow-none" />
            <p className="max-w-[82%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[14px] leading-6 text-foreground shadow-[0_4px_14px_#3b8beb0d]">
              {greeting}
            </p>
          </li>
          {messages.map((m) =>
            m.role === 'user' ? (
              <li key={m.id} className="flex justify-end">
                <p className="max-w-[78%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-[14px] leading-6 text-white">
                  {m.text}
                </p>
              </li>
            ) : (
              <li key={m.id} className="flex gap-2">
                <BrandMark className="size-8 shrink-0 rounded-lg text-sm shadow-none" />
                <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white px-3.5 py-3 text-[14px] leading-6 text-foreground shadow-[0_4px_14px_#3b8beb0d]">
                  {m.answer ? <AnswerBody answer={m.answer} /> : <TypingDots />}
                </div>
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="shrink-0 border-t border-border bg-white px-4 pb-7 pt-2.5">
        {messages.length === 0 && (
          <ul aria-label="推荐问题" className="-mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
            {quickPrompts.map((q) => (
              <li key={q} className="shrink-0">
                <button
                  type="button"
                  onClick={() => ask(q)}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-secondary-foreground active:bg-secondary"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        )}
        <ul className="mb-2.5 flex justify-between">
          {tools.map(({ label, icon: Icon, question }) => (
            <li key={label}>
              <button
                type="button"
                onClick={question ? () => ask(question) : undefined}
                disabled={isReplying}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-muted-foreground active:bg-secondary disabled:opacity-50"
              >
                <Icon className="size-4 text-primary" />
                {label}
              </button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(draft)
          }}
          className="flex h-11 items-center gap-2 rounded-full bg-[#f1f5fb] pl-4 pr-1 focus-within:ring-1 focus-within:ring-primary"
        >
          <label htmlFor="ai-ask" className="sr-only">
            输入想咨询的问题
          </label>
          <input
            id="ai-ask"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            placeholder="输入想咨询的问题"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-[#a3adc2]"
          />
          <button
            type="submit"
            aria-label="发送"
            disabled={!draft.trim() || isReplying}
            className="flex size-9 items-center justify-center rounded-full bg-primary text-white transition-colors disabled:bg-[#cfe2f8]"
          >
            <ArrowUp className="size-[18px]" strokeWidth={2.4} />
          </button>
        </form>
      </div>

      {sheetOpen && (
        <TesteeSheet
          current={testee}
          onClose={() => setSheetOpen(false)}
          onConfirm={(t) => {
            setTestee(t)
            setSheetOpen(false)
          }}
        />
      )}
    </div>
  )
}

function TesteeSheet({
  current,
  onClose,
  onConfirm,
}: {
  current: Testee | null
  onClose: () => void
  onConfirm: (t: Testee | null) => void
}) {
  const [selected, setSelected] = useState<string | null>(current?.id ?? null)

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-[#1e2a3d]/35 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="testee-title"
        className="relative rounded-t-3xl bg-white px-4 pb-8 pt-2.5 animate-in slide-in-from-bottom duration-300"
      >
        <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-[#dbe3ef]" />
        <div className="mt-4 flex items-center justify-between">
          <h2 id="testee-title" className="text-[18px] font-bold text-foreground">
            选择检测人（可跳过）
          </h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-[#f1f5fb] text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
          选择后，AI 可在授权范围内关联该检测人的基本信息和历史检测报告；不选择则按通用知识回答。
        </p>

        <ul role="radiogroup" aria-label="检测人" className="mt-4 flex flex-col gap-2.5">
          {testees.map((t) => {
            const active = selected === t.id
            return (
              <li key={t.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(t.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors',
                    active ? 'border-primary bg-secondary/60' : 'border-border',
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <UserRound className="size-5" />
                  </span>
                  <span className="flex-1">
                    <strong className="block text-[15px] font-semibold text-foreground">{testeeLabel(t)}</strong>
                    <span className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                      {t.meta} ·
                      {t.reports > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-primary">
                          <BookOpenCheck className="size-3" />
                          {t.reports}份历史报告
                        </span>
                      ) : (
                        ' 暂无历史报告'
                      )}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full border',
                      active ? 'border-primary bg-primary text-white' : 'border-[#c9d3e3]',
                    )}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <button type="button" className="mt-2.5 w-full py-2 text-[13px] font-medium text-primary">
          + 添加检测人
        </button>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onConfirm(null)}
            className="h-11 rounded-full border border-border text-[15px] font-medium text-foreground"
          >
            不选择检测人
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => onConfirm(testees.find((t) => t.id === selected) ?? null)}
            className="h-11 rounded-full bg-primary text-[15px] font-semibold text-white disabled:bg-[#cfe2f8]"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  )
}

function AnswerBody({ answer }: { answer: AiAnswer }) {
  return (
    <div className="flex flex-col gap-2">
      <p>{answer.intro}</p>
      <ol className="flex flex-col gap-1.5">
        {answer.points.map((point, i) => (
          <li key={point} className="flex gap-2">
            <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
              {i + 1}
            </span>
            <span className="text-[13px] leading-[22px]">{point}</span>
          </li>
        ))}
      </ol>
      {answer.tip && (
        <p className="rounded-xl bg-[#eefaf8] px-3 py-2 text-[12px] leading-5 text-[#2f8f86]">{answer.tip}</p>
      )}
      {answer.source && (
        <p className="flex items-center gap-1 text-[11px] text-secondary-foreground">
          <BookOpenCheck className="size-3.5" />
          {answer.source}
        </p>
      )}
      <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span>AI 生成，仅供参考</span>
        <a href="#" className="font-medium text-primary">
          转人工药师
        </a>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="flex h-6 items-center gap-1" role="status">
      <span className="sr-only">正在回复</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-primary/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}
