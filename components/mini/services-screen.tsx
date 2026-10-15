'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { BookOpen, CheckCircle2, ChevronRight, Eye, Lightbulb, XCircle } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import {
  articles,
  banners,
  quizTopics,
  recommendedTests,
  serviceCategories,
} from '@/components/mini/services-data'
import { cn } from '@/lib/utils'

type Props = { onOpenChat?: (question?: string) => void }

export function ServicesScreen({ onOpenChat }: Props) {
  return (
    <div className="flex h-full flex-col bg-[#f4f8fe]">
      <div className="bg-white">
        <StatusBar />
        <header className="relative flex h-11 shrink-0 items-center justify-center">
          <h1 className="text-[17px] font-semibold text-foreground">服务</h1>
          <Capsule className="absolute right-3" />
        </header>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 [scrollbar-width:none]">
        <div className="flex flex-col gap-3 px-4 pt-3">
          <BannerCarousel />
          <CategoryGrid onOpenChat={onOpenChat} />
          <RecommendedTests />
          <KnowledgeList />
          <DailyQuiz onOpenChat={onOpenChat} />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ id, title, action }: { id: string; title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 id={id} className="text-[15px] font-semibold text-foreground">
        {title}
      </h2>
      {action && (
        <button type="button" className="flex items-center text-[12px] text-muted-foreground">
          {action}
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function BannerCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      const el = trackRef.current
      if (!el) return
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section aria-roledescription="carousel" aria-label="活动推荐" className="relative">
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none]"
      >
        {banners.map((b, i) => (
          <div
            key={b.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${banners.length}`}
            className="relative aspect-[16/7] w-full shrink-0 snap-center overflow-hidden"
          >
            <Image src={b.image} alt="" fill sizes="343px" className="object-cover" priority={i === 0} />
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center gap-1 pl-4">
              <p className={cn('text-[17px] font-bold', b.tone === 'dark' ? 'text-white' : 'text-foreground')}>
                {b.title}
              </p>
              <p className={cn('text-[12px]', b.tone === 'dark' ? 'text-white/80' : 'text-muted-foreground')}>
                {b.subtitle}
              </p>
              <span className="mt-1.5 w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground">
                {b.cta}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden="true">
        {banners.map((b, i) => (
          <span
            key={b.id}
            className={cn('h-1 rounded-full transition-all', i === index ? 'w-3.5 bg-white' : 'w-1 bg-white/50')}
          />
        ))}
      </div>
    </section>
  )
}

function CategoryGrid({ onOpenChat }: Props) {
  return (
    <section aria-label="服务分类" className="rounded-2xl bg-white px-2 py-4">
      <ul className="grid grid-cols-4 gap-y-4">
        {serviceCategories.map(({ id, label, image, color, chatQuestion }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => chatQuestion && onOpenChat?.(chatQuestion)}
              className="flex w-full flex-col items-center gap-1.5"
            >
              <span className={cn('flex size-12 items-center justify-center rounded-2xl', color)}>
                <Image src={image} alt="" width={36} height={36} className="size-9 object-contain" />
              </span>
              <span className="text-[12px] text-foreground">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function RecommendedTests() {
  return (
    <section aria-labelledby="rec-tests" className="rounded-2xl bg-white p-4">
      <SectionHeader id="rec-tests" title="推荐检查" action="全部" />
      <ul className="flex flex-col divide-y divide-border">
        {recommendedTests.map((t) => (
          <li key={t.id} className="py-3 first:pt-0 last:pb-0">
            <button type="button" className="flex w-full gap-3 text-left">
              <span className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#e6f1fe,#cfe3fd)]">
                <Image src="/images/drugene-icon.png" alt="" width={40} height={40} className="size-10 object-contain" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[14px] font-medium text-foreground">{t.name}</span>
                <span className="mt-0.5 truncate text-[12px] text-muted-foreground">{t.desc}</span>
                <span className="mt-1 flex gap-1">
                  {t.tags.map((tag) => (
                    <span key={tag} className="rounded bg-[#e8f1fe] px-1.5 py-px text-[10px] text-primary">
                      {tag}
                    </span>
                  ))}
                </span>
                <span className="mt-auto flex items-end justify-between pt-1">
                  <span className="flex items-baseline gap-1">
                    <span className="text-[16px] font-bold text-[#f07a2c]">
                      <span className="text-[11px]">¥</span>
                      {t.price}
                    </span>
                    {t.originalPrice && (
                      <span className="text-[11px] text-[#b8c2d6] line-through">¥{t.originalPrice}</span>
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t.sold}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function KnowledgeList() {
  return (
    <section aria-labelledby="knowledge" className="rounded-2xl bg-white p-4">
      <SectionHeader id="knowledge" title="知识科普" action="更多" />
      <ul className="flex flex-col gap-3">
        {articles.map((a) => (
          <li key={a.id}>
            <button type="button" className="flex w-full items-start gap-3 text-left">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fff1e8] text-[#f07a2c]">
                <BookOpen className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-[14px] text-foreground">{a.title}</span>
                <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{a.category}</span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="size-3" aria-hidden="true" />
                    {a.reads}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DailyQuiz({ onOpenChat }: Props) {
  const [topicId, setTopicId] = useState(quizTopics[0].id)
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  const topic = quizTopics.find((t) => t.id === topicId) ?? quizTopics[0]
  const quiz = topic.questions[step]
  const answered = picked !== null
  const correct = picked === quiz.answerId
  const isLast = step === topic.questions.length - 1
  const answerLabel = quiz.answerId.toUpperCase()

  const selectTopic = (id: string) => {
    setTopicId(id)
    setStep(0)
    setPicked(null)
  }

  const next = () => {
    setStep((s) => (isLast ? 0 : s + 1))
    setPicked(null)
  }

  return (
    <section aria-labelledby="quiz" className="rounded-2xl bg-white p-4">
      <h2 id="quiz" className="mb-3 flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
        <Lightbulb className="size-4 text-[#f07a2c]" aria-hidden="true" />
        互动问答
      </h2>

      <div
        role="tablist"
        aria-label="问答主题"
        className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
      >
        {quizTopics.map((t) => {
          const active = t.id === topic.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTopic(t.id)}
              className={cn(
                'h-7 shrink-0 rounded-full px-3 text-[12px] transition-colors',
                active ? 'bg-primary font-medium text-primary-foreground' : 'bg-[#f1f5fb] text-muted-foreground',
              )}
            >
              {t.title}
            </button>
          )
        })}
      </div>

      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-medium text-foreground">{quiz.question}</p>
        <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {step + 1}/{topic.questions.length}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label={quiz.question}>
        {quiz.options.map((o) => {
          const isAnswer = o.id === quiz.answerId
          const isPicked = o.id === picked
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={answered}
              onClick={() => setPicked(o.id)}
              className={cn(
                'flex h-11 items-center justify-between rounded-xl border px-4 text-left text-[13px] transition-colors',
                !answered && 'border-border bg-[#f8fafd] text-foreground active:bg-[#eef3fa]',
                answered && isAnswer && 'border-[#1f9d6b] bg-[#e9f8f1] text-[#1f9d6b]',
                answered && isPicked && !isAnswer && 'border-[#e04a5a] bg-[#feecee] text-[#e04a5a]',
                answered && !isAnswer && !isPicked && 'border-border bg-[#f8fafd] text-muted-foreground',
              )}
            >
              <span>
                {o.id.toUpperCase()}. {o.text}
              </span>
              {answered && isAnswer && <CheckCircle2 className="size-4" aria-hidden="true" />}
              {answered && isPicked && !isAnswer && <XCircle className="size-4" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="mt-3 rounded-xl bg-[#f4f8fe] p-3" aria-live="polite">
          <p className={cn('text-[13px] font-medium', correct ? 'text-[#1f9d6b]' : 'text-[#e04a5a]')}>
            {correct ? '回答正确！' : `再想想～正确答案是 ${answerLabel}`}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{quiz.explanation}</p>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenChat?.(quiz.question)}
              className="flex items-center text-[12px] font-medium text-primary"
            >
              问问 AI 了解更多
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              className="h-7 rounded-full bg-primary px-3 text-[12px] font-medium text-primary-foreground"
            >
              {isLast ? '再答一轮' : '下一题'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
