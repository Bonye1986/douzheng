'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Ellipsis,
  FileText,
  LockKeyhole,
  Menu,
  Plus,
  RefreshCw,
  Share2,
  ShieldCheck,
  Square,
  UserRound,
  UserRoundCheck,
  Volume2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBar } from '@/components/mini/phone-frame'
import { BrandMark } from '@/components/mini/auth-parts'
import { ChatComposer, answerStyles, type Attachment } from '@/components/mini/chat-composer'
import { ChatHistoryDrawer } from '@/components/mini/chat-history-drawer'
import { ExamineeFormScreen } from '@/components/mini/examinee-form-screen'
import { useExaminees } from '@/components/mini/examinee-store'
import { ShareCheckbox, ShareHeader, ShareSheet, type ShareItem } from '@/components/mini/chat-share'
import { ChatCard, cardKindText, detectCardKind, type CardKind } from '@/components/mini/ai-cards'
import {
  answerToText,
  confidenceMeta,
  getAnswer,
  quickPrompts,
  skills,
  testeeLabel,
  toTestee,
  type AiAnswer,
  type Confidence,
  type Mode,
  type SourceKind,
  type Testee,
} from '@/components/mini/ai-data'

type Answers = Record<Mode, AiAnswer>

type Message =
  | { id: number; role: 'user'; text: string; attachments?: Attachment[] }
  | { id: number; role: 'assistant'; answers: Answers | null; view: Mode }
  | { id: number; role: 'card'; kind: CardKind; ready: boolean }

type Session = { id: string; title: string; time: string; testeeId: string | null; messages: Message[] }

const modes = [
  { key: 'plain', label: '通俗版' },
  { key: 'pro', label: '专业版' },
] as const

let idSeed = 1000
const nextMessageId = () => idSeed++

function buildAnswers(question: string, hasTestee: boolean): Answers {
  return { plain: getAnswer(question, 'plain', hasTestee), pro: getAnswer(question, 'pro', hasTestee) }
}

function buildReply(question: string, hasTestee: boolean, mode: Mode, ready: boolean): Message {
  const kind = detectCardKind(question)
  if (kind) return { id: nextMessageId(), role: 'card', kind, ready }
  return { id: nextMessageId(), role: 'assistant', answers: ready ? buildAnswers(question, hasTestee) : null, view: mode }
}

function seedSession(id: string, question: string, time: string): Session {
  return {
    id,
    title: question,
    time,
    testeeId: null,
    messages: [{ id: nextMessageId(), role: 'user', text: question }, buildReply(question, false, 'plain', true)],
  }
}

function initialSessions(question: string | undefined, mode: Mode, testeeId: string | null): Session[] {
  const hasTestee = Boolean(testeeId)
  const history = [
    seedSession('s-r', '查看我的报告', '今天 10:26'),
    seedSession('s-1', '高血压用药注意事项', '今天 09:12'),
    seedSession('s-o', '我的订单进度', '昨天 22:05'),
    seedSession('s-2', '华法林剂量为什么因人而异？', '昨天 21:40'),
    seedSession('s-v', '推荐适合我的检测服务', '10月14日'),
    seedSession('s-3', 'CYP2C19 慢代谢是什么意思', '10月12日'),
  ]
  if (!question) return history
  return [
    {
      id: 's-init',
      title: question,
      time: '刚刚',
      testeeId,
      messages: [{ id: nextMessageId(), role: 'user', text: question }, buildReply(question, hasTestee, mode, true)],
    },
    ...history,
  ]
}

export type ChatRequest = { question: string; id: number }

export function AiChatScreen({
  initialMode = 'plain',
  initialTesteeId,
  initialQuestion,
  initialSheetOpen = false,
  initialDrawerOpen = false,
  initialSharing = false,
  request,
  active = true,
  onBack,
}: {
  initialMode?: Mode
  initialTesteeId?: string
  initialQuestion?: string
  initialSheetOpen?: boolean
  initialDrawerOpen?: boolean
  initialSharing?: boolean
  request?: ChatRequest | null
  active?: boolean
  onBack?: () => void
}) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [examinees, setExaminees] = useExaminees()
  const testeeList = examinees.map(toTestee)
  const [testeeId, setTesteeId] = useState<string | null>(initialTesteeId ?? null)
  const testee = testeeList.find((t) => t.id === testeeId) ?? null
  const [sheetOpen, setSheetOpen] = useState(initialSheetOpen)
  const [addTesteeOpen, setAddTesteeOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen)
  const [sessions, setSessions] = useState<Session[]>(() =>
    initialSessions(initialQuestion, initialMode, initialTesteeId ?? null),
  )
  const [currentId, setCurrentId] = useState<string | null>(initialQuestion ? 's-init' : null)
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const [shareIds, setShareIds] = useState<Set<number> | null>(() =>
    initialSharing ? new Set(sessions.find((s) => s.id === currentId)?.messages.map((m) => m.id) ?? []) : null,
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = sessions.find((s) => s.id === currentId)?.messages ?? []

  function switchTestee(nextId: string | null) {
    if (nextId !== testeeId && messages.length > 0) {
      stopSpeaking()
      setShareIds(null)
      setCurrentId(null)
    }
    setTesteeId(nextId)
  }

  function openSession(id: string) {
    stopSpeaking()
    setCurrentId(id)
    setTesteeId(sessions.find((s) => s.id === id)?.testeeId ?? null)
    setDrawerOpen(false)
  }
  const isReplying = messages.some(
    (m) => (m.role === 'assistant' && m.answers === null) || (m.role === 'card' && !m.ready),
  )
  const sharing = shareIds !== null
  const isComplete = (m: Message) => m.role === 'user' || (m.role === 'assistant' ? m.answers !== null : m.ready)
  const shareable = messages.filter(isComplete)
  const allShareSelected = sharing && shareable.length > 0 && shareable.every((m) => shareIds.has(m.id))

  let round = 0
  const roundOf = new Map<number, number>()
  for (const m of messages) {
    if (m.role === 'user') round++
    roundOf.set(m.id, round)
  }
  const selectedRounds = sharing ? new Set([...shareIds].map((id) => roundOf.get(id))).size : 0
  const shareItems: ShareItem[] = sharing
    ? shareable
        .filter((m) => shareIds.has(m.id))
        .map((m) =>
          m.role === 'user'
            ? { id: m.id, role: 'user', text: m.text }
            : m.role === 'card'
              ? { id: m.id, role: 'assistant', text: cardKindText[m.kind] }
              : { id: m.id, role: 'assistant', text: m.answers ? answerToText(m.answers[mode]) : '' },
        )
    : []

  function startShare() {
    stopSpeaking()
    setShareIds(new Set(shareable.map((m) => m.id)))
  }

  function toggleShare(id: number) {
    setShareIds((prev) => {
      if (!prev) return prev
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, currentId])

  function updateMessages(sessionId: string, fn: (prev: Message[]) => Message[]) {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, messages: fn(s.messages) } : s)))
  }

  function ask(text: string, attachments: Attachment[] = [], startNew = false) {
    if ((!startNew && isReplying) || (!text && attachments.length === 0)) return
    const question = text || (attachments.some((a) => a.kind === 'pdf') ? '请帮我解读这份报告' : '请帮我看看这张图片')
    const userMsg: Message = { id: nextMessageId(), role: 'user', text: question, attachments }
    const replyMsg = buildReply(question, Boolean(testee), mode, false)
    const replyId = replyMsg.id

    let sessionId = startNew ? null : currentId
    if (!sessionId) {
      sessionId = `s-${Date.now()}`
      const created: Session = {
        id: sessionId,
        title: question.slice(0, 20),
        time: '刚刚',
        testeeId,
        messages: [userMsg, replyMsg],
      }
      setSessions((prev) => [created, ...prev])
      setCurrentId(sessionId)
    } else {
      updateMessages(sessionId, (prev) => [...prev, userMsg, replyMsg])
      setSessions((prev) => [
        ...prev.filter((s) => s.id === sessionId).map((s) => ({ ...s, time: '刚刚' })),
        ...prev.filter((s) => s.id !== sessionId),
      ])
    }

    const answers = replyMsg.role === 'assistant' ? buildAnswers(question, Boolean(testee)) : null
    const targetId = sessionId
    window.setTimeout(() => {
      updateMessages(targetId, (prev) =>
        prev.map((m) => {
          if (m.id !== replyId) return m
          if (m.role === 'card') return { ...m, ready: true }
          if (m.role === 'assistant') return { ...m, answers }
          return m
        }),
      )
    }, 1200)
  }

  function stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeakingId(null)
  }

  function toggleSpeak(messageId: number, answer: AiAnswer) {
    if (!('speechSynthesis' in window)) return
    const wasSpeaking = speakingId === messageId
    window.speechSynthesis.cancel()
    if (wasSpeaking) {
      setSpeakingId(null)
      return
    }
    const utterance = new SpeechSynthesisUtterance(
      [answer.intro, ...answer.points, answer.tip ?? ''].join('。'),
    )
    utterance.lang = 'zh-CN'
    utterance.onend = () => setSpeakingId((id) => (id === messageId ? null : id))
    utterance.onerror = utterance.onend
    setSpeakingId(messageId)
    window.speechSynthesis.speak(utterance)
  }

  function regenerate(messageId: number) {
    if (!currentId || isReplying) return
    const index = messages.findIndex((m) => m.id === messageId)
    const question = messages
      .slice(0, index)
      .reverse()
      .find((m): m is Extract<Message, { role: 'user' }> => m.role === 'user')?.text
    if (!question) return
    if (speakingId === messageId) stopSpeaking()
    const sessionId = currentId
    updateMessages(sessionId, (prev) => prev.map((m) => (m.id === messageId && m.role === 'assistant' ? { ...m, answers: null } : m)))
    const answers = buildAnswers(question, Boolean(testee))
    window.setTimeout(() => {
      updateMessages(sessionId, (prev) => prev.map((m) => (m.id === messageId && m.role === 'assistant' ? { ...m, answers } : m)))
    }, 1200)
  }

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const handledRequestId = useRef<number | null>(null)
  useEffect(() => {
    if (!request || handledRequestId.current === request.id) return
    handledRequestId.current = request.id
    setDrawerOpen(false)
    ask(request.question, [], true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request])

  useEffect(() => {
    if (active) return
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeakingId(null)
    setDrawerOpen(false)
    setSheetOpen(false)
    setShareIds(null)
  }, [active])

  function startNewChat() {
    stopSpeaking()
    setCurrentId(null)
    setDrawerOpen(false)
  }

  const greeting = testee
    ? `你好，${testee.name}。已关联${testee.reports > 0 ? `${testee.reports}份历史报告` : '基本信息（暂无历史报告）'}，我会结合这些资料回答。`
    : '你好。本次未关联受检人，我会按通用知识回答；你也可以随时选择受检人或上传外部报告。'

  return (
    <div className="relative flex h-full flex-col bg-brand-page">
      <StatusBar />
      {sharing ? (
        <ShareHeader
          allSelected={allShareSelected}
          rounds={selectedRounds}
          onToggleAll={() => setShareIds(allShareSelected ? new Set() : new Set(shareable.map((m) => m.id)))}
        />
      ) : (
      <header className="relative flex h-11 items-center justify-center px-2 text-foreground">
        <div className="absolute left-1 flex items-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className="flex size-8 items-center justify-center rounded-full active:bg-white/70"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="历史对话"
            className="flex size-8 items-center justify-center rounded-full active:bg-white/70"
          >
            <Menu className="size-5" />
          </button>
        </div>
        <h2 className="text-title font-medium">AI咨询</h2>
        <div
          aria-hidden="true"
          className="absolute right-3 flex h-8 items-center gap-3 rounded-full border border-border bg-white/80 px-3"
        >
          <Ellipsis className="size-4" />
          <span className="h-4 w-px bg-border" />
          <Circle className="size-3.5" strokeWidth={3} />
        </div>
      </header>
      )}

      {!sharing && (
      <div className="shrink-0 px-4 pb-3 pt-2">
        <div className="flex items-center rounded-2xl bg-white py-1.5 pl-1.5 pr-2 shadow-[0_4px_14px_#3a82e40d]">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1.5 py-1 text-left active:bg-secondary/60"
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
              <strong className="block truncate text-note font-semibold text-foreground">
                {testee ? testeeLabel(testee) : '未选择受检人'}
              </strong>
              <span className="block truncate text-caption text-muted-foreground">
                {testee ? (testee.reports > 0 ? `${testee.reports}份历史报告` : '暂无历史报告') : '按通用知识回答'}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-faint" />
          </button>
          <span aria-hidden="true" className="mx-2 h-7 w-px shrink-0 bg-border" />
          <div role="radiogroup" aria-label="回答风格" className="flex shrink-0 rounded-full bg-muted p-0.5">
            {answerStyles.map((s) => {
              const selected = s.key === mode
              return (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${s.label}：${s.desc}`}
                  onClick={() => setMode(s.key)}
                  className={cn(
                    'h-7 rounded-full px-3 text-caption font-medium transition-colors',
                    selected ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  {s.short}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-3 [scrollbar-width:none]">
        {sharing ? (
          <p className="py-2 text-center text-caption text-muted-foreground">内容由 AI 生成</p>
        ) : (
        <section className="rounded-2xl border border-[#d6e6fb] bg-white/70 p-4">
          <h3 className="flex items-center gap-1.5 text-title font-bold text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            药问智能咨询
          </h3>
          <p className="mt-1.5 text-caption leading-5 text-muted-foreground">
            回答基于已授权资料和知识来源生成。医疗问题需结合专业人员判断；紧急或严重不适请及时就医。
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={skill.key}>
                <button
                  type="button"
                  onClick={() => ask(skill.question)}
                  disabled={isReplying}
                  className="rounded-full bg-secondary px-3 py-1.5 text-caption font-medium text-secondary-foreground transition-colors active:bg-[#d3e6fc] disabled:opacity-50"
                >
                  {skill.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
        )}

        <ul className={cn('flex flex-col gap-4', !sharing && 'mt-4')} aria-live="polite">
          {!sharing && (
            <li className="flex gap-2">
              <BrandMark className="size-8 shrink-0 rounded-lg text-body shadow-none" />
              <p className="max-w-[82%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-body leading-6 text-foreground shadow-[0_4px_14px_#3a82e40d]">
                {greeting}
              </p>
            </li>
          )}
          {messages.map((m) => {
            const content =
              m.role === 'user' ? (
                <div className="flex flex-col items-end gap-1.5">
                  {m.attachments && m.attachments.length > 0 && <MessageAttachments items={m.attachments} />}
                  <p className="max-w-[78%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-left text-body leading-6 text-white">
                    {m.text}
                  </p>
                </div>
              ) : m.role === 'card' ? (
                <div className="flex gap-2">
                  <BrandMark className="size-8 shrink-0 rounded-lg text-body shadow-none" />
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white px-3 py-3 text-left shadow-[0_4px_14px_#3a82e40d]">
                    {m.ready ? <ChatCard kind={m.kind} onAsk={(q) => ask(q)} /> : <TypingDots />}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <BrandMark className="size-8 shrink-0 rounded-lg text-body shadow-none" />
                  <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white px-3.5 py-3 text-left text-body leading-6 text-foreground shadow-[0_4px_14px_#3a82e40d]">
                    {m.answers ? (
                      <AnswerBody
                        answer={m.answers[mode]}
                        speaking={speakingId === m.id}
                        regenerateDisabled={isReplying}
                        hideActions={sharing}
                        onToggleSpeak={() => m.answers && toggleSpeak(m.id, m.answers[mode])}
                        onRegenerate={() => regenerate(m.id)}
                        onShare={startShare}
                      />
                    ) : (
                      <TypingDots />
                    )}
                  </div>
                </div>
              )

            if (!sharing) return <li key={m.id}>{content}</li>
            const selectable = isComplete(m)
            const checked = shareIds.has(m.id)
            return (
              <li key={m.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={m.role === 'user' ? `提问：${m.text}` : 'AI 回答'}
                  disabled={!selectable}
                  onClick={() => toggleShare(m.id)}
                  className="flex w-full items-start gap-2.5 text-left"
                >
                  <ShareCheckbox checked={checked} className={m.role === 'user' ? 'mt-2.5' : 'mt-1.5'} />
                  <div className="pointer-events-none min-w-0 flex-1">{content}</div>
                </button>
              </li>
            )
          })}
        </ul>

        {!sharing && messages.length === 0 && (
          <ul aria-label="推荐问题" className="mt-4 flex flex-col items-start gap-2 pl-10">
            {quickPrompts.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => ask(q)}
                  className="rounded-full border border-[#d6e6fb] bg-white px-3 py-1.5 text-caption text-secondary-foreground active:bg-secondary"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {sharing ? (
        <ShareSheet items={shareItems} onClose={() => setShareIds(null)} />
      ) : (
        <ChatComposer disabled={isReplying} onSend={ask} />
      )}

      {drawerOpen && (
        <ChatHistoryDrawer
          sessions={sessions.map((s) => ({
            ...s,
            testeeName: testeeList.find((t) => t.id === s.testeeId)?.name,
          }))}
          currentId={currentId}
          onClose={() => setDrawerOpen(false)}
          onSelect={openSession}
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
          list={testeeList}
          current={testee}
          onClose={() => setSheetOpen(false)}
          onAdd={() => setAddTesteeOpen(true)}
          onConfirm={(t) => {
            switchTestee(t?.id ?? null)
            setSheetOpen(false)
          }}
        />
      )}

      {addTesteeOpen && (
        <ExamineeFormScreen
          hasSelf={testeeList.some((t) => t.relation === '本人')}
          onBack={() => setAddTesteeOpen(false)}
          onSave={(e) => {
            setExaminees((list) => [...list, e])
            switchTestee(e.id)
            setAddTesteeOpen(false)
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
            <FileText className="size-7 shrink-0 text-destructive" />
            <span className="min-w-0">
              <span className="block truncate text-caption text-foreground">{a.name}</span>
              <span className="block text-tag text-muted-foreground">PDF</span>
            </span>
          </li>
        ),
      )}
    </ul>
  )
}

function TesteeSheet({
  list,
  current,
  onClose,
  onAdd,
  onConfirm,
}: {
  list: Testee[]
  current: Testee | null
  onClose: () => void
  onAdd: () => void
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
        className="relative rounded-t-[28px] bg-brand-page px-4 pb-7 pt-2.5 animate-in slide-in-from-bottom duration-300"
      >
        <span aria-hidden="true" className="mx-auto block h-1 w-9 rounded-full bg-border" />
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="testee-title" className="text-heading font-semibold text-foreground">
              选择受检人
            </h2>
            <p className="mt-1 text-caption text-muted-foreground">关联后 AI 将结合其检测报告作答，可跳过</p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-faint transition-colors active:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul
          role="radiogroup"
          aria-label="受检人"
          className="mt-4 divide-y divide-border/60 overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_#3a82e40d]"
        >
          {list.map((t) => {
            const active = selected === t.id
            return (
              <li key={t.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(t.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors',
                    active ? 'bg-secondary/50' : 'active:bg-brand-page',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full text-title font-semibold transition-colors',
                      active ? 'bg-primary text-white' : 'bg-secondary text-primary',
                    )}
                  >
                    {t.name.slice(-1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <strong className="text-title font-semibold text-foreground">{t.name}</strong>
                      <span className="rounded-md bg-muted px-1.5 py-px text-caption text-muted-foreground">
                        {t.relation}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-caption text-muted-foreground">
                      <span>{t.meta}</span>
                      <span aria-hidden="true" className="h-2.5 w-px bg-border" />
                      {t.reports > 0 ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <BookOpenCheck className="size-3" />
                          {t.reports} 份历史报告
                        </span>
                      ) : (
                        <span>暂无历史报告</span>
                      )}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors',
                      active ? 'border-primary bg-primary text-white' : 'border-border',
                    )}
                  >
                    {active && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={onAdd}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-body font-medium text-primary transition-colors active:bg-brand-page"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-primary/40">
                <Plus className="size-4" />
              </span>
              添加受检人
            </button>
          </li>
        </ul>

        <p className="mt-3 flex items-center justify-center gap-1 text-caption text-faint">
          <LockKeyhole className="size-3" />
          仅在授权范围内读取，信息加密保护
        </p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => onConfirm(null)}
            className="h-11 flex-1 rounded-full bg-white text-title font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--color-border)]"
          >
            暂不选择
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => onConfirm(list.find((t) => t.id === selected) ?? null)}
            className="h-11 flex-[1.4] rounded-full bg-primary text-title font-semibold text-white shadow-[0_6px_16px_#3a82e433] transition-opacity disabled:opacity-40 disabled:shadow-none"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  )
}

const confidenceStyles: Record<Confidence, string> = {
  high: 'bg-[#e8f7f1] text-[#1f8a5b]',
  medium: 'bg-[#fff4e0] text-[#b26a00]',
  low: 'bg-[#f1f3f6] text-[#6b7685]',
}

const sourceKindLabel: Record<SourceKind, string> = {
  report: '个人报告',
  guideline: '临床指南',
  label: '说明书',
  database: '数据库',
}

function AnswerBody({
  answer,
  speaking,
  regenerateDisabled,
  hideActions,
  onToggleSpeak,
  onRegenerate,
  onShare,
}: {
  answer: AiAnswer
  speaking: boolean
  regenerateDisabled: boolean
  hideActions?: boolean
  onToggleSpeak: () => void
  onRegenerate: () => void
  onShare: () => void
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [activeCite, setActiveCite] = useState<number | null>(null)
  const sourceIdPrefix = useId()

  function jumpToSource(n: number) {
    setSourcesOpen(true)
    setActiveCite(n)
    requestAnimationFrame(() => {
      document.getElementById(`${sourceIdPrefix}-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <p>{answer.intro}</p>
      <ol className="flex flex-col gap-1.5">
        {answer.points.map((point, i) => (
          <li key={point} className="flex gap-2">
            <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-secondary text-tag font-semibold text-secondary-foreground">
              {i + 1}
            </span>
            <span className="text-note leading-[22px]">
              {point}
              {answer.cites?.[i]?.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => jumpToSource(n)}
                  aria-label={`查看引用来源 ${n}：${answer.sources[n - 1]?.title ?? ''}`}
                  className="ml-0.5 inline-flex h-4 min-w-4 -translate-y-px items-center justify-center rounded bg-secondary px-1 align-middle text-tag font-semibold leading-none text-primary active:opacity-70"
                >
                  {n}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ol>
      {answer.tip && (
        <p className="rounded-xl bg-[#eefaf8] px-3 py-2 text-caption leading-5 text-[#2f8f86]">{answer.tip}</p>
      )}
      {answer.sources.length > 0 ? (
        <div className="rounded-xl bg-[#f5f8fd]">
          <button
            type="button"
            onClick={() => setSourcesOpen((v) => !v)}
            aria-expanded={sourcesOpen}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-caption font-medium text-secondary-foreground"
          >
            <BookOpenCheck className="size-3.5 shrink-0" aria-hidden />
            <span className="flex-1">引用来源 · {answer.sources.length}</span>
            <ChevronDown className={cn('size-3.5 transition-transform', sourcesOpen && 'rotate-180')} aria-hidden />
          </button>
          {sourcesOpen && (
            <ol className="flex flex-col gap-2 px-3 pb-2.5">
              {answer.sources.map((s, i) => (
                <li
                  key={s.title}
                  id={`${sourceIdPrefix}-${i + 1}`}
                  className={cn(
                    '-mx-1.5 flex gap-2 rounded-lg px-1.5 py-1 text-caption leading-[18px] transition-colors',
                    activeCite === i + 1 && 'bg-secondary',
                  )}
                >
                  <span className="mt-px shrink-0 font-semibold text-primary">[{i + 1}]</span>
                  <span className="min-w-0">
                    <span className="block text-foreground">{s.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 rounded px-1.5 py-px font-medium',
                          confidenceStyles[s.confidence],
                        )}
                      >
                        <ShieldCheck className="size-3" aria-hidden />
                        {confidenceMeta[s.confidence].label}
                      </span>
                      <span className="rounded bg-white px-1.5 py-px text-secondary-foreground">{sourceKindLabel[s.kind]}</span>
                      {s.org}
                      {s.level && <span>· 证据等级 {s.level}</span>}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        <p className="rounded-xl bg-[#f5f8fd] px-3 py-2 text-caption text-muted-foreground">暂无可引用的权威来源</p>
      )}
      {!hideActions && (
        <AnswerActions
          answer={answer}
          speaking={speaking}
          regenerateDisabled={regenerateDisabled}
          onToggleSpeak={onToggleSpeak}
          onRegenerate={onRegenerate}
          onShare={onShare}
        />
      )}
    </div>
  )
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API is blocked in some embedded webviews/iframes; fall back to execCommand.
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

function AnswerActions({
  answer,
  speaking,
  regenerateDisabled,
  onToggleSpeak,
  onRegenerate,
  onShare,
}: {
  answer: AiAnswer
  speaking: boolean
  regenerateDisabled: boolean
  onToggleSpeak: () => void
  onRegenerate: () => void
  onShare: () => void
}) {
  const [notice, setNotice] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function flash(text: string) {
    setNotice(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNotice(null), 1600)
  }

  async function copy() {
    flash((await copyText(answerToText(answer))) ? '已复制' : '复制失败')
  }

  const actions = [
    { key: 'speak', label: speaking ? '停止朗读' : '朗读', icon: speaking ? Square : Volume2, onClick: onToggleSpeak, active: speaking },
    { key: 'copy', label: '复制', icon: notice === '已复制' ? Check : Copy, onClick: copy },
    { key: 'share', label: '分享', icon: Share2, onClick: onShare },
    { key: 'retry', label: '重新回答', icon: RefreshCw, onClick: onRegenerate, disabled: regenerateDisabled },
  ]

  return (
    <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-2">
      <p className="text-caption text-muted-foreground" aria-live="polite">
        {notice ?? 'AI 生成，仅供参考'}
      </p>
      <div className="flex items-center gap-0.5">
        {actions.map(({ key, label, icon: Icon, onClick, active, disabled }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={key === 'speak' ? speaking : undefined}
            title={label}
            className={cn(
              'flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-secondary disabled:opacity-40',
              active && 'bg-secondary text-primary',
            )}
          >
            <Icon className={cn('size-[15px]', key === 'speak' && speaking && 'size-3 fill-current')} />
          </button>
        ))}
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
