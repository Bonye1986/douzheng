'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronRight, ClipboardList, Eye } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import {
  articles,
  banners,
  quizArticles,
  serviceCategories,
  type Article,
  type ServiceCategoryId,
} from '@/components/mini/services-data'
import { getSamplingModes, samplingLabel, testServices } from '@/components/mini/tests-data'
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
  return <SectionHeading id={id} title={title} action={action} onAction={onAction} className="mb-3" />
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
  report: '/images/icons/svc-report.png',
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

const RECOMMENDED_COUNT = 3

function RecommendedTests({ onOpenTest, onViewAllTests }: Pick<Props, 'onOpenTest' | 'onViewAllTests'>) {
  const items = testServices.slice(0, RECOMMENDED_COUNT)
  return (
    <section aria-labelledby="rec-tests" className="rounded-2xl bg-white p-4">
      <SectionHeader id="rec-tests" title="推荐检查" action="全部" onAction={onViewAllTests} />
      <ul className="flex flex-col divide-y divide-border">
        {items.map((t) => (
          <li key={t.id} className="py-3 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => onOpenTest?.(t.id)}
              className="flex w-full gap-3 text-left transition-opacity active:opacity-70"
            >
              <Image
                src={t.image}
                alt=""
                width={80}
                height={80}
                className="size-20 shrink-0 rounded-xl bg-secondary object-cover"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body font-medium text-foreground">{t.name}</span>
                <span className="mt-0.5 truncate text-caption text-muted-foreground">{t.summary}</span>
                <span className="mt-1 flex gap-1">
                  <span className="rounded bg-success-soft px-1.5 py-px text-tag text-success">
                    {getSamplingModes(t.id).includes('self') ? '支持居家自采' : samplingLabel.site}
                  </span>
                  {t.tags.slice(0, 1).map((tag) => (
                    <span key={tag} className="rounded bg-secondary px-1.5 py-px text-tag text-primary">
                      {tag}
                    </span>
                  ))}
                </span>
                <span className="mt-auto flex items-end justify-between pt-1">
                  <span className="flex items-baseline gap-1">
                    <span className="text-title font-bold text-warning">
                      <span className="text-caption">¥</span>
                      {t.price}
                    </span>
                    {t.originalPrice && (
                      <span className="text-caption text-faint line-through">¥{t.originalPrice}</span>
                    )}
                  </span>
                  <span className="text-caption text-muted-foreground">{t.sold}</span>
                </span>
              </span>
            </button>
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
    <section aria-labelledby={id} className="rounded-2xl bg-white p-4">
      <SectionHeader id={id} title={title} action="更多" onAction={onViewAll} />
  <ul className="-mb-1 divide-y divide-border/70">
  {items.slice(0, 3).map((a) => (
  <li key={a.id}>
  <button
  type="button"
  onClick={() => onOpenArticle?.(a.id)}
  className="flex w-full items-center gap-3 py-3.5 text-left transition-opacity active:opacity-70"
  >
  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
  <span className="line-clamp-1 text-title font-medium leading-snug text-foreground">{a.title}</span>
  <span className="line-clamp-1 text-caption leading-relaxed text-muted-foreground">{a.summary}</span>
  <span className="flex items-center gap-2.5 text-caption text-muted-foreground">
  <span className="rounded bg-secondary px-1.5 py-0.5 text-primary">{a.category}</span>
  <span className="flex items-center gap-1">
  <Eye className="size-3" aria-hidden="true" />
  {a.reads}
  </span>
  {a.survey && (
  <span className="flex items-center gap-0.5 rounded bg-warning-soft px-1.5 py-0.5 text-warning">
  <ClipboardList className="size-3" aria-hidden="true" />
  含问卷
  </span>
  )}
  </span>
  </span>
  <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
  </button>
  </li>
  ))}
  </ul>
    </section>
  )
}
