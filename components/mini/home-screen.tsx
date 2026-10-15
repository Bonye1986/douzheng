'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ChevronRight, Ellipsis, Circle, Mic, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBar } from '@/components/mini/phone-frame'
import { BrandMark } from '@/components/mini/auth-parts'
import { TabBar } from '@/components/mini/tab-bar'
import { fallbackAnswer, presetQuestions, type Answer } from '@/components/mini/home-data'

type Message =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; answer: Answer | null }

function findAnswer(text: string) {
  return presetQuestions.find((item) => item.question === text)?.answer ?? fallbackAnswer
}

function buildConversation(question: string): Message[] {
  return [
    { id: 1, role: 'user', text: question },
    { id: 2, role: 'assistant', answer: findAnswer(question) },
  ]
}

export function HomeScreen({ initialQuestion }: { initialQuestion?: string }) {
  const [messages, setMessages] = useState<Message[]>(() =>
    initialQuestion ? buildConversation(initialQuestion) : [],
  )
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(messages.length + 1)
  const isReplying = messages.some((m) => m.role === 'assistant' && m.answer === null)
  const inChat = messages.length > 0

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
    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? { ...m, answer: findAnswer(question) } : m)),
      )
    }, 1200)
  }

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#e6f1fe_0%,#f4f8fe_38%)]">
      <StatusBar />
      <header className="flex h-12 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-9 rounded-xl text-base shadow-none" />
          <div className="leading-tight">
            <p className="text-[16px] font-bold text-foreground">药问基因</p>
            <p className="text-[11px] text-muted-foreground">都正生物</p>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="flex h-8 items-center gap-3 rounded-full border border-border bg-white/80 px-3 text-foreground"
        >
          <Ellipsis className="size-4" />
          <span className="h-4 w-px bg-border" />
          <Circle className="size-3.5" strokeWidth={3} />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:none]">
        {inChat ? (
          <ChatView messages={messages} onNewChat={() => setMessages([])} />
        ) : (
          <WelcomeView onAsk={ask} />
        )}
      </div>

      <div className="shrink-0 px-4 pb-3 pt-2">
        {inChat && (
          <ul aria-label="推荐问题" className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
            {presetQuestions.slice(0, 4).map((item) => (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => ask(item.question)}
                  disabled={isReplying}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-secondary-foreground transition-colors active:bg-secondary disabled:opacity-50"
                >
                  {item.question}
                </button>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(draft)
          }}
          className="flex h-12 items-center gap-2 rounded-full border border-border bg-white pl-3 pr-1.5 shadow-[0_6px_20px_#3b8beb14] focus-within:border-primary"
        >
          <button type="button" aria-label="语音输入" className="flex size-8 items-center justify-center rounded-full text-muted-foreground">
            <Mic className="size-[18px]" />
          </button>
          <label htmlFor="home-ask" className="sr-only">
            输入用药问题
          </label>
          <input
            id="home-ask"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            placeholder="输入您的用药或基因问题"
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

      <TabBar active="home" />
    </div>
  )
}

function WelcomeView({ onAsk }: { onAsk: (q: string) => void }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#5aa6f5_0%,#3b8beb_60%,#5cc6d6_100%)] p-5 text-white">
        <div aria-hidden="true" className="absolute -right-8 -top-10 size-36 rounded-full bg-white/15" />
        <div aria-hidden="true" className="absolute -bottom-12 right-10 size-24 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px]">
            <Sparkles className="size-3" />
            AI 用药助手
          </span>
          <h2 className="mt-3 text-[20px] font-bold leading-snug">您好，我是药问小助手</h2>
          <p className="mt-1.5 text-[13px] leading-5 text-white/85">
            结合药物基因组学知识，为您解答用药疑问。
          </p>
        </div>
      </section>

      <section aria-labelledby="hot-q">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 id="hot-q" className="flex items-center gap-2 text-[16px] font-bold text-foreground">
            <span className="h-4 w-1 rounded-full bg-primary" />
            大家都在问
          </h3>
          <span className="text-[12px] text-muted-foreground">点击即可提问</span>
        </div>
        <ul className="flex flex-col gap-2">
          {presetQuestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onAsk(item.question)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-[0_4px_14px_#3b8beb0d] transition-transform active:scale-[0.98]"
              >
                <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                  {item.category}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">{item.question}</span>
                <ChevronRight className="size-4 shrink-0 text-[#b8c2d6]" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        内容仅供参考，不能替代医生的诊疗建议
      </p>
    </div>
  )
}

function ChatView({ messages, onNewChat }: { messages: Message[]; onNewChat: () => void }) {
  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[12px] text-muted-foreground"
        >
          <Plus className="size-3.5" />
          新对话
        </button>
      </div>
      <ul className="flex flex-col gap-4" aria-live="polite">
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
  )
}

function AnswerBody({ answer }: { answer: Answer }) {
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
      <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span>仅供参考，请遵医嘱</span>
        <a href="#" className="font-medium text-primary">
          了解相关检测
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
          className={cn('size-1.5 animate-bounce rounded-full bg-primary/60')}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}
