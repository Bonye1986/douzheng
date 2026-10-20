'use client'

import { useState } from 'react'
import { Ellipsis, MessageSquare, PencilLine, Search, SquarePen, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SessionSummary = { id: string; title: string; time: string }

export function ChatHistoryDrawer({
  sessions,
  currentId,
  onClose,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  sessions: SessionSummary[]
  currentId: string | null
  onClose: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const keyword = query.trim().toLowerCase()
  const visible = keyword ? sessions.filter((s) => s.title.toLowerCase().includes(keyword)) : sessions

  function commitRename() {
    if (editingId && editText.trim()) onRename(editingId, editText.trim())
    setEditingId(null)
  }

  return (
    <div className="absolute inset-0 z-30 flex">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="历史对话"
        className="relative flex h-full w-[82%] flex-col bg-white pt-12 shadow-xl animate-in slide-in-from-left duration-300"
      >
        <div className="flex items-center justify-between px-4">
          <h2 className="text-heading font-bold text-foreground">历史对话</h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 px-4">
          <label className="flex h-10 items-center gap-2 rounded-full bg-muted px-3.5 focus-within:ring-1 focus-within:ring-primary">
            <Search className="size-4 text-muted-foreground" />
            <span className="sr-only">搜索历史对话</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索历史对话"
              className="h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-faint"
            />
            {query && (
              <button type="button" aria-label="清空搜索" onClick={() => setQuery('')}>
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </label>

          <button
            type="button"
            onClick={onNew}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-title font-semibold text-white active:opacity-90"
          >
            <SquarePen className="size-4.5" />
            新建对话
          </button>
        </div>

        <ul className="mt-4 flex-1 overflow-y-auto px-2 pb-8 [scrollbar-width:none]" onScroll={() => setMenuId(null)}>
          {visible.length === 0 && (
            <li className="px-4 py-10 text-center text-note text-muted-foreground">
              {keyword ? '没有找到相关对话' : '暂无历史对话'}
            </li>
          )}
          {visible.map((s) => {
            const active = s.id === currentId
            const editing = s.id === editingId
            return (
              <li key={s.id} className="relative">
                {editing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      commitRename()
                    }}
                    className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2"
                  >
                    <label htmlFor={`rename-${s.id}`} className="sr-only">
                      对话名称
                    </label>
                    <input
                      id={`rename-${s.id}`}
                      autoFocus
                      value={editText}
                      maxLength={30}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="h-8 min-w-0 flex-1 rounded-lg border border-primary bg-white px-2 text-body text-foreground outline-none"
                    />
                    <button type="submit" className="text-note font-medium text-primary">
                      完成
                    </button>
                  </form>
                ) : (
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-xl pr-1 transition-colors',
                      active ? 'bg-secondary' : 'active:bg-muted',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      aria-current={active ? 'true' : undefined}
                      className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-3 text-left"
                    >
                      <MessageSquare className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-body',
                            active ? 'font-semibold text-primary' : 'text-foreground',
                          )}
                        >
                          {s.title}
                        </span>
                        <span className="block text-caption text-muted-foreground">{s.time}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${s.title} 更多操作`}
                      aria-expanded={menuId === s.id}
                      onClick={() => setMenuId(menuId === s.id ? null : s.id)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-white"
                    >
                      <Ellipsis className="size-4" />
                    </button>
                  </div>
                )}

                {menuId === s.id && (
                  <div
                    role="menu"
                    className="absolute right-2 top-11 z-10 w-32 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuId(null)
                        setEditText(s.title)
                        setEditingId(s.id)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-body text-foreground active:bg-muted"
                    >
                      <PencilLine className="size-4" />
                      修改名称
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuId(null)
                        setConfirmId(s.id)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-body text-destructive active:bg-destructive-soft"
                    >
                      <Trash2 className="size-4" />
                      删除会话
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {confirmId && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1e2a3d]/35 px-6">
            <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="w-full rounded-2xl bg-white p-5">
              <h3 id="del-title" className="text-center text-title font-semibold text-foreground">
                删除这个会话？
              </h3>
              <p className="mt-2 text-center text-note leading-5 text-muted-foreground">删除后对话记录将无法恢复</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="h-10 rounded-full border border-border text-body font-medium text-foreground"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(confirmId)
                    setConfirmId(null)
                  }}
                  className="h-10 rounded-full bg-destructive text-body font-semibold text-white"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <button type="button" aria-label="关闭历史对话" onClick={onClose} className="flex-1 bg-[#1e2a3d]/35" />
    </div>
  )
}
