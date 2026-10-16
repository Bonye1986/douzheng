'use client'

import { useState } from 'react'
import { BookOpen, ChevronRight, Clock, Eye, Info, Sparkles } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { articleCategories, articles, type Article } from '@/components/mini/services-data'
import { cn } from '@/lib/utils'

function ArticleMeta({ article }: { article: Article }) {
  return (
    <span className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-0.5">
        <Clock className="size-3" aria-hidden="true" />
        <span className="tabular-nums">{article.minutes}</span> 分钟
      </span>
      <span className="flex items-center gap-0.5">
        <Eye className="size-3" aria-hidden="true" />
        <span className="tabular-nums">{article.reads}</span>
        <span className="sr-only">次阅读</span>
      </span>
    </span>
  )
}

function KnowledgeList({ onOpen }: { onOpen: (id: string) => void }) {
  const [category, setCategory] = useState<(typeof articleCategories)[number]>('全部')
  const filtered = category === '全部' ? articles : articles.filter((a) => a.category === category)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label="科普分类"
        className="flex shrink-0 gap-1.5 overflow-x-auto bg-white px-3 pb-2.5 pt-1 [scrollbar-width:none]"
      >
        {articleCategories.map((c) => {
          const active = c === category
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c)}
              className={cn(
                'h-7 shrink-0 rounded-full px-3 text-[12px] transition-colors',
                active ? 'bg-primary font-medium text-primary-foreground' : 'bg-[#f2f5fa] text-foreground',
              )}
            >
              {c}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:none]">
        {filtered.length > 0 ? (
          <ul className="overflow-hidden rounded-2xl bg-white" aria-label="科普文章">
            {filtered.map((a, i) => (
              <li key={a.id} className={i > 0 ? 'border-t border-[#eef1f6]' : ''}>
                <button
                  type="button"
                  onClick={() => onOpen(a.id)}
                  className="flex w-full items-start gap-3 p-3 text-left transition-opacity active:opacity-70"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-[#e0651c]">
                    <BookOpen className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[14px] font-medium leading-snug text-foreground">{a.title}</span>
                    <span className="mt-1 line-clamp-2 block text-[12px] leading-relaxed text-muted-foreground">
                      {a.summary}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="rounded bg-[#f2f5fa] px-1.5 py-px text-[10px] text-muted-foreground">
                        {a.category}
                      </span>
                      <ArticleMeta article={a} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pt-16 text-center text-[13px] text-muted-foreground">该分类暂无文章</p>
        )}
      </div>
    </div>
  )
}

function KnowledgeDetail({
  article,
  onOpen,
  onAskAi,
}: {
  article: Article
  onOpen: (id: string) => void
  onAskAi?: (question: string) => void
}) {
  const sameCategory = articles.filter((a) => a.id !== article.id && a.category === article.category)
  const related = (sameCategory.length ? sameCategory : articles.filter((a) => a.id !== article.id)).slice(0, 3)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none]">
        <article className="bg-white px-4 pb-5 pt-3">
          <span className="rounded bg-[#fff1e8] px-1.5 py-0.5 text-[11px] text-[#e0651c]">{article.category}</span>
          <h2 className="mt-2 text-[19px] font-semibold leading-snug text-foreground text-balance">{article.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
            <span>{article.author}</span>
            <span className="tabular-nums">{article.updated}</span>
            <ArticleMeta article={article} />
          </div>

          <p className="mt-3 rounded-xl bg-[#f4f8fe] p-3 text-[13px] leading-relaxed text-muted-foreground">
            {article.summary}
          </p>

          <div className="mt-3 space-y-3">
            {article.content.map((b, i) => {
              if (b.type === 'h')
                return (
                  <h3 key={i} className="flex items-center gap-1.5 pt-1 text-[15px] font-semibold text-foreground">
                    <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                    {b.text}
                  </h3>
                )
              if (b.type === 'p')
                return (
                  <p key={i} className="text-[14px] leading-relaxed text-foreground/85">
                    {b.text}
                  </p>
                )
              if (b.type === 'list')
                return (
                  <ul key={i} className="space-y-2">
                    {b.items.map((s, j) => (
                      <li key={j} className="flex gap-2 text-[14px] leading-relaxed text-foreground/85">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                )
              return (
                <aside key={i} className="flex gap-2 rounded-xl bg-[#fff7ee] p-3 text-[13px] leading-relaxed text-[#9a5a1e]">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>{b.text}</p>
                </aside>
              )
            })}
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
            本文仅供健康科普，不能替代医生诊断与治疗建议。
          </p>
        </article>

        <section aria-labelledby="knowledge-related" className="mt-2.5 bg-white px-4 py-3">
          <h3 id="knowledge-related" className="text-[14px] font-semibold text-foreground">
            相关阅读
          </h3>
          <ul className="mt-1">
            {related.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onOpen(a.id)} className="flex w-full items-center gap-2.5 py-2.5 text-left">
                  <BookOpen className="size-4 shrink-0 text-[#e0651c]" aria-hidden="true" />
                  <span className="flex-1 truncate text-[13px] text-foreground">{a.title}</span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="shrink-0 border-t border-[#eef1f6] bg-white px-3 pb-6 pt-2.5">
        <button
          type="button"
          onClick={() => onAskAi?.(article.title)}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-medium text-primary-foreground"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          问问 AI 了解更多
        </button>
      </div>
    </div>
  )
}

export function KnowledgeScreen({
  initialArticleId,
  onBack,
  onAskAi,
}: {
  initialArticleId?: string
  onBack: () => void
  onAskAi?: (question: string) => void
}) {
  const [articleId, setArticleId] = useState<string | null>(initialArticleId ?? null)
  const article = articles.find((a) => a.id === articleId)
  // Entered straight from an article on 服务, so back should return there instead of the list.
  const enteredFromArticle = Boolean(initialArticleId)

  if (article) {
    return (
      <SubPage
        key={article.id}
        title="文章详情"
        titleId="knowledge-detail-title"
        onBack={() => (enteredFromArticle && article.id === initialArticleId ? onBack() : setArticleId(null))}
      >
        <KnowledgeDetail article={article} onOpen={setArticleId} onAskAi={onAskAi} />
      </SubPage>
    )
  }

  return (
    <SubPage title="知识科普" titleId="knowledge-title" onBack={onBack}>
      <KnowledgeList onOpen={setArticleId} />
    </SubPage>
  )
}
