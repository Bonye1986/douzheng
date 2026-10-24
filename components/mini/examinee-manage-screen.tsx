'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, BadgeCheck, ChevronRight, PencilLine, Phone, Plus, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { ExamineeFormScreen } from '@/components/mini/examinee-form-screen'
import { AccountSettingsScreen } from '@/components/mini/account-settings-screen'
import { RealNameGuideDialog } from '@/components/mini/realname-guide-dialog'
import { examineeMeta, initialExaminees, type Examinee } from '@/components/mini/checkout-data'
import { examineeReportCount, isSelfVerified, useExaminees, withVerifiedSelf } from '@/components/mini/examinee-store'
import { cn } from '@/lib/utils'

export type ExamineeView = 'list' | 'add' | 'edit' | 'edit-self' | 'delete' | 'unverified' | 'verify'

const MAX_EXAMINEES = 10

const activeOrderIds = new Set(['spouse'])
const reportCount = examineeReportCount

type Props = {
  onBack: () => void
  initialView?: ExamineeView
}

export function ExamineeManageScreen({ onBack, initialView = 'list' }: Props) {
  const [rawList, setList] = useExaminees(
    initialView === 'unverified' || initialView === 'verify' ? [] : undefined,
  )
  const selfVerified = isSelfVerified(rawList)
  const list = [...rawList.filter((m) => m.relation === '本人'), ...rawList.filter((m) => m.relation !== '本人')]
  const [guideOpen, setGuideOpen] = useState(() => initialView !== 'verify' && !selfVerified)
  const [verifying, setVerifying] = useState(initialView === 'verify')
  const [form, setForm] = useState<{ target?: Examinee } | null>(
    initialView === 'add'
      ? {}
      : initialView === 'edit'
        ? { target: initialExaminees[1] }
        : initialView === 'edit-self'
          ? { target: initialExaminees[0] }
          : null,
  )
  const [pendingDelete, setPendingDelete] = useState<Examinee | null>(
    initialView === 'delete' ? initialExaminees[2] : null,
  )
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const hasSelf = list.some((m) => m.relation === '本人')
  const full = list.length >= MAX_EXAMINEES

  const openAdd = () => {
    if (!selfVerified) return setGuideOpen(true)
    if (full) return setToast(`最多添加 ${MAX_EXAMINEES} 位受检人`)
    setForm({})
  }

  const save = (e: Examinee) => {
    const exists = list.some((m) => m.id === e.id)
    setList((l) => (exists ? l.map((m) => (m.id === e.id ? e : m)) : [...l, e]))
    setForm(null)
    setToast(exists ? '修改已保存' : '添加成功')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    setList((l) => l.filter((m) => m.id !== pendingDelete.id))
    setPendingDelete(null)
    setToast('已删除')
  }

  const verified = (e: Examinee) => {
    setList((l) => withVerifiedSelf(l, e))
    setToast('实名认证成功，已添加本人为受检人')
  }

  const goVerify = () => {
    setGuideOpen(false)
    setVerifying(true)
  }

  const blocked = pendingDelete && (pendingDelete.relation === '本人' || activeOrderIds.has(pendingDelete.id))

  return (
    <SubPage title="受检人管理" titleId="examinee-manage-title" onBack={onBack}>
      {list.length === 0 ? (
        <UnverifiedState onVerify={goVerify} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
            <p className="flex items-center justify-between px-1 text-caption text-muted-foreground">
              <span>
                已添加 <span className="tabular-nums text-foreground">{list.length}</span> / {MAX_EXAMINEES} 位
              </span>
              <span>下单时可直接选择</span>
            </p>

            {!selfVerified && (
              <button
                type="button"
                onClick={goVerify}
                className="mt-2 flex w-full items-center gap-2.5 rounded-2xl bg-warning-soft px-3.5 py-3 text-left"
              >
                <ShieldAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold text-foreground">本人尚未实名认证</span>
                  <span className="mt-0.5 block text-caption text-muted-foreground">
                    完成实名认证后本人将置顶为受检人，方可添加其他受检人
                  </span>
                </span>
                <span className="flex shrink-0 items-center text-caption font-medium text-warning">
                  去认证
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </span>
              </button>
            )}

            <ul className="mt-2 flex flex-col gap-2.5">
              {list.map((m) => (
                <li key={m.id} className="rounded-2xl bg-white p-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-full text-title font-semibold',
                        m.relation === '本人' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary',
                      )}
                      aria-hidden="true"
                    >
                      {m.name.slice(-1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5">
                        <span className="truncate text-title font-semibold text-foreground">{m.name}</span>
                        <span className="shrink-0 rounded bg-secondary px-1.5 py-px text-caption text-primary">
                          {m.relation}
                        </span>
                      </p>
                      <p className="mt-0.5 text-caption text-muted-foreground">
                        {examineeMeta(m)}
                        {m.birth && <span className="tabular-nums"> · {m.birth}</span>}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-muted px-3 py-2 text-caption">
                    <div className="flex items-center gap-1.5">
                      <dt className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">手机号</span>
                      </dt>
                      <dd className="tabular-nums text-foreground">{m.phone ?? '未填写'}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt className="text-muted-foreground">检测报告</dt>
                      <dd className="tabular-nums text-foreground">{reportCount[m.id] ?? 0} 份</dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
                      {m.relation === '本人' && m.idCard && (
                        <span className="flex items-center gap-0.5 rounded bg-success-soft px-1.5 py-px text-success">
                          <BadgeCheck className="size-3" aria-hidden="true" />
                          已认证
                        </span>
                      )}
                      {activeOrderIds.has(m.id) && (
                        <span className="rounded bg-secondary px-1.5 py-px text-primary">进行中订单</span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      {m.relation !== '本人' && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(m)}
                          aria-disabled={activeOrderIds.has(m.id)}
                          className={cn(
                            'flex h-7 items-center gap-1 rounded-full border px-3 text-caption',
                            activeOrderIds.has(m.id) ? 'border-border text-faint' : 'border-border text-foreground',
                          )}
                          aria-label={`删除受检人 ${m.name}`}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          删除
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setForm({ target: m })}
                        className="flex h-7 items-center gap-1 rounded-full border border-primary px-3 text-caption text-primary"
                        aria-label={`编辑受检人 ${m.name}`}
                      >
                        <PencilLine className="size-3.5" aria-hidden="true" />
                        编辑
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-3 flex items-start gap-1.5 px-1 text-caption leading-[18px] text-muted-foreground">
              <ShieldCheck className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
              受检人信息仅用于样本登记与报告归档，加密存储。删除后历史报告仍保留在「我的报告」中。
            </p>
          </div>

          <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
            <button
              type="button"
              onClick={openAdd}
              aria-disabled={full || !selfVerified}
              className={cn(
                'flex h-10 w-full items-center justify-center gap-1 rounded-full text-body font-medium',
                full || !selfVerified ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground active:opacity-90',
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              添加受检人
            </button>
          </div>
        </>
      )}

      {pendingDelete && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-8">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-examinee-title"
            aria-describedby="delete-examinee-desc"
            className="w-full rounded-2xl bg-white px-5 pb-4 pt-5 text-center motion-safe:animate-in motion-safe:zoom-in-95"
          >
            <span
              className={cn(
                'mx-auto flex size-11 items-center justify-center rounded-full',
                blocked ? 'bg-warning-soft text-warning' : 'bg-destructive-soft text-destructive',
              )}
              aria-hidden="true"
            >
              {blocked ? <AlertTriangle className="size-5" /> : <Trash2 className="size-5" />}
            </span>
            <h2 id="delete-examinee-title" className="mt-3 text-title font-semibold text-foreground">
              {blocked ? '暂不可删除' : `删除受检人「${pendingDelete.name}」？`}
            </h2>
            <p id="delete-examinee-desc" className="mt-1.5 text-note leading-5 text-muted-foreground">
              {pendingDelete.relation === '本人'
                ? '「本人」为账号持有人，不可删除，可通过编辑修改信息。'
                : blocked
                  ? '该受检人有进行中的检测订单，暂不可删除，可通过「编辑」修改信息；订单完成或取消后可删除。'
                  : '删除后下单时将无法选择该受检人，已出具的报告仍可在「我的报告」中查看。'}
            </p>
            {blocked ? (
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="mt-4 h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground"
              >
                我知道了
              </button>
            ) : (
              <div className="mt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="h-10 flex-1 rounded-full border border-border text-body text-foreground"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="h-10 flex-1 rounded-full bg-destructive text-body font-medium text-white"
                >
                  确认删除
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {form && (
        <ExamineeFormScreen
          hasSelf={hasSelf}
          initial={form.target}
          onBack={() => setForm(null)}
          onSave={save}
        />
      )}

      {guideOpen && (
        <RealNameGuideDialog
          desc="为保障检测报告归属与信息安全，需先在「账号设置」完成本人实名认证。认证后本人将置顶为受检人，方可添加其他受检人。"
          onVerify={goVerify}
          onSkip={() => setGuideOpen(false)}
        />
      )}

      {verifying && (
        <div className="absolute inset-0 z-50">
          <AccountSettingsScreen
            initialView="verify"
            verified={selfVerified}
            onVerified={verified}
            onBack={() => setVerifying(false)}
          />
        </div>
      )}

      {toast && (
        <p
          role="status"
          className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/75 px-4 py-2 text-note text-white"
        >
          {toast}
        </p>
      )}
    </SubPage>
  )
}

function UnverifiedState({ onVerify }: { onVerify: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center px-8 pt-20 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-warning-soft" aria-hidden="true">
        <ShieldAlert className="size-11 text-warning" strokeWidth={1.4} />
      </span>
      <h2 className="mt-5 text-title font-semibold text-foreground">请先完成本人实名认证</h2>
      <p className="mt-1.5 text-pretty text-note leading-5 text-muted-foreground">
        实名认证在「账号设置」中进行。完成后本人将自动置顶为受检人，之后即可添加家人等其他受检人。
      </p>
      <button
        type="button"
        onClick={onVerify}
        className="mt-6 flex h-10 items-center gap-1 rounded-full bg-primary px-8 text-body font-medium text-primary-foreground active:opacity-90"
      >
        <ShieldCheck className="size-4" aria-hidden="true" />
        去实名认证
      </button>
    </div>
  )
}
