'use client'

import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Check, Info, Loader2, ScanFace, ShieldCheck, X } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import type { Examinee } from '@/components/mini/checkout-data'
import { cn } from '@/lib/utils'

type Props = {
  self: Examinee
  onBack: () => void
  onVerified: (e: Examinee) => void
}

type Phase = 'form' | 'face' | 'verifying' | 'success'

const genderFromId = (id: string) => (Number(id[16]) % 2 === 1 ? 'male' : 'female')
const birthFromId = (id: string) => `${id.slice(6, 10)}-${id.slice(10, 12)}-${id.slice(12, 14)}`

export function ExamineeVerifyScreen({ self, onBack, onVerified }: Props) {
  const [name, setName] = useState(self.name)
  const [idCard, setIdCard] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState<Phase>('form')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const submit = () => {
    if (!/^[\u4e00-\u9fa5·]{2,20}$/.test(name.trim())) return setError('请填写身份证上的真实姓名')
    if (!/^\d{17}[\dX]$/.test(idCard)) return setError('请输入 18 位身份证号')
    if (!agreed) return setError('请阅读并同意《实名认证服务协议》')
    setError('')
    setPhase('face')
  }

  const startFace = () => {
    setPhase('verifying')
    timer.current = setTimeout(() => setPhase('success'), 1800)
  }

  const finish = () => {
    const birth = birthFromId(idCard)
    const age = new Date().getFullYear() - Number(birth.slice(0, 4))
    onVerified({
      ...self,
      name: name.trim(),
      gender: genderFromId(idCard),
      birth,
      age,
      idCard: `${idCard.slice(0, 4)}**********${idCard.slice(14)}`,
    })
  }

  if (phase === 'success') {
    return (
      <SubPage title="实名认证" titleId="verify-title" onBack={finish}>
        <div className="flex flex-1 flex-col items-center px-6 pt-14 text-center">
          <BadgeCheck className="size-16 text-success" strokeWidth={1.5} aria-hidden="true" />
          <p className="mt-3 text-headline font-semibold text-foreground">认证成功</p>
          <p className="mt-1.5 text-note leading-5 text-muted-foreground">
            已完成本人实名认证，姓名、性别、出生日期与身份证号已锁定，不可再修改
          </p>
          <dl className="mt-5 flex w-full flex-col gap-1.5 rounded-2xl bg-white p-3.5 text-left text-caption leading-[18px]">
            <Info2 label="姓名" value={name.trim()} />
            <Info2 label="身份证号" value={`${idCard.slice(0, 4)}**********${idCard.slice(14)}`} />
            <Info2 label="出生日期" value={birthFromId(idCard)} />
          </dl>
          <button
            type="button"
            onClick={finish}
            className="mt-6 h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground"
          >
            完成
          </button>
        </div>
      </SubPage>
    )
  }

  return (
    <SubPage title="实名认证" titleId="verify-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        <div className="flex items-start gap-2.5 rounded-2xl bg-secondary p-3.5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-body font-semibold text-foreground">为什么需要实名认证</p>
            <p className="mt-1 text-caption leading-[18px] text-muted-foreground">
              本人认证后可签署科研知情同意书、查看完整报告并享受 AI 个性化解读；认证信息仅用于身份核验，加密存储。
            </p>
          </div>
        </div>

        <section aria-label="身份信息" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <label className="flex h-12 items-center gap-3 border-b border-border">
            <span className="w-[68px] shrink-0 text-body text-foreground">
              姓名<span className="ml-0.5 text-destructive">*</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="与身份证一致"
              className="min-w-0 flex-1 bg-transparent text-right text-body text-foreground outline-none placeholder:text-faint"
            />
          </label>
          <label className="flex h-12 items-center gap-3">
            <span className="w-[68px] shrink-0 text-body text-foreground">
              身份证号<span className="ml-0.5 text-destructive">*</span>
            </span>
            <input
              value={idCard}
              onChange={(e) => setIdCard(e.target.value.replace(/[^\dXx]/g, '').slice(0, 18).toUpperCase())}
              placeholder="请输入 18 位身份证号"
              className="min-w-0 flex-1 bg-transparent text-right text-body tabular-nums text-foreground outline-none placeholder:text-faint"
            />
          </label>
        </section>
        {error && (
          <p role="alert" className="mt-2 px-1 text-caption text-destructive">
            {error}
          </p>
        )}

        <ol className="mt-2.5 flex flex-col gap-2 rounded-2xl bg-white p-3.5 text-caption leading-[18px] text-muted-foreground">
          <li className="font-semibold text-foreground">认证说明</li>
          <li>1. 填写本人姓名与身份证号，系统校验信息一致性</li>
          <li>2. 通过人脸识别确认为本人操作</li>
          <li>3. 认证成功后，性别与出生日期将按身份证自动回填并锁定</li>
        </ol>

        <p className="mt-2.5 flex items-start gap-1 px-1 text-caption leading-4 text-faint">
          <Info className="mt-px size-3 shrink-0" aria-hidden="true" />
          仅「本人」需实名认证，家人无需认证即可下单检测
        </p>
      </div>

      <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={agreed}
          onClick={() => setAgreed((v) => !v)}
          className="flex w-full items-center gap-2 text-left text-caption text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-4 shrink-0 items-center justify-center rounded-full border',
              agreed ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
            )}
          >
            {agreed && <Check className="size-3" strokeWidth={3} />}
          </span>
          我已阅读并同意<span className="text-primary">《实名认证服务协议》</span>
        </button>
        <button
          type="button"
          onClick={submit}
          className="mt-2.5 h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
        >
          下一步：人脸识别
        </button>
      </div>

      {(phase === 'face' || phase === 'verifying') && (
        <div
          className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40"
          onClick={phase === 'verifying' ? undefined : () => setPhase('form')}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-face-title"
            onClick={(e) => e.stopPropagation()}
            className="rounded-t-2xl bg-white motion-safe:animate-in motion-safe:slide-in-from-bottom"
          >
            <header className="flex items-center px-4 pt-4">
              <h2 id="verify-face-title" className="flex-1 text-title font-semibold text-foreground">
                人脸识别
              </h2>
              {phase === 'face' && (
                <button type="button" aria-label="关闭" onClick={() => setPhase('form')} className="p-1 text-muted-foreground">
                  <X className="size-4" />
                </button>
              )}
            </header>
            <div className="flex flex-col items-center px-4 pb-8 pt-5">
              <div className="relative flex size-36 items-center justify-center rounded-full bg-background">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 rounded-full border-[3px]',
                    phase === 'verifying'
                      ? 'border-primary border-t-transparent motion-safe:animate-spin'
                      : 'border-[#cfe0fb]',
                  )}
                />
                <ScanFace className="size-16 text-primary" strokeWidth={1.3} aria-hidden="true" />
              </div>
              <p className="mt-4 text-body font-medium text-foreground" aria-live="polite">
                {phase === 'verifying' ? '正在识别，请保持不动…' : '请将面部置于圆框内'}
              </p>
              <p className="mt-1 text-caption text-muted-foreground">光线充足、正对屏幕、勿佩戴口罩或帽子</p>
              <button
                type="button"
                disabled={phase === 'verifying'}
                onClick={startFace}
                className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-body font-medium text-primary-foreground disabled:opacity-70"
              >
                {phase === 'verifying' && <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />}
                {phase === 'verifying' ? '识别中' : '开始识别'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SubPage>
  )
}

function Info2({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-14 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 tabular-nums text-foreground">{value}</dd>
    </div>
  )
}
