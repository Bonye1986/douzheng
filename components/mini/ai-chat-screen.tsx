'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BookOpenCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Ellipsis,
  FileText,
  Menu,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBar } from '@/components/mini/phone-frame'
import { BrandMark } from '@/components/mini/auth-parts'
import { ChatComposer, type Attachment } from '@/components/mini/chat-composer'
import { ChatHistoryDrawer } from '@/components/mini/chat-history-drawer'
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

type Answers = Record<Mode, AiAnswer>

type Message =
  | { id: number; role: 'user'; text: string; attachments?: Attachment[] }
  | { id: number; role: 'assistant'; answers: Answers | null; view: Mode }

type Session = { id: string; title: string; time: string; messages: Message[] }

const modes = [
  { key: 'plain', label: '通俗版' },
  { key: 'pro', label: '专业版' },
] as const

let idSeed = 1000
const nextMessageId = () => idSeed++

function buildAnswers(question: string, hasTestee: boolean): Answers {
  return { plain: getAnswer(question, 'plain', hasTestee), pro: getAnswer(question, 'pro', hasTestee) }
}

function seedSession(id: string, question: string, time: string): Session {
  return {
    id,
    title: question,
    time,
    messages: [
      { id: nextMessageId(), role: 'user', text: question },
      { id: nextMessageId(), role: 'assistant', answers: buildAnswers(question, false), view: 'plain' },
    ],
  }
}

function initialSessions(question: string | undefined, mode: Mode, hasTestee: boolean): Session[] {
  const history = [
    seedSession('s-1', '高血压用药注意事项', '今天 09:12'),
    seedSession('s-2', '华法林剂量为什么因人而异？', '昨天 21:40'),
    seedSession('s-3', 'CYP2C19 慢代谢是什么意思', '10月12日'),
  ]
  if (!question) return history
  return [
    {
      id: 's-init',
      title: question,
      time: '刚刚',
      messages: [
        { id: nextMessageId(), role: 'user', text: question },
        { id: nextMessageId(), role: 'assistant', answers: buildAnswers(question, hasTestee), view: mode },
      ],
    },
    ...history,
  ]
}

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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(() =>
    initialSessions(initialQuestion, initialMode, Boolean(initialTesteeId)),
  )
  const [currentId, setCurrentId] = useState<string | null>(initialQuestion ? 's-init' : null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = sessions.find((s) => s.id === currentId)?.messages ?? []
  const isReplying = messages.some((m) => m.role === 'assistant' && m.answers === null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, currentId])

  function updateMessages(sessionId: string, fn: (prev: Message[]) => Message[]) {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, messages: fn(s.messages) } : s)))
  }

  function ask(text: string, attachments: Attachment[] = []) {
    if (isReplying || (!text && attachments.length === 0)) return
    const question = text || (attachments.some((a) => a.kind === 'pdf') ? '请帮我解读这份报告' : '请帮我看看这张图片')
    const userMsg: Message = { id: nextMessageId(), role: 'user', text: question, attachments }
    const replyId = nextMessageId()
    const replyMsg: Message = { id: replyId, role: 'assistant', answers: null, view: mode }

    let sessionId = currentId
    if (!sessionId) {
      sessionId = `s-${Date.now()}`
      const created: Session = { id: sessionId, title: question.slice(0, 20), time: '刚刚', messages: [userMsg, replyMsg] }
      setSessions((prev) => [created, ...prev])
      setCurrentId(sessionId)
    } else {
      updateMessages(sessionId, (prev) => [...prev, userMsg, replyMsg])
      setSessions((prev) => [
        ...prev.filter((s) => s.id === sessionId).map((s) => ({ ...s, time: '刚刚' })),
        ...prev.filter((s) => s.id !== sessionId),
      ])
    }

    const answers = buildAnswers(question, Boolean(testee))
    const targetId = sessionId
    window.setTimeout(() => {
      updateMessages(targetId, (prev) => prev.map((m) => (m.id === replyId && m.role === 'assistant' ? { ...m, answers } : m)))
    }, 1200)
  }

  function startNewChat() {
    setCurrentId(null)
    setDrawerOpen(false)
  }

  const greeting = testee
    ? `你好，${testee.name}。已关联${testee.reports > 0 ? `${testee.reports}份历史报告` : '基本信息（暂无历史报告）'}，我会结合这些资料回答。`
    : '你好。本次未关联检测人，我会按通用知识回答；你也可以随时选择检测人或上传外部报告。'

  return (
    <div className="relative flex h-full flex-col bg-[linear-gradient(180deg,#e6f1fe_0%,#f4f8fe_30%)]">
      <StatusBar />
      <header className="relative flex h-11 items-center justify-center px-2 text-foreground">
        <div className="absolute left-1 flex items-center">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="返回" className="flex size-9 items-center justify-center rounded-full">
              <ChevronLeft className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="历史对话"
            className="flex size-9 items-center justify-center rounded-full active:bg-white/70"
          >
            <Menu className="size-5" />
          </button>
          <div
            role="radiogroup"
            aria-label="回答风格"
            className="ml-0.5 flex rounded-full bg-white/85 p-0.5 shadow-[0_2px_8px_#3b8beb14]"
          >
            {modes.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={mode === item.key}
                onClick={() => setMode(item.key)}
                className={cn(
                  'h-7 rounded-full px-2.5 text-[12px] transition-colors',
                  mode === item.key ? 'bg-primary font-semibold text-white' : 'text-muted-foreground',
                )}
              >
                {item.label.slice(0, 2)}
              </button>
            ))}
          </div>
        </div>
        <h2 className="text-[16px] font-medium">AI咨询</h2>
        <div
          aria-hidden="true"
          className="absolute right-3 flex h-8 items-center gap-3 rounded-full border border-border bg-white/80 px-3"
        >
          <Ellipsis className="size-4" />
          <span className="h-4 w-px bg-border" />
          <Circle className="size-3.5" strokeWidth={3} />
        </div>
      </header>

      <div className="shrink-0 px-4 pb-3 pt-2">
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-white px-3 py-2 text-left shadow-[0_4px_14px_#3b8beb0d]"
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-xl',
                testee ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground',
              )}
            >
              {testee ? <UserRoundCheck className="size-4" /> : <UserRound className="size-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[13px] font-semibold text-foreground">
                {testee ? testeeLabel(testee) : '未选择检测人'}
              </strong>
              <span className="block truncate text-[11px] text-muted-foreground">
                {testee ? (testee.reports > 0 ? `${testee.reports}份历史报告` : '暂无历史报告') : '按通用知识回答'}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-[#b8c2d6]" />
          </button>
        </div>
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
              <li key={m.id} className="flex flex-col items-end gap-1.5">
                {m.attachments && m.attachments.length > 0 && <MessageAttachments items={m.attachments} />}
                <p className="max-w-[78%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-[14px] leading-6 text-white">
                  {m.text}
                </p>
              </li>
            ) : (
              <li key={m.id} className="flex gap-2">
                <BrandMark className="size-8 shrink-0 rounded-lg text-sm shadow-none" />
                <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white px-3.5 py-3 text-[14px] leading-6 text-foreground shadow-[0_4px_14px_#3b8beb0d]">
                  {m.answers ? (
                    <AnswerBody answer={m.answers[mode]} />
                  ) : (
                    <TypingDots />
                  )}
                </div>
              </li>
            ),
          )}
        </ul>

        {messages.length === 0 && (
          <ul aria-label="推荐问题" className="mt-4 flex flex-col items-start gap-2 pl-10">
            {quickPrompts.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => ask(q)}
                  className="rounded-full border border-[#d6e6fb] bg-white px-3 py-1.5 text-[12px] text-secondary-foreground active:bg-secondary"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ChatComposer disabled={isReplying} onSend={ask} />

      {drawerOpen && (
        <ChatHistoryDrawer
          sessions={sessions}
          currentId={currentId}
          onClose={() => setDrawerOpen(false)}
          onSelect={(id) => {
            setCurrentId(id)
            setDrawerOpen(false)
          }}
          onNew={startNewChat}
          onRename={(id, title) => setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)))}
          onDelete={(id) => {
            setSessions((prev) => prev.filter((s) => s.id !== id))
            if (id === currentId) setCurrentId(null)
          }}
        />
      )}

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

function MessageAttachments({ items }: { items: Attachment[] }) {
  return (
    <ul className="flex max-w-[78%] flex-wrap justify-end gap-1.5">
      {items.map((a) =>
        a.kind === 'image' && a.url ? (
          <li key={a.id}>
            <img src={a.url} alt={a.name} className="size-20 rounded-xl border border-border object-cover" />
          </li>
        ) : (
          <li key={a.id} className="flex w-44 items-center gap-2 rounded-xl border border-border bg-white px-2.5 py-2">
            <FileText className="size-7 shrink-0 text-[#e5534b]" />
            <span className="min-w-0">
              <span className="block truncate text-[12px] text-foreground">{a.name}</span>
              <span className="block text-[10px] text-muted-foreground">PDF</span>
            </span>
          </li>
        ),
      )}
    </ul>
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
      <p className="mt-1 border-t border-border pt-2 text-[11px] text-muted-foreground">AI 生成，仅供参考</p>
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
