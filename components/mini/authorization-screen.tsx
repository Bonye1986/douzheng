'use client'

import { useState } from 'react'
import { FileCheck2, Info, Lock, ShieldCheck } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import {
  initialExaminees,
  initialResearchAuths,
  researchStatusLabel,
  testConsents,
  type ResearchAuth,
  type ResearchStatus,
} from '@/components/mini/checkout-data'
import { testServices } from '@/components/mini/tests-data'
import { ResearchSignFlow, type SignAction } from '@/components/mini/research-sign-flow'
import { cn } from '@/lib/utils'

type Tab = 'test' | 'research'

const statusStyle: Record<ResearchStatus, string> = {
  signed: 'bg-[#e6f7ef] text-[#2fb57a]',
  withdrawn: 'bg-secondary text-[#8a94a6]',
  unsigned: 'bg-[#fff4e8] text-[#f07a2c]',
}

const memberName = (id: string) => initialExaminees.find((m) => m.id === id)?.name ?? ''
const serviceName = (id: string) => testServices.find((s) => s.id === id)?.name ?? ''

const now = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function AuthorizationScreen({ onBack, initialTab = 'test' }: { onBack: () => void; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [auths, setAuths] = useState<ResearchAuth[]>(initialResearchAuths)
  const [pending, setPending] = useState<{ auth: ResearchAuth; action: SignAction } | null>(null)

  const finish = () => {
    if (!pending) return
    const status: ResearchStatus = pending.action === 'sign' ? 'signed' : 'withdrawn'
    setAuths((list) => list.map((a) => (a.id === pending.auth.id ? { ...a, status, updatedAt: now() } : a)))
    setPending(null)
  }

  const tabs: { id: Tab; label: string; tag: string }[] = [
    { id: 'test', label: '检测知情同意书', tag: '必签' },
    { id: 'research', label: '科研知情同意书', tag: '自愿' },
  ]

  return (
    <SubPage title="授权与同意书" titleId="auth-title" onBack={onBack}>
      <div role="tablist" aria-label="同意书类型" className="flex shrink-0 bg-white px-3">
        {tabs.map((t) => {
          const on = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`auth-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex h-11 flex-1 items-center justify-center gap-1 text-[14px]',
                on ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'rounded px-1 text-[10px] font-normal',
                  t.id === 'test' ? 'bg-[#e8f0fd] text-primary' : 'bg-secondary text-[#8a94a6]',
                )}
              >
                {t.tag}
              </span>
              {on && <span aria-hidden="true" className="absolute bottom-0 h-[3px] w-6 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>

      <div
        id={`auth-panel-${tab}`}
        role="tabpanel"
        className="flex-1 overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]"
      >
        {tab === 'test' ? <TestConsentPanel /> : <ResearchPanel auths={auths} onAction={(auth, action) => setPending({ auth, action })} />}
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

function TestConsentPanel() {
  return (
    <>
      <section className="flex items-start gap-2 rounded-2xl bg-[#e8f0fd] px-3.5 py-3 text-[12px] leading-5 text-[#2f5fb3]">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <p>每个订单下单前须阅读并同意《基因检测知情同意书》，签署后作为检测依据存档，不可撤回</p>
      </section>

      <ul className="mt-2.5 flex flex-col gap-2.5">
        {testConsents.map((c) => (
          <li key={c.orderNo} className="rounded-2xl bg-white p-3.5">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-[14px] font-semibold text-foreground">基因检测知情同意书</p>
              <span className="shrink-0 rounded bg-[#e6f7ef] px-1.5 py-px text-[11px] text-[#2fb57a]">已签署</span>
            </div>
            <dl className="mt-2.5 flex flex-col gap-1.5 text-[12px] leading-[18px]">
              <Row label="订单号" value={c.orderNo} mono />
              <Row label="检测项目" value={c.serviceIds.map(serviceName).join('、')} />
              <Row label="受检人" value={c.memberIds.map(memberName).join('、')} />
              <Row label="签署时间" value={c.signedAt} mono />
            </dl>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
              <span className="flex items-center gap-1 text-[11px] text-[#a9b3c6]">
                <Lock className="size-3" aria-hidden="true" />
                不可撤回
              </span>
              <button type="button" className="h-7 rounded-full border border-border px-3 text-[12px] text-foreground">
                查看同意书
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
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
        <p className="flex items-center gap-1.5 text-[13px] opacity-90">
          <ShieldCheck className="size-4" aria-hidden="true" />
          科研样本授权
        </p>
        <div className="mt-1.5 flex items-end gap-4">
          <p className="text-[22px] font-bold tabular-nums">
            {signedCount}
            <span className="ml-1 text-[12px] font-normal opacity-90">已授权</span>
          </p>
          <p className="text-[22px] font-bold tabular-nums">
            {pendingCount}
            <span className="ml-1 text-[12px] font-normal opacity-90">待签署</span>
          </p>
        </div>
        <p className="mt-1 text-[11px] leading-4 opacity-80">
          按订单 × 检测项目 × 受检人分别授权；签署与撤销均需通过 e签宝 人脸核验
        </p>
      </section>

      {orders.map((orderNo) => {
        const items = auths.filter((a) => a.orderNo === orderNo)
        const services = [...new Set(items.map((a) => a.serviceId))]
        return (
          <section key={orderNo} aria-label={`订单 ${orderNo}`} className="mt-2.5 rounded-2xl bg-white">
            <p className="border-b border-border px-3.5 py-2.5 text-[12px] tabular-nums text-muted-foreground">订单号 {orderNo}</p>
            {services.map((sid) => (
              <div key={sid} className="px-3.5 pt-3">
                <h2 className="text-[13px] font-semibold leading-[18px] text-foreground">{serviceName(sid)}</h2>
                <ul>
                  {items
                    .filter((a) => a.serviceId === sid)
                    .map((a) => {
                      const member = initialExaminees.find((m) => m.id === a.memberId)
                      const signed = a.status === 'signed'
                      return (
                        <li key={a.id} className="flex items-center gap-2 border-b border-border py-3 last:border-0">
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 text-[13px] text-foreground">
                              {member?.name}
                              <span className="rounded bg-[#f4f8fe] px-1 text-[10px] text-muted-foreground">{member?.relation}</span>
                              <span className={cn('rounded px-1.5 py-px text-[10px]', statusStyle[a.status])}>
                                {researchStatusLabel[a.status]}
                              </span>
                            </p>
                            <p className="mt-0.5 text-[11px] tabular-nums text-[#a9b3c6]">
                              {a.status === 'unsigned' ? '下单时已勾选 · ' : ''}更新于 {a.updatedAt}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAction(a, signed ? 'withdraw' : 'sign')}
                            className={cn(
                              'h-7 shrink-0 rounded-full px-3 text-[12px]',
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

      <p className="mt-3 flex items-start gap-1 px-1 text-[11px] leading-4 text-[#a9b3c6]">
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
