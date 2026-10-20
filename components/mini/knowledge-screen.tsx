'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, ClipboardList, Clock, Eye, Info, Search, Sparkles, Users, X } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import {
  articleCategories,
  articles as knowledgeArticles,
  quizArticles,
  quizCategories,
  type Article,
  type Survey,
} from '@/components/mini/services-data'
import { SurveyScreen, type SurveyAnswers } from '@/components/mini/survey-screen'

export type ArticleKind = 'knowledge' | 'quiz'

const sources = {
  knowledge: { title: '知识科普', listLabel: '科普文章', categories: articleCategories, items: knowledgeArticles },
  quiz: { title: '互动问答', listLabel: '问答文章', categories: quizCategories, items: quizArticles },
} satisfies Record<ArticleKind, { title: string; listLabel: string; categories: readonly string[]; items: Article[] }>
import { cn } from '@/lib/utils'

function ArticleMeta({ article }: { article: Article }) {
  return (
    <span className="flex items-center gap-2.5 text-caption text-muted-foreground">
      <span className="flex items-center gap-0.5">
        <Eye className="size-3" aria-hidden="true" />
        <span className="tabular-nums">{article.reads}</span>
        <span className="sr-only">次阅读</span>
      </span>
    </span>
  )
}

export function ArticleRow({
  article: a,
  answered = false,
  onOpen,
}: {
  article: Article
  answered?: boolean
  onOpen?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 p-3 text-left transition-opacity active:opacity-70"
    >
      <Image
        src={a.cover}
        alt=""
        width={88}
        height={88}
        sizes="88px"
        className="size-[88px] shrink-0 rounded-xl bg-secondary object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-body font-medium leading-snug text-foreground">{a.title}</span>
        <span className="mt-1 line-clamp-2 text-caption leading-relaxed text-muted-foreground">{a.summary}</span>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="rounded bg-muted px-1.5 py-px text-tag text-muted-foreground">{a.category}</span>
          <ArticleMeta article={a} />
          {a.survey && (
            <span
              className={cn(
                'ml-auto flex items-center gap-0.5 rounded px-1.5 py-px text-tag',
                answered ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
              )}
            >
              {answered ? '已参与' : '含问卷'}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

function KnowledgeList({
  kind,
  onOpen,
  answered,
}: {
  kind: ArticleKind
  onOpen: (id: string) => void
  answered: Record<string, SurveyAnswers>
}) {
  const { categories, items: articles, listLabel } = sources[kind]
  const [category, setCategory] = useState<string>('全部')
  const [keyword, setKeyword] = useState('')
  const query = keyword.trim().toLowerCase()
  const filtered = articles.filter(
    (a) =>
      (category === '全部' || a.category === category) &&
      (!query || a.title.toLowerCase().includes(query) || a.summary.toLowerCase().includes(query)),
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 bg-white px-3 pt-2.5">
        <label className="flex h-9 items-center gap-2 rounded-full bg-muted px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">搜索{sources[kind].title}</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索文章标题或内容"
            className="h-full min-w-0 flex-1 bg-transparent text-caption text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              aria-label="清空搜索"
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/30 text-white"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          )}
        </label>
      </div>
      <div
        role="tablist"
        aria-label={`${sources[kind].title}分类`}
        className="flex shrink-0 gap-1.5 overflow-x-auto items-center bg-white px-3 py-2.5 [scrollbar-width:none]"
      >
        {categories.map((c) => {
          const active = c === category
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c)}
              className={cn(
                'h-7 shrink-0 rounded-full px-3 text-caption transition-colors',
                active ? 'bg-primary font-medium text-primary-foreground' : 'bg-muted text-foreground',
              )}
            >
              {c}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:none]">
        {filtered.length > 0 ? (
          <ul className="overflow-hidden rounded-2xl bg-white" aria-label={listLabel}>
            {filtered.map((a, i) => (
              <li key={a.id} className={i > 0 ? 'border-t border-border' : ''}>
                <ArticleRow article={a} answered={!!answered[a.id]} onOpen={() => onOpen(a.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="pt-16 text-center text-note text-muted-foreground">
            {query ? '没有找到相关文章，换个关键词试试' : '该分类暂无文章'}
          </p>
        )}
      </div>
    </div>
  )
}

function SurveyEntry({
  survey,
  answered,
  onOpen,
}: {
  survey: Survey
  answered: boolean
  onOpen: () => void
}) {
  return (
    <aside
      aria-label={survey.title}
      className="flex items-center gap-3 rounded-2xl border border-[#d6e4fb] bg-gradient-to-r from-[#eef4fe] to-[#f7faff] p-3.5"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <ClipboardList className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-semibold text-foreground">{survey.title}</span>
        <span className="mt-0.5 flex items-center gap-2 text-caption text-muted-foreground">
          <span>共 {survey.questions.length} 题</span>
          <span className="flex items-center gap-0.5">
            <Users className="size-3" aria-hidden="true" />
            {survey.participants} 人已参与
          </span>
        </span>
      </span>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-caption font-medium',
          answered ? 'bg-success-soft text-success' : 'bg-primary text-primary-foreground',
        )}
      >
        {answered && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
        {answered ? '查看结果' : '参与问卷'}
      </button>
    </aside>
  )
}

function KnowledgeDetail({
  article,
  answered,
  onOpenSurvey,
}: {
  article: Article
  answered: boolean
  onOpenSurvey: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none]">
        <article className="bg-white px-4 pb-5 pt-3">
          <span className="rounded bg-secondary px-1.5 py-0.5 text-caption text-primary">{article.category}</span>
          <h2 className="mt-2 text-heading font-semibold leading-snug text-foreground text-balance">{article.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-caption text-muted-foreground">
            <span>{article.author}</span>
            <span className="tabular-nums">{article.updated}</span>
            <ArticleMeta article={article} />
          </div>

          <p className="mt-3 rounded-xl bg-background p-3 text-note leading-relaxed text-muted-foreground">
            {article.summary}
          </p>

          <div className="mt-3 space-y-3">
            {article.content.map((b, i) => {
              if (b.type === 'survey') return null
              if (b.type === 'h')
                return (
                  <h3 key={i} className="flex items-center gap-1.5 pt-1 text-title font-semibold text-foreground">
                    <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                    {b.text}
                  </h3>
                )
              if (b.type === 'p')
                return (
                  <p key={i} className="text-body leading-relaxed text-foreground/85">
                    {b.text}
                  </p>
                )
              if (b.type === 'list')
                return (
                  <ul key={i} className="space-y-2">
                    {b.items.map((s, j) => (
                      <li key={j} className="flex gap-2 text-body leading-relaxed text-foreground/85">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )
              return (
                <aside key={i} className="flex gap-2 rounded-xl bg-[#fff7ee] p-3 text-note leading-relaxed text-[#9a5a1e]">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>{b.text}</p>
                </aside>
              )
            })}
          </div>

          <p className="mt-5 text-caption leading-relaxed text-muted-foreground">
            本文仅供健康科普，不能替代医生诊断与治疗建议。
          </p>
        </article>
      </div>

      {article.survey && (
        <div className="shrink-0 border-t border-border bg-white px-3 pb-6 pt-2.5">
          <SurveyEntry survey={article.survey} answered={answered} onOpen={onOpenSurvey} />
        </div>
      )}
    </div>
  )
}

export function KnowledgeScreen({
  kind = 'knowledge',
  initialArticleId,
  initialSurveyOpen = false,
  onBack,
}: {
  kind?: ArticleKind
  initialArticleId?: string
  /** Opens the article's 问卷 directly (design board entry). */
  initialSurveyOpen?: boolean
  onBack: () => void
}) {
  const { items: articles, title } = sources[kind]
  const [articleId, setArticleId] = useState<string | null>(initialArticleId ?? null)
  const [surveyOpen, setSurveyOpen] = useState(initialSurveyOpen)
  const [answers, setAnswers] = useState<Record<string, SurveyAnswers>>({})
  const article = articles.find((a) => a.id === articleId)
  // Entered straight from an article on 服务, so back should return there instead of the list.
  const enteredFromArticle = Boolean(initialArticleId)

  if (article?.survey && surveyOpen) {
    return (
      <SurveyScreen
        key={article.survey.id}
        survey={article.survey}
        initialAnswers={answers[article.id]}
        onBack={() => setSurveyOpen(false)}
        onSubmit={(value) => setAnswers((prev) => ({ ...prev, [article.id]: value }))}
      />
    )
  }

  if (article) {
    return (
      <SubPage
        key={article.id}
        title="文章详情"
        titleId={`${kind}-detail-title`}
        onBack={() => (enteredFromArticle && article.id === initialArticleId ? onBack() : setArticleId(null))}
      >
        <KnowledgeDetail
          article={article}
          answered={Boolean(answers[article.id])}
          onOpenSurvey={() => setSurveyOpen(true)}
        />
      </SubPage>
    )
  }

  return (
    <SubPage title={title} titleId={`${kind}-title`} onBack={onBack}>
      <KnowledgeList kind={kind} onOpen={setArticleId} answered={answers} />
    </SubPage>
  )
}
