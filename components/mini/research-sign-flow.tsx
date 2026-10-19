'use client'

import { useEffect, useRef, useState } from 'react'
import { CircleCheck, FileSignature, Loader2, ScanFace, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SignAction = 'sign' | 'withdraw'

type Step = 'read' | 'face' | 'verifying' | 'success'

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

export function ResearchSignFlow({ action, memberName, serviceName, orderNo, onClose, onDone }: Props) {
  const [step, setStep] = useState<Step>('read')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const doc = researchDocs[action]
  const isSign = action === 'sign'

  const startVerify = () => {
    setStep('verifying')
    timer.current = setTimeout(() => setStep('success'), 1800)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={step === 'read' ? onClose : undefined}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-flow-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88%] flex-col rounded-t-2xl bg-white motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <header className="flex items-center gap-2 px-4 pt-4">
          <h2 id="research-flow-title" className="flex flex-1 items-center gap-1.5 text-title font-semibold text-foreground">
            {step === 'read' ? (
              <>
                <FileSignature className="size-4 text-primary" aria-hidden="true" />
                签署《{doc.title}》
              </>
            ) : (
              <>
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                e签宝 · 实名人脸核验
              </>
            )}
          </h2>
          {step !== 'verifying' && step !== 'success' && (
            <button type="button" aria-label="关闭" onClick={onClose} className="-mr-1 p-1 text-muted-foreground">
              <X className="size-4" />
            </button>
          )}
        </header>

        <ol aria-label="签署步骤" className="mx-4 mt-3 flex items-center gap-1.5 text-caption">
          {['阅读文书', '人脸核验', '签署完成'].map((label, i) => {
            const cur = step === 'read' ? 0 : step === 'success' ? 2 : 1
            const done = i < cur || step === 'success'
            return (
              <li key={label} className="flex flex-1 items-center gap-1.5">
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full text-tag tabular-nums',
                    done || i === cur ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn(i <= cur ? 'text-foreground' : 'text-faint')}>{label}</span>
                {i < 2 && <span aria-hidden="true" className={cn('h-px flex-1', i < cur ? 'bg-primary' : 'bg-border')} />}
              </li>
            )
          })}
        </ol>

        <div className="mx-4 mt-3 rounded-xl bg-background px-3 py-2 text-caption leading-5 text-muted-foreground">
          受检人 <span className="font-medium text-foreground">{memberName}</span> · {serviceName}
          <span className="block text-caption tabular-nums text-faint">订单号 {orderNo}</span>
        </div>

        {step === 'read' && (
          <>
            <div className="mx-4 mt-2.5 min-h-0 flex-1 overflow-y-auto rounded-xl border border-border p-3 [scrollbar-width:none]">
              <p className="text-center text-body font-semibold text-foreground">{doc.title}</p>
              {doc.body.map((p) => (
                <p key={p} className="mt-2 text-caption leading-5 text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            <p className="mx-4 mt-2.5 text-caption leading-4 text-faint">
              {'为确保本人意愿，签署需通过 e签宝 人脸核验，核验信息仅用于本次电子签名'}
            </p>
            <div className="flex gap-2.5 px-4 pb-8 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="h-10 flex-1 rounded-full border border-border text-body text-foreground"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => setStep('face')}
                className={cn(
                  'h-10 flex-[1.4] rounded-full text-body font-medium text-white',
                  isSign ? 'bg-primary' : 'bg-destructive',
                )}
              >
                {isSign ? '同意并去人脸核验' : '确认撤销并去核验'}
              </button>
            </div>
          </>
        )}

        {(step === 'face' || step === 'verifying') && (
          <div className="flex flex-col items-center px-4 pb-8 pt-5">
            <div className="relative flex size-36 items-center justify-center rounded-full bg-background">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 rounded-full border-[3px]',
                  step === 'verifying' ? 'border-primary border-t-transparent motion-safe:animate-spin' : 'border-[#cfe0fb]',
                )}
              />
              <ScanFace className="size-16 text-primary" strokeWidth={1.3} aria-hidden="true" />
            </div>
            <p className="mt-4 text-body font-medium text-foreground" aria-live="polite">
              {step === 'verifying' ? '正在核验，请保持面部在框内…' : '请将面部置于圆框内'}
            </p>
            <p className="mt-1 text-caption text-muted-foreground">
              {step === 'verifying' ? '请按提示缓慢眨眼' : '光线充足、正对屏幕、勿佩戴口罩'}
            </p>
            <button
              type="button"
              disabled={step === 'verifying'}
              onClick={startVerify}
              className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-body font-medium text-primary-foreground disabled:opacity-70"
            >
              {step === 'verifying' && <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />}
              {step === 'verifying' ? '核验中' : '开始人脸核验'}
            </button>
            <p className="mt-2.5 text-tag text-faint">由 e签宝 提供实名认证与电子签名服务</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center px-4 pb-8 pt-5 text-center">
            <CircleCheck className="size-14 text-success" strokeWidth={1.6} aria-hidden="true" />
            <p className="mt-3 text-title font-semibold text-foreground">{isSign ? '签署成功' : '撤销成功'}</p>
            <p className="mt-1 text-caption leading-5 text-muted-foreground">
              {isSign
                ? '人脸核验通过，电子签名已生效，可在「授权与同意书」查看或撤回'
                : '人脸核验通过，科研授权已撤回，样本与数据不再用于新的研究'}
            </p>
            <button
              type="button"
              onClick={onDone}
              className="mt-5 h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
