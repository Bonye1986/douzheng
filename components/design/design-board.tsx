'use client'

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, PlayCircle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhoneFrame } from '@/components/mini/phone-frame'
import { DemoApp } from './demo-app'
import { screenNotes } from './screen-notes'

export type BoardScreen = { id: string; noteKey: string; title: string; desc: string; node: ReactNode }
export type BoardSection = { key: string; title: string; summary: string; screens: BoardScreen[] }

const FULL_DEMO = 'full-demo'

export function DesignBoard({ sections, header }: { sections: BoardSection[]; header: ReactNode }) {
  const allScreens = useMemo(() => sections.flatMap((s) => s.screens), [sections])
  const pageNumbers = useMemo(
    () => Object.fromEntries(allScreens.map((screen) => [screen.noteKey, screen.id])),
    [allScreens],
  )
  const [activeId, setActiveId] = useState<string>(FULL_DEMO)
  const [runKey, setRunKey] = useState(0)
  const [skipLogin, setSkipLogin] = useState(false)

  const activeIndex = allScreens.findIndex((s) => s.id === activeId)
  const activeScreen = activeIndex >= 0 ? allScreens[activeIndex] : null
  const activeSection = activeScreen ? sections.find((s) => s.screens.includes(activeScreen)) : null

  const select = (id: string) => {
    setActiveId(id)
    setRunKey((k) => k + 1)
  }

  const restartDemo = (skip: boolean) => {
    setSkipLogin(skip)
    setActiveId(FULL_DEMO)
    setRunKey((k) => k + 1)
  }

  const go = (offset: number) => {
    const next = allScreens[activeIndex + offset]
    if (next) select(next.id)
  }

  return (
    <>
      <header className="mx-auto max-w-[1600px]">{header}</header>

      <div className="mx-auto mt-8 flex max-w-[1600px] flex-col gap-6 lg:flex-row lg:items-start">
        <PageNav sections={sections} activeId={activeId} onSelect={select} />

        <section aria-label="页面预览" className="flex min-w-0 flex-1 flex-col items-center gap-4">
          <div className="flex w-full max-w-[387px] items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={activeIndex <= 0}
              aria-label="上一页"
              className="flex size-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm ring-1 ring-border transition-colors hover:text-primary disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <p className="min-w-0 truncate text-center text-body font-medium text-foreground">
              {activeScreen ? (
                <>
                  <span className="mr-1.5 font-bold text-primary">{activeScreen.id}</span>
                  {activeScreen.title}
                </>
              ) : (
                '完整流程演示'
              )}
            </p>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={activeIndex >= allScreens.length - 1}
              aria-label="下一页"
              className="flex size-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm ring-1 ring-border transition-colors hover:text-primary disabled:opacity-40"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <PhoneFrame label={activeScreen?.title ?? '小程序完整演示'}>
            <Fragment key={`${activeId}-${runKey}`}>
              {activeScreen ? activeScreen.node : <DemoApp skipLogin={skipLogin} />}
            </Fragment>
          </PhoneFrame>
          <p className="text-caption text-muted-foreground">可在手机内直接点击操作，切换页面后会重置为初始状态</p>
        </section>

        <aside
          aria-label="页面说明"
          className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-border lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:w-[380px] lg:shrink-0 lg:overflow-y-auto"
        >
          {activeScreen ? (
            <ScreenNote screen={activeScreen} sectionTitle={activeSection?.title} pageNumbers={pageNumbers} />
          ) : (
            <DemoNote sections={sections} onRestart={restartDemo} />
          )}
        </aside>
      </div>
    </>
  )
}

function PageNav({
  sections,
  activeId,
  onSelect,
}: {
  sections: BoardSection[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const navRef = useRef<HTMLElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Scroll only the nav container; scrollIntoView would also scroll the whole window.
  useEffect(() => {
    const nav = navRef.current
    const item = activeRef.current
    if (!nav || !item) return
    const navRect = nav.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    if (itemRect.top < navRect.top) nav.scrollTop -= navRect.top - itemRect.top + 8
    else if (itemRect.bottom > navRect.bottom) nav.scrollTop += itemRect.bottom - navRect.bottom + 8
  }, [activeId])

  return (
    <nav
      ref={navRef}
      aria-label="页面目录"
      className="w-full rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:w-[260px] lg:shrink-0 lg:overflow-y-auto"
    >
      <button
        ref={activeId === FULL_DEMO ? activeRef : undefined}
        type="button"
        onClick={() => onSelect(FULL_DEMO)}
        aria-current={activeId === FULL_DEMO ? 'page' : undefined}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-body font-medium transition-colors',
          activeId === FULL_DEMO ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary hover:bg-secondary/70',
        )}
      >
        <PlayCircle className="size-4 shrink-0" aria-hidden="true" />
        完整流程演示
      </button>

      <div className="mt-3 flex flex-col gap-4">
        {sections.map((section) => (
          <section key={section.key} aria-labelledby={`nav-${section.key}`}>
            <h2
              id={`nav-${section.key}`}
              className="flex items-center justify-between px-3 pb-1 text-caption font-bold text-muted-foreground"
            >
              {section.title}
              <span className="font-medium">{section.screens.length}</span>
            </h2>
            <ul className="flex flex-col">
              {section.screens.map((screen) => {
                const active = screen.id === activeId
                return (
                  <li key={screen.id}>
                    <button
                      ref={active ? activeRef : undefined}
                      type="button"
                      onClick={() => onSelect(screen.id)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left text-note transition-colors',
                        active ? 'bg-secondary font-medium text-primary' : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <span className={cn('shrink-0 tabular-nums text-caption', active ? 'text-primary' : 'text-muted-foreground')}>
                        {screen.id}
                      </span>
                      <span className="text-pretty">{screen.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  )
}

function DemoNote({ sections, onRestart }: { sections: BoardSection[]; onRestart: (skip: boolean) => void }) {
  return (
    <div className="flex flex-col gap-6 p-5">
      <div>
        <p className="text-note font-bold text-primary">完整体验</p>
        <h2 className="mt-0.5 text-heading font-bold text-foreground">完整流程演示</h2>
        <p className="mt-2 text-pretty text-note leading-5 text-muted-foreground">
          从登录开始，所有页面、弹层与跳转均可在手机中直接点击操作，与真实小程序流程一致。也可在左侧目录直接打开任一页面。
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onRestart(false)}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-note font-medium text-primary-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            从登录开始
          </button>
          <button
            type="button"
            onClick={() => onRestart(true)}
            className="h-9 flex-1 rounded-full border border-primary text-note font-medium text-primary"
          >
            跳过登录进入首页
          </button>
        </div>
      </div>

      <NoteBlock title="体验路径">
        <ol className="flex flex-col gap-3">
          {sections.map((section, index) => (
            <li key={section.key} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-bold text-primary">
                {index + 1}
              </span>
              <div>
                <p className="text-body font-medium text-foreground">{section.title}</p>
                <p className="mt-0.5 text-pretty text-caption leading-[18px] text-muted-foreground">{section.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </NoteBlock>
    </div>
  )
}

function ScreenNote({
  screen,
  sectionTitle,
  pageNumbers,
}: {
  screen: BoardScreen
  sectionTitle?: string
  pageNumbers: Record<string, string>
}) {
  const note = screenNotes[screen.noteKey]
  // Notes reference pages by their stable note key; show the current sequential page number instead.
  const renumber = (text: string) => text.replace(/\b\d{2}\b/g, (key) => pageNumbers[key] ?? key)

  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-5 py-4">
        <p className="text-note font-bold text-primary">
          页面 {screen.id}
          {sectionTitle && <span className="font-medium text-muted-foreground"> · {sectionTitle}</span>}
        </p>
        <h2 className="mt-0.5 text-pretty text-heading font-bold text-foreground">{screen.title}</h2>
      </div>

      <div className="flex flex-col gap-6 px-5 py-5">
        <NoteBlock title="页面概述">
          <p className="text-pretty text-body leading-6 text-muted-foreground">{screen.desc}</p>
        </NoteBlock>
        {note && (
          <>
            <NoteBlock title="功能说明">
              <NoteList items={note.features} />
            </NoteBlock>
            <NoteBlock title="交互逻辑">
              <NoteList items={note.interactions} numbered />
            </NoteBlock>
            <NoteBlock title="页面跳转">
              <ul className="flex flex-wrap gap-2">
                {note.links.map((link) => (
                  <li key={link} className="rounded-lg bg-secondary px-3 py-1.5 text-note text-primary">
                    {renumber(link)}
                  </li>
                ))}
              </ul>
            </NoteBlock>
          </>
        )}
      </div>
    </div>
  )
}

function NoteBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-2 text-title font-bold text-foreground">
        <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function NoteList({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={item} className="flex gap-2.5 text-body leading-6 text-foreground">
          {numbered ? (
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-bold text-primary">
              {index + 1}
            </span>
          ) : (
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          )}
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  )
}
