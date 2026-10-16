'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BookOpenText, FileText, MousePointerClick, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhoneFrame } from '@/components/mini/phone-frame'
import { DemoApp } from './demo-app'
import { screenNotes } from './screen-notes'

export type BoardScreen = { id: string; noteKey: string; title: string; desc: string; node: ReactNode }
export type BoardSection = { key: string; title: string; summary: string; screens: BoardScreen[] }

type Mode = 'demo' | 'explain'

const modes: { key: Mode; label: string; icon: typeof MousePointerClick }[] = [
  { key: 'demo', label: '演示版', icon: MousePointerClick },
  { key: 'explain', label: '讲解版', icon: BookOpenText },
]

export function DesignBoard({ sections, header }: { sections: BoardSection[]; header: ReactNode }) {
  const [mode, setMode] = useState<Mode>('demo')

  return (
    <>
      <header className="mx-auto flex max-w-[1720px] flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {header}
        <div role="tablist" aria-label="设计稿版本" className="flex w-fit rounded-full bg-white p-1 shadow-sm ring-1 ring-border">
          {modes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              className={cn(
                'flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors',
                mode === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {mode === 'demo' ? <DemoView sections={sections} /> : <ExplainView sections={sections} />}
    </>
  )
}

function DemoView({ sections }: { sections: BoardSection[] }) {
  const [runKey, setRunKey] = useState(0)
  const [skipLogin, setSkipLogin] = useState(false)

  const restart = (skip: boolean) => {
    setSkipLogin(skip)
    setRunKey((k) => k + 1)
  }

  return (
    <section aria-label="演示版" className="mx-auto mt-10 flex max-w-[1100px] flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
      <PhoneFrame label="小程序完整演示">
        <DemoApp key={runKey} skipLogin={skipLogin} />
      </PhoneFrame>

      <aside className="flex w-full max-w-[387px] flex-col gap-5 lg:sticky lg:top-8 lg:max-w-[360px]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border">
          <h2 className="text-[16px] font-bold text-foreground">完整体验</h2>
          <p className="mt-1.5 text-pretty text-[13px] leading-5 text-muted-foreground">
            从登录开始，所有页面、弹层与跳转均可在左侧手机中直接点击操作，与真实小程序流程一致。
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => restart(false)}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[13px] font-medium text-primary-foreground"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              从登录开始
            </button>
            <button
              type="button"
              onClick={() => restart(true)}
              className="h-9 flex-1 rounded-full border border-primary text-[13px] font-medium text-primary"
            >
              跳过登录进入首页
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border">
          <h2 className="text-[16px] font-bold text-foreground">体验路径</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {sections.map((section, index) => (
              <li key={section.key} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-foreground">{section.title}</p>
                  <p className="mt-0.5 text-pretty text-[12px] leading-[18px] text-muted-foreground">{section.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </section>
  )
}

function ExplainView({ sections }: { sections: BoardSection[] }) {
  const [active, setActive] = useState<BoardScreen | null>(null)
  const pageNumbers = Object.fromEntries(sections.flatMap((s) => s.screens.map((screen) => [screen.noteKey, screen.id])))

  return (
    <div className="mx-auto mt-8 max-w-[1720px]">
      <nav aria-label="板块导航" className="sticky top-0 z-[100] -mx-6 bg-[#f4f8fe]/90 px-6 py-3 backdrop-blur lg:-mx-12 lg:px-12">
        <ul className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <li key={section.key}>
              <a
                href={`#section-${section.key}`}
                className="flex h-8 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-medium text-foreground ring-1 ring-border hover:text-primary hover:ring-primary"
              >
                {section.title}
                <span className="text-muted-foreground">{section.screens.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {sections.map((section, index) => (
        <section
          key={section.key}
          id={`section-${section.key}`}
          aria-labelledby={`section-title-${section.key}`}
          className="scroll-mt-16 pt-10"
        >
          <div className="flex flex-col gap-1 border-b border-border pb-4">
            <p className="text-[13px] font-bold text-primary">板块 {String(index + 1).padStart(2, '0')}</p>
            <h2 id={`section-title-${section.key}`} className="text-xl font-bold text-foreground">
              {section.title}
            </h2>
            <p className="text-pretty text-[13px] text-muted-foreground">{section.summary}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-12">
            {section.screens.map((screen) => (
              <article key={screen.id} className="flex w-[387px] flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-bold text-primary">{screen.id}</span>
                  <h3 className="text-[16px] font-bold text-foreground">{screen.title}</h3>
                </div>
                <PhoneFrame label={screen.title}>{screen.node}</PhoneFrame>
                <button
                  type="button"
                  onClick={() => setActive(screen)}
                  className="flex h-10 items-center justify-center gap-2 rounded-full border border-primary bg-white text-[14px] font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  查看页面说明
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}

      <NoteDialog screen={active} pageNumbers={pageNumbers} onClose={() => setActive(null)} />
    </div>
  )
}

function NoteDialog({
  screen,
  pageNumbers,
  onClose,
}: {
  screen: BoardScreen | null
  pageNumbers: Record<string, string>
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (screen && !dialog.open) dialog.showModal()
    if (!screen && dialog.open) dialog.close()
  }, [screen])

  const note = screen ? screenNotes[screen.noteKey] : undefined
  // Notes reference pages by their stable note key; show the current sequential page number instead.
  const renumber = (text: string) => text.replace(/\b\d{2}\b/g, (key) => pageNumbers[key] ?? key)

  return (
    <dialog
      ref={ref}
      aria-labelledby="note-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-h-[85vh] w-[min(560px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-white p-0 text-foreground shadow-2xl backdrop:bg-[#0f1c2e]/50"
    >
      {screen && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start gap-3 border-b border-border px-6 py-5">
            <div className="flex-1">
              <p className="text-[13px] font-bold text-primary">页面 {screen.id}</p>
              <h2 id="note-title" className="mt-0.5 text-[18px] font-bold">
                {screen.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭页面说明"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-6 overflow-y-auto px-6 py-5">
            <NoteBlock title="页面概述">
              <p className="text-pretty text-[14px] leading-6 text-muted-foreground">{screen.desc}</p>
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
                      <li key={link} className="rounded-lg bg-accent px-3 py-1.5 text-[13px] text-primary">
                        {renumber(link)}
                      </li>
                    ))}
                  </ul>
                </NoteBlock>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}

function NoteBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 flex items-center gap-2 text-[15px] font-bold">
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
        <li key={item} className="flex gap-2.5 text-[14px] leading-6 text-foreground">
          {numbered ? (
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-primary">
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
