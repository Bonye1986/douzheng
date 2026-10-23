'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronLeft, CircleCheck, Eraser, Info, Loader2, ScanFace, ShieldCheck, X } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { cn } from '@/lib/utils'

export type SignAction = 'sign' | 'withdraw'

type Step = 'doc' | 'face' | 'verifying' | 'submitting' | 'success'

type Props = {
  action: SignAction
  memberName: string
  serviceName: string
  orderNo: string
  onClose: () => void
  onDone: () => void
}

export const researchDocs: Record<SignAction, { title: string; body: string[] }> = {
  sign: {
    title: '科研知情同意书',
    body: [
      '一、研究目的：本研究旨在探索药物基因多态性与药物疗效、不良反应之间的关联，推动精准用药研究。',
      '二、使用范围：本人自愿同意将本次检测的剩余样本及去标识化基因数据，用于经伦理委员会批准的医学研究项目。',
      '三、隐私保护：研究过程中不公开任何可识别个人身份的信息，数据加密存储，访问全程留痕。',
      '四、自愿原则：本授权为自愿选择，不影响检测服务及报告出具；本人可随时签署撤销书撤回授权。',
    ],
  },
  withdraw: {
    title: '科研知情同意撤销书',
    body: [
      '本人申请撤销此前签署的《科研知情同意书》，自撤销生效之日起：',
      '一、本人样本及数据将不再用于任何新的研究项目，剩余样本按规定销毁。',
      '二、撤销前已完成或已发表的研究成果无法撤回。',
      '三、撤销不影响本次检测服务及报告；如需再次授权，可重新签署《科研知情同意书》。',
    ],
  },
}

const today = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function ResearchSignFlow({ action, memberName, serviceName, orderNo, onClose, onDone }: Props) {
  const isSign = action === 'sign'
  const [step, setStep] = useState<Step>(isSign ? 'face' : 'doc')
  const [faceVerified, setFaceVerified] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const doc = researchDocs[action]
  const ready = agreed && signed && (!isSign || faceVerified)

  const submit = () => {
    if (!ready) return
    setStep('submitting')
    timer.current = setTimeout(() => setStep('success'), 900)
  }

  const startVerify = () => {
    setStep('verifying')
    timer.current = setTimeout(() => {
      setFaceVerified(true)
      setStep('doc')
    }, 1800)
  }

  const pageTitle = isSign ? '签署科研知情同意书' : '撤销科研知情同意书'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="research-flow-title"
      className="absolute inset-0 z-50 flex flex-col bg-background motion-safe:animate-in motion-safe:slide-in-from-right"
    >
      <div className="shrink-0 border-b border-border/70 bg-white">
        <StatusBar />
        <div className="relative flex h-11 items-center justify-center px-3">
          {step !== 'success' && (
            <button
              type="button"
              aria-label="返回"
              onClick={onClose}
              disabled={step === 'verifying' || step === 'submitting'}
              className="absolute left-2 flex size-8 items-center justify-center text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <h1 id="research-flow-title" className="text-heading font-semibold text-foreground">
            {pageTitle}
          </h1>
          <Capsule className="absolute right-3" />
        </div>
      </div>

      {step === 'success' ? (
        <SuccessView isSign={isSign} memberName={memberName} serviceName={serviceName} orderNo={orderNo} onDone={onDone} />
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
            {isSign && faceVerified && (
              <p className="mb-2.5 flex items-center gap-1.5 rounded-xl bg-success/10 px-3 py-2 text-caption font-medium text-success">
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                e签宝 人脸核验已通过，请阅读文书并完成签署
              </p>
            )}
            <section className="rounded-2xl bg-white p-3.5">
              <dl className="flex flex-col gap-1.5 text-caption leading-[18px]">
                <InfoRow label="受检人" value={memberName} />
                <InfoRow label="检测项目" value={serviceName} />
                <InfoRow label="订单号" value={orderNo} mono />
              </dl>
            </section>

            <article aria-label={doc.title} className="mt-2.5 rounded-2xl bg-white p-4">
              <h2 className="text-center text-title font-semibold text-foreground">{doc.title}</h2>
              {doc.body.map((p) => (
                <p key={p} className="mt-2.5 text-note leading-6 text-muted-foreground">
                  {p}
                </p>
              ))}
              <dl className="mt-4 flex flex-col gap-1 border-t border-dashed border-border pt-3 text-caption text-muted-foreground">
                <div className="flex gap-2">
                  <dt>签署人：</dt>
                  <dd className="text-foreground">{memberName}</dd>
                </div>
                <div className="flex gap-2">
                  <dt>签署日期：</dt>
                  <dd className="tabular-nums text-foreground">{today()}</dd>
                </div>
              </dl>
            </article>

            <section aria-labelledby="sign-pad-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
              <div className="flex items-center justify-between">
                <h2 id="sign-pad-title" className="text-body font-semibold text-foreground">
                  手写签名<span className="ml-0.5 text-destructive">*</span>
                </h2>
                <span className="text-caption text-faint">请正楷书写本人姓名</span>
              </div>
              <SignaturePad onInkChange={setSigned} />
            </section>

            <p className="mt-2.5 flex items-start gap-1 px-1 text-caption leading-4 text-faint">
              <Info className="mt-px size-3 shrink-0" aria-hidden="true" />
              {isSign
                ? '已通过 e签宝 实名人脸核验，核验信息仅用于本次电子签名；未成年受检人由监护人核验并代为签署'
                : '撤销无需人脸核验，提交手写签名后即刻生效；撤销不影响本次检测与报告'}
            </p>
          </div>

          <footer className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreed}
              onClick={() => setAgreed((v) => !v)}
              className="flex w-full items-start gap-2 text-left text-caption leading-[18px] text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-px flex size-4 shrink-0 items-center justify-center rounded-full border',
                  agreed ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                )}
              >
                {agreed && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span>
                我已仔细阅读并充分理解《{doc.title}》全部内容，{isSign ? '自愿签署' : '自愿撤销科研授权'}
              </span>
            </button>
            <button
              type="button"
              disabled={!ready || step === 'submitting'}
              onClick={submit}
              className={cn(
                'mt-2.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-body font-medium text-white disabled:opacity-40',
                isSign ? 'bg-primary' : 'bg-destructive',
              )}
            >
              {step === 'submitting' && <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />}
              {step === 'submitting' ? '提交中' : isSign ? '确认签署' : '确认撤销'}
            </button>
            {!ready && (
              <p className="mt-1.5 text-center text-tag text-faint">{signed ? '请勾选同意' : '请先完成手写签名'}</p>
            )}
          </footer>
        </>
      )}

      {(step === 'face' || step === 'verifying') && (
        <FaceSheet verifying={step === 'verifying'} onStart={startVerify} onClose={onClose} />
      )}
    </div>
  )
}

function FaceSheet({ verifying, onStart, onClose }: { verifying: boolean; onStart: () => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-black/40" onClick={verifying ? undefined : onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="face-title"
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl bg-white motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <header className="flex items-center gap-2 px-4 pt-4">
          <h2 id="face-title" className="flex flex-1 items-center gap-1.5 text-title font-semibold text-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            e签宝 · 实名人脸核验
          </h2>
          {!verifying && (
            <button type="button" aria-label="关闭" onClick={onClose} className="-mr-1 p-1 text-muted-foreground">
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
                verifying ? 'border-primary border-t-transparent motion-safe:animate-spin' : 'border-[#cfe0fb]',
              )}
            />
            <ScanFace className="size-16 text-primary" strokeWidth={1.3} aria-hidden="true" />
          </div>
          <p className="mt-4 text-body font-medium text-foreground" aria-live="polite">
            {verifying ? '正在核验，请保持面部在框内…' : '请将面部置于圆框内'}
          </p>
          <p className="mt-1 text-caption text-muted-foreground">
            {verifying ? '请按提示缓慢眨眼' : '光线充足、正对屏幕、勿佩戴口罩'}
          </p>
          <button
            type="button"
            disabled={verifying}
            onClick={onStart}
            className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-body font-medium text-primary-foreground disabled:opacity-70"
          >
            {verifying && <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />}
            {verifying ? '核验中' : '开始人脸核验'}
          </button>
          <p className="mt-2.5 text-tag text-faint">由 e签宝 提供实名认证与电子签名服务</p>
        </div>
      </div>
    </div>
  )
}

function SuccessView({
  isSign,
  memberName,
  serviceName,
  orderNo,
  onDone,
}: {
  isSign: boolean
  memberName: string
  serviceName: string
  orderNo: string
  onDone: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-14 text-center">
      <CircleCheck className="size-16 text-success" strokeWidth={1.5} aria-hidden="true" />
      <p className="mt-3 text-headline font-semibold text-foreground">{isSign ? '签署成功' : '撤销成功'}</p>
      <p className="mt-1.5 text-note leading-5 text-muted-foreground">
        {isSign
          ? '电子签名已生效，可在「授权与同意书」查看或撤销'
          : '科研授权已撤销，样本与数据不再用于新的研究'}
      </p>
      <dl className="mt-5 flex w-full flex-col gap-1.5 rounded-2xl bg-white p-3.5 text-left text-caption leading-[18px]">
        <InfoRow label="受检人" value={memberName} />
        <InfoRow label="检测项目" value={serviceName} />
        <InfoRow label="订单号" value={orderNo} mono />
        <InfoRow label="状态" value={isSign ? '已授权' : '已撤销'} />
      </dl>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground"
      >
        完成
      </button>
    </div>
  )
}

function SignaturePad({ onInkChange }: { onInkChange: (hasInk: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasInk, setHasInk] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1f2937'
  }, [])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const clear = () => {
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    onInkChange(false)
  }

  return (
    <div className="relative mt-2.5">
      <canvas
        ref={canvasRef}
        aria-label="手写签名区域"
        className="block h-32 w-full touch-none rounded-xl border border-dashed border-border bg-background"
        onPointerDown={(e) => {
          drawing.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          const ctx = e.currentTarget.getContext('2d')
          const { x, y } = point(e)
          ctx?.beginPath()
          ctx?.moveTo(x, y)
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return
          const ctx = e.currentTarget.getContext('2d')
          const { x, y } = point(e)
          ctx?.lineTo(x, y)
          ctx?.stroke()
          if (!hasInk) {
            setHasInk(true)
            onInkChange(true)
          }
        }}
        onPointerUp={() => {
          drawing.current = false
        }}
        onPointerCancel={() => {
          drawing.current = false
        }}
      />
      {!hasInk && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-note text-faint">
          请在此处签名
        </span>
      )}
      <button
        type="button"
        onClick={clear}
        disabled={!hasInk}
        className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-caption text-muted-foreground shadow-sm disabled:opacity-40"
      >
        <Eraser className="size-3" aria-hidden="true" />
        重写
      </button>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="w-14 shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn('min-w-0 flex-1 text-foreground', mono && 'tabular-nums')}>{value}</dd>
    </div>
  )
}
