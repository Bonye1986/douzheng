'use client'

import { useState } from 'react'
import { Info, Lock, ShieldCheck } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import {
  initialExaminees,
  initialResearchAuths,
  researchStatusLabel,
  type ResearchAuth,
  type ResearchStatus,
} from '@/components/mini/checkout-data'
import { testServices } from '@/components/mini/tests-data'
import { ResearchSignFlow, type SignAction } from '@/components/mini/research-sign-flow'
import { cn } from '@/lib/utils'

const statusStyle: Record<ResearchStatus, string> = {
  signed: 'bg-[#e6f7ef] text-success',
  withdrawn: 'bg-secondary text-muted-foreground',
  unsigned: 'bg-warning-soft text-warning',
}

const memberName = (id: string) => initialExaminees.find((m) => m.id === id)?.name ?? ''
const serviceName = (id: string) => testServices.find((s) => s.id === id)?.name ?? ''

const now = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function AuthorizationScreen({
  onBack,
  empty = false,
  initialFlow,
}: {
  onBack: () => void
  empty?: boolean
  initialFlow?: SignAction
}) {
  const [auths, setAuths] = useState<ResearchAuth[]>(empty ? [] : initialResearchAuths)
  const [pending, setPending] = useState<{ auth: ResearchAuth; action: SignAction } | null>(() => {
    if (!initialFlow || empty) return null
    const target = initialResearchAuths.find((a) =>
      initialFlow === 'sign' ? a.status === 'unsigned' : a.status === 'signed',
    )
    return target ? { auth: target, action: initialFlow } : null
  })

  const finish = () => {
    if (!pending) return
    const status: ResearchStatus = pending.action === 'sign' ? 'signed' : 'withdrawn'
    setAuths((list) => list.map((a) => (a.id === pending.auth.id ? { ...a, status, updatedAt: now() } : a)))
    setPending(null)
  }

  return (
    <SubPage title="授权与同意书" titleId="auth-title" onBack={onBack}>
      <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]">
        {auths.length === 0 ? (
          <ConsentEmptyState
            title="暂无科研知情同意书"
            desc="下单时可自愿勾选科研授权，勾选后的签署 / 撤销记录将按订单在这里展示；不授权不影响检测与报告"
          />
        ) : (
          <ResearchPanel auths={auths} onAction={(auth, action) => setPending({ auth, action })} />
        )}
      </div>

      {pending && (
        <ResearchSignFlow
          action={pending.action}
          memberName={memberName(pending.auth.memberId)}
          serviceName={serviceName(pending.auth.serviceId)}
          orderNo={pending.auth.orderNo}
          onClose={() => setPending(null)}
          onDone={finish}
        />
      )}
    </SubPage>
  )
}

function ConsentEmptyState({ title, desc }: { title: string; desc: string }) {
  const Icon = ShieldCheck
  return (
    <div className="flex flex-1 flex-col items-center px-8 pt-20 text-center">
      <span className="relative flex size-24 items-center justify-center rounded-full bg-secondary" aria-hidden="true">
        <Icon className="size-11 text-primary" strokeWidth={1.4} />
        <span className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-white shadow-sm">
          <Lock className="size-4 text-primary" />
        </span>
      </span>
      <h2 className="mt-5 text-title font-semibold text-foreground">{title}</h2>
      <p className="mt-1.5 text-note leading-5 text-muted-foreground">{desc}</p>
    </div>
  )
}

function ResearchPanel({
  auths,
  onAction,
}: {
  auths: ResearchAuth[]
  onAction: (auth: ResearchAuth, action: SignAction) => void
}) {
  const signedCount = auths.filter((a) => a.status === 'signed').length
  const pendingCount = auths.filter((a) => a.status === 'unsigned').length
  const orders = [...new Set(auths.map((a) => a.orderNo))]

  return (
    <>
      <section className="rounded-2xl bg-primary p-4 text-primary-foreground">
        <p className="flex items-center gap-1.5 text-note opacity-90">
          <ShieldCheck className="size-4" aria-hidden="true" />
          科研样本授权
        </p>
        <div className="mt-1.5 flex items-end gap-4">
          <p className="text-headline font-bold tabular-nums">
            {signedCount}
            <span className="ml-1 text-caption font-normal opacity-90">已授权</span>
          </p>
          <p className="text-headline font-bold tabular-nums">
            {pendingCount}
            <span className="ml-1 text-caption font-normal opacity-90">待签署</span>
          </p>
        </div>
        <p className="mt-1 text-caption leading-4 opacity-80">
          按订单 × 检测项目 × 受检人分别授权；签署需手写签名并通过 e签宝 人脸核验，撤销仅需手写签名
        </p>
      </section>

      {orders.map((orderNo) => {
        const items = auths.filter((a) => a.orderNo === orderNo)
        const services = [...new Set(items.map((a) => a.serviceId))]
        return (
          <section key={orderNo} aria-label={`订单 ${orderNo}`} className="mt-2.5 rounded-2xl bg-white">
            <p className="border-b border-border px-3.5 py-2.5 text-caption tabular-nums text-muted-foreground">订单号 {orderNo}</p>
            {services.map((sid) => (
              <div key={sid} className="px-3.5 pt-3">
                <h2 className="text-title font-semibold leading-[18px] text-foreground">{serviceName(sid)}</h2>
                <ul>
                  {items
                    .filter((a) => a.serviceId === sid)
                    .map((a) => {
                      const member = initialExaminees.find((m) => m.id === a.memberId)
                      const signed = a.status === 'signed'
                      return (
                        <li key={a.id} className="flex items-center gap-2 border-b border-border py-3 last:border-0">
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 text-note text-foreground">
                              {member?.name}
                              <span className="rounded bg-background px-1 text-tag text-muted-foreground">{member?.relation}</span>
                              <span className={cn('rounded px-1.5 py-px text-tag', statusStyle[a.status])}>
                                {researchStatusLabel[a.status]}
                              </span>
                            </p>
                            <p className="mt-0.5 text-caption tabular-nums text-faint">
                              {a.status === 'unsigned' ? '下单时已勾选 · ' : ''}更新于 {a.updatedAt}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAction(a, signed ? 'withdraw' : 'sign')}
                            className={cn(
                              'h-7 shrink-0 rounded-full px-3 text-caption',
                              signed ? 'border border-border text-foreground' : 'bg-primary text-primary-foreground',
                            )}
                          >
                            {signed ? '撤销授权' : a.status === 'withdrawn' ? '重新签署' : '去签署'}
                          </button>
                        </li>
                      )
                    })}
                </ul>
              </div>
            ))}
          </section>
        )
      })}

      <p className="mt-3 flex items-start gap-1 px-1 text-caption leading-4 text-faint">
        <Info className="mt-px size-3 shrink-0" aria-hidden="true" />
        科研授权为自愿选择，不影响检测服务及报告出具；撤销需签署《科研知情同意撤销书》；未成年受检人由监护人代为签署
      </p>
    </>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="w-14 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn('min-w-0 flex-1 text-foreground', mono && 'tabular-nums')}>{value}</dd>
    </div>
  )
}
