'use client'

import { useState } from 'react'
import { FileSignature, Info, ShieldCheck } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import {
  initialExaminees,
  initialResearchAuths,
  researchStatusLabel,
  type ResearchAuth,
  type ResearchStatus,
} from '@/components/mini/checkout-data'
import { testServices } from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

const statusStyle: Record<ResearchStatus, string> = {
  signed: 'bg-[#e6f7ef] text-[#2fb57a]',
  withdrawn: 'bg-secondary text-[#8a94a6]',
  unsigned: 'bg-[#fff4e8] text-[#f07a2c]',
}

const now = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function AuthorizationScreen({ onBack }: { onBack: () => void }) {
  const [auths, setAuths] = useState<ResearchAuth[]>(initialResearchAuths)
  const [pending, setPending] = useState<{ auth: ResearchAuth; action: 'sign' | 'withdraw' } | null>(null)

  const groups = initialExaminees
    .map((m) => ({ member: m, items: auths.filter((a) => a.memberId === m.id) }))
    .filter((g) => g.items.length > 0)
  const signedCount = auths.filter((a) => a.status === 'signed').length

  const confirm = () => {
    if (!pending) return
    const status: ResearchStatus = pending.action === 'sign' ? 'signed' : 'withdrawn'
    setAuths((list) => list.map((a) => (a.id === pending.auth.id ? { ...a, status, updatedAt: now() } : a)))
    setPending(null)
  }

  return (
    <SubPage title="授权与同意书" titleId="auth-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2.5 [scrollbar-width:none]">
        <section className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <p className="flex items-center gap-1.5 text-[13px] opacity-90">
            <ShieldCheck className="size-4" aria-hidden="true" />
            科研样本授权
          </p>
          <p className="mt-1.5 text-[22px] font-bold tabular-nums">
            {signedCount}
            <span className="ml-1 text-[13px] font-normal opacity-90">/ {auths.length} 项已授权</span>
          </p>
          <p className="mt-1 text-[11px] leading-4 opacity-80">
            授权后样本及去标识化数据将用于医学研究；撤回后不再用于新的研究，已完成的研究成果不受影响
          </p>
        </section>

        {groups.map(({ member, items }) => (
          <section key={member.id} aria-labelledby={`auth-${member.id}`} className="mt-2.5 rounded-2xl bg-white">
            <h2 id={`auth-${member.id}`} className="flex items-center gap-1.5 px-3.5 pt-3.5 text-[14px] font-semibold text-foreground">
              {member.name}
              <span className="rounded bg-[#f4f8fe] px-1 text-[10px] font-normal text-muted-foreground">{member.relation}</span>
            </h2>
            <ul>
              {items.map((a) => {
                const service = testServices.find((s) => s.id === a.serviceId)
                const signed = a.status === 'signed'
                return (
                  <li key={a.id} className="border-b border-border px-3.5 py-3 last:border-0">
                    <div className="flex items-start gap-2">
                      <p className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-foreground">{service?.name}</p>
                      <span className={cn('shrink-0 rounded px-1.5 py-px text-[11px]', statusStyle[a.status])}>
                        {researchStatusLabel[a.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">订单号 {a.orderNo}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] tabular-nums text-[#a9b3c6]">更新于 {a.updatedAt}</span>
                      <button
                        type="button"
                        onClick={() => setPending({ auth: a, action: signed ? 'withdraw' : 'sign' })}
                        className={cn(
                          'h-7 rounded-full px-3 text-[12px]',
                          signed ? 'border border-border text-foreground' : 'bg-primary text-primary-foreground',
                        )}
                      >
                        {signed ? '撤回授权' : a.status === 'withdrawn' ? '重新签署' : '签署授权'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <p className="mt-3 flex items-start gap-1 px-1 text-[11px] leading-4 text-[#a9b3c6]">
          <Info className="mt-px size-3 shrink-0" aria-hidden="true" />
          科研授权为自愿选择，不影响检测服务及报告出具；未成年受检人由监护人代为签署
        </p>
      </div>

      {pending && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={() => setPending(null)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="auth-confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="rounded-t-2xl bg-white px-4 pb-8 pt-4 motion-safe:animate-in motion-safe:slide-in-from-bottom"
          >
            <h2 id="auth-confirm-title" className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
              <FileSignature className="size-4 text-primary" aria-hidden="true" />
              {pending.action === 'sign' ? '签署《科研知情同意书》' : '确认撤回科研授权？'}
            </h2>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              受检人：{initialExaminees.find((m) => m.id === pending.auth.memberId)?.name} ·{' '}
              {testServices.find((s) => s.id === pending.auth.serviceId)?.name}
            </p>
            {pending.action === 'sign' ? (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-[#f4f8fe] p-3 text-[12px] leading-5 text-muted-foreground">
                本人自愿同意将本次检测的剩余样本及去标识化的基因数据用于医学研究。研究过程中不会公开可识别个人身份的信息，数据加密存储，仅限经伦理委员会批准的研究项目使用。本人可随时撤回授权，撤回不影响已出具的检测报告。
              </div>
            ) : (
              <p className="mt-2 rounded-xl bg-[#fff4e8] p-3 text-[12px] leading-5 text-[#b4612a]">
                撤回后样本与数据将不再用于新的研究，已完成或已发表的研究成果无法撤回。
              </p>
            )}
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="h-10 flex-1 rounded-full border border-border text-[14px] text-foreground"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirm}
                className={cn(
                  'h-10 flex-1 rounded-full text-[14px] font-medium text-white',
                  pending.action === 'sign' ? 'bg-primary' : 'bg-[#e5603a]',
                )}
              >
                {pending.action === 'sign' ? '同意并签署' : '确认撤回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SubPage>
  )
}
