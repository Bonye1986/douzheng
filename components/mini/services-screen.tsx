'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import {
  articles,
  banners,
  quizArticles,
  serviceCategories,
  type Article,
  type ServiceCategoryId,
} from '@/components/mini/services-data'
import { testServices } from '@/components/mini/tests-data'
import { ServiceCard } from '@/components/mini/tests-screen'
import { ArticleRow } from '@/components/mini/knowledge-screen'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/mini/section-heading'

type Props = {
  onOpenChat?: (question?: string) => void
  onCategory?: (id: ServiceCategoryId) => void
  onOpenTest?: (id: string) => void
  onViewAllTests?: () => void
  onOpenArticle?: (id: string) => void
  onViewAllArticles?: () => void
  onOpenQuizArticle?: (id: string) => void
  onViewAllQuiz?: () => void
  initialSection?: 'quiz'
}

export function ServicesScreen({
  onOpenChat,
  onCategory,
  onOpenTest,
  onViewAllTests,
  onOpenArticle,
  onViewAllArticles,
  onOpenQuizArticle,
  onViewAllQuiz,
  initialSection,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    const target = initialSection && container?.querySelector<HTMLElement>(`[aria-labelledby="${initialSection}"]`)
    if (container && target) container.scrollTop = target.offsetTop - 12
  }, [initialSection])

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="bg-white">
        <StatusBar />
        <header className="relative flex h-11 shrink-0 items-center justify-center">
          <h1 className="text-heading font-semibold text-foreground">服务</h1>
          <Capsule className="absolute right-3" />
        </header>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto pb-24 [scrollbar-width:none]">
        <div className="flex flex-col gap-3 px-4 pt-3">
          <BannerCarousel />
          <CategoryGrid onCategory={onCategory} />
          <RecommendedTests onOpenTest={onOpenTest} onViewAllTests={onViewAllTests} />
          <ArticleSection
            id="knowledge"
            title="知识科普"
            items={articles}
            onOpenArticle={onOpenArticle}
            onViewAll={onViewAllArticles}
          />
          <ArticleSection
            id="quiz"
            title="互动问答"
            items={quizArticles}
            onOpenArticle={onOpenQuizArticle}
            onViewAll={onViewAllQuiz}
          />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  id,
  title,
  action,
  onAction,
}: {
  id: string
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <SectionHeading
      id={id}
      title={title}
      action={action}
      onAction={onAction}
      icon={SECTION_ICONS[id]}
      className="mb-3"
    />
  )
}

const SECTION_ICONS: Record<string, string> = {
  'rec-tests': '/images/icons/sec-rec.png',
  knowledge: '/images/icons/sec-knowledge.png',
  quiz: '/images/icons/sec-qa.png',
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
              <p className={cn('text-heading font-bold', b.tone === 'dark' ? 'text-white' : 'text-foreground')}>
                {b.title}
              </p>
              <p className={cn('text-caption', b.tone === 'dark' ? 'text-white/80' : 'text-muted-foreground')}>
                {b.subtitle}
              </p>
              <span className="mt-1.5 w-fit rounded-full bg-primary px-3 py-1 text-caption font-medium text-primary-foreground">
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

const categoryIcons: Record<ServiceCategoryId, string> = {
  tests: '/images/icons/svc-tests.png',
  health: '/images/icons/svc-health.png',
  knowledge: '/images/icons/svc-knowledge.png',
  remind: '/images/icons/svc-remind.png',
}

function CategoryGrid({ onCategory }: Pick<Props, 'onCategory'>) {
  return (
    <section aria-label="服务分类" className="rounded-2xl bg-white px-2 py-4">
      <ul className="grid grid-cols-4">
        {serviceCategories.map(({ id, label }) => {
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onCategory?.(id)}
                className="group flex w-full flex-col items-center gap-2"
              >
                <span className="relative size-10 transition-transform group-active:scale-95">
                  <Image
                    src={categoryIcons[id] || '/placeholder.svg'}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </span>
                <span className="text-caption text-foreground/80">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const RECOMMENDED_COUNT = 4

function RecommendedTests({ onOpenTest, onViewAllTests }: Pick<Props, 'onOpenTest' | 'onViewAllTests'>) {
  const items = testServices.filter((s) => !s.offShelf).slice(0, RECOMMENDED_COUNT)
  return (
    <section aria-labelledby="rec-tests">
      <div className="px-1">
        <SectionHeader id="rec-tests" title="推荐检测" action="全部" onAction={onViewAllTests} />
      </div>
      <ul className="grid grid-cols-2 gap-2.5">
        {items.map((t) => (
          <li key={t.id} className="flex">
            <ServiceCard service={t} onOpen={() => onOpenTest?.(t.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ArticleSection({
  id,
  title,
  items,
  onOpenArticle,
  onViewAll,
}: {
  id: string
  title: string
  items: Article[]
  onOpenArticle?: (id: string) => void
  onViewAll?: () => void
}) {
  return (
    <section aria-labelledby={id}>
      <div className="px-1">
        <SectionHeader id={id} title={title} action="更多" onAction={onViewAll} />
      </div>
      <ul className="overflow-hidden rounded-2xl bg-white">
        {items.slice(0, 3).map((a, i) => (
          <li key={a.id} className={i > 0 ? 'border-t border-border' : ''}>
            <ArticleRow article={a} onOpen={() => onOpenArticle?.(a.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}
