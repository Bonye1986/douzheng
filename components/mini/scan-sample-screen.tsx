'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, CircleCheck, Keyboard, ScanLine, Zap, ZapOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type BarcodeDetectorLike = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> }
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike

const SAMPLE_CODE_PATTERN = /^[A-Z0-9]{8,20}$/

/** 原型环境无法识别真实标签时，按订单生成一个演示用样本标签码 */
const demoCodeFor = (orderNo: string) => `YB${orderNo.replace(/\D/g, '').slice(2, 14)}01`

type Phase = 'scanning' | 'confirm' | 'done'

export function ScanSampleScreen({
  orderNo,
  examinees,
  product,
  onBack,
  onBound,
  onGoSend,
}: {
  orderNo: string
  examinees: string
  product: string
  onBack: () => void
  onBound: (sampleCode: string) => void
  onGoSend: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<Phase>('scanning')
  const [code, setCode] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [torch, setTorch] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const [manualError, setManualError] = useState('')
  const [scanRound, setScanRound] = useState(0)

  const recognize = (value: string) => {
    setCode(value.trim().toUpperCase())
    setPhase('confirm')
  }

  useEffect(() => {
    if (phase !== 'scanning' || manualOpen) return
    let stream: MediaStream | null = null
    let raf = 0
    let cancelled = false
    let demoTimer = 0

    const Detector = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
    const startDemoFallback = () => {
      demoTimer = window.setTimeout(() => !cancelled && recognize(demoCodeFor(orderNo)), 2600)
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        const video = videoRef.current
        if (!video) return
        video.srcObject = s
        await video.play().catch(() => {})
        setCameraReady(true)
        if (!Detector) return startDemoFallback()
        const detector = new Detector({ formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'data_matrix'] })
        const tick = async () => {
          if (cancelled) return
          try {
            const [hit] = await detector.detect(video)
            if (hit?.rawValue) return recognize(hit.rawValue)
          } catch {}
          raf = requestAnimationFrame(tick)
        }
        tick()
      })
      .catch(() => {
        setCameraError(true)
        startDemoFallback()
      }) ?? (setCameraError(true), startDemoFallback())

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.clearTimeout(demoTimer)
      stream?.getTracks().forEach((t) => t.stop())
      setCameraReady(false)
    }
  }, [phase, manualOpen, orderNo, scanRound])

  const submitManual = () => {
    const v = manualValue.trim().toUpperCase()
    if (!SAMPLE_CODE_PATTERN.test(v)) {
      setManualError('请输入 8–20 位字母或数字的样本标签码')
      return
    }
    setManualOpen(false)
    recognize(v)
  }

  if (phase === 'done') {
    return (
      <div className="absolute inset-0 z-30 flex flex-col bg-background">
        <header className="flex h-11 shrink-0 items-center bg-white px-2">
          <button type="button" onClick={onBack} aria-label="返回" className="flex size-9 items-center justify-center">
            <ChevronLeft className="size-5 text-foreground" aria-hidden="true" />
          </button>
          <h1 className="flex-1 pr-9 text-center text-title font-semibold text-foreground">绑定结果</h1>
        </header>
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-6 pt-10">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CircleCheck className="size-9" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-heading font-semibold text-foreground">样本绑定成功</h2>
          <p className="mt-1.5 text-center text-note leading-5 text-muted-foreground">
            订单已变为「待寄样」，请封装好样本后预约顺丰上门取件
          </p>
          <dl className="mt-6 w-full space-y-2.5 rounded-2xl bg-white p-4 text-note">
            {[
              ['样本标签码', code],
              ['订单编号', orderNo],
              ['检测项目', product],
              ['受检人', examinees],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-[72px] shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 flex-1 break-all tabular-nums text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex shrink-0 gap-2.5 border-t border-border bg-white px-4 pb-6 pt-2.5">
          <button
            type="button"
            onClick={onBack}
            className="h-10 flex-1 rounded-full border border-border text-body font-medium text-foreground"
          >
            返回订单
          </button>
          <button
            type="button"
            onClick={onGoSend}
            className="h-10 flex-1 rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
          >
            去寄样
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-[#0b0f17] text-white">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden="true"
        className={cn('absolute inset-0 size-full object-cover transition-opacity', cameraReady ? 'opacity-100' : 'opacity-0')}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      <header className="relative flex h-11 shrink-0 items-center px-2">
        <button type="button" onClick={onBack} aria-label="返回" className="flex size-9 items-center justify-center">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="flex-1 pr-9 text-center text-title font-semibold">扫描样本标签</h1>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center px-8">
        <div className="relative aspect-[4/3] w-full max-w-[260px]" role="img" aria-label="扫描框，请将采样盒上的样本标签条码放入框内">
          {(['left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-lg', 'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-lg', 'left-0 bottom-0 border-l-[3px] border-b-[3px] rounded-bl-lg', 'right-0 bottom-0 border-r-[3px] border-b-[3px] rounded-br-lg'] as const).map((c) => (
            <span key={c} aria-hidden="true" className={cn('absolute size-6 border-primary', c)} />
          ))}
          {phase === 'scanning' && (
            <span
              aria-hidden="true"
              className="absolute inset-x-3 h-0.5 animate-[scanline_2s_ease-in-out_infinite] rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/70"
            />
          )}
        </div>
        <p className="mt-5 text-center text-note leading-5 text-white/85">
          将采样盒上的<span className="font-semibold text-white">样本标签条码</span>放入框内，即可自动识别
        </p>
        <p className="mt-1 text-center text-caption text-white/55" aria-live="polite">
          {cameraError ? '未获取到摄像头权限，已进入演示识别；也可手动输入标签码' : cameraReady ? '正在识别…' : '正在打开摄像头…'}
        </p>
      </div>

      <div className="relative flex shrink-0 items-center justify-center gap-14 pb-10 pt-4">
        <button
          type="button"
          onClick={() => setTorch((v) => !v)}
          aria-pressed={torch}
          className="flex flex-col items-center gap-1.5 text-caption text-white/85"
        >
          <span className={cn('flex size-11 items-center justify-center rounded-full', torch ? 'bg-white text-[#0b0f17]' : 'bg-white/15')}>
            {torch ? <Zap className="size-5" aria-hidden="true" /> : <ZapOff className="size-5" aria-hidden="true" />}
          </span>
          {torch ? '关闭手电筒' : '打开手电筒'}
        </button>
        <button
          type="button"
          onClick={() => {
            setManualValue('')
            setManualError('')
            setManualOpen(true)
          }}
          className="flex flex-col items-center gap-1.5 text-caption text-white/85"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-white/15">
            <Keyboard className="size-5" aria-hidden="true" />
          </span>
          手动输入
        </button>
      </div>

      {manualOpen && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50" onClick={() => setManualOpen(false)}>
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-code-title"
            className="rounded-t-2xl bg-white px-4 pb-6 pt-4 text-foreground"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault()
              submitManual()
            }}
          >
            <h2 id="manual-code-title" className="text-title font-semibold">
              手动输入样本标签码
            </h2>
            <p className="mt-1 text-caption text-muted-foreground">标签码位于采样管 / 采样盒标签条码下方</p>
            <label htmlFor="manual-code" className="sr-only">
              样本标签码
            </label>
            <input
              id="manual-code"
              autoFocus
              value={manualValue}
              onChange={(e) => {
                setManualValue(e.target.value)
                setManualError('')
              }}
              placeholder="例如 YB2026101500101"
              autoComplete="off"
              aria-invalid={Boolean(manualError)}
              aria-describedby={manualError ? 'manual-code-error' : undefined}
              className="mt-3 h-11 w-full rounded-xl border border-border bg-muted px-3 text-body uppercase tabular-nums outline-none placeholder:normal-case placeholder:text-muted-foreground focus:border-primary"
            />
            {manualError && (
              <p id="manual-code-error" className="mt-1.5 text-caption text-destructive">
                {manualError}
              </p>
            )}
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setManualOpen(false)}
                className="h-10 flex-1 rounded-full border border-border text-body font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!manualValue.trim()}
                className="h-10 flex-1 rounded-full bg-primary text-body font-medium text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
              >
                确定
              </button>
            </div>
          </form>
        </div>
      )}

      {phase === 'confirm' && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bind-confirm-title"
            className="rounded-t-2xl bg-white px-4 pb-6 pt-4 text-foreground"
          >
            <h2 id="bind-confirm-title" className="flex items-center gap-1.5 text-title font-semibold">
              <ScanLine className="size-4.5 text-primary" aria-hidden="true" />
              确认绑定样本
            </h2>
            <dl className="mt-3 space-y-2 rounded-xl bg-muted p-3 text-note">
              {[
                ['样本标签码', code],
                ['订单编号', orderNo],
                ['检测项目', product],
                ['受检人', examinees],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-[72px] shrink-0 text-muted-foreground">{k}</dt>
                  <dd className={cn('min-w-0 flex-1 break-all tabular-nums', k === '样本标签码' ? 'font-semibold text-primary' : 'text-foreground')}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2.5 text-caption leading-[18px] text-warning">
              请核对标签码与采样管上的标签一致，绑定后不可修改
            </p>
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCode('')
                  setPhase('scanning')
                  setScanRound((n) => n + 1)
                }}
                className="h-10 flex-1 rounded-full border border-border text-body font-medium"
              >
                重新扫描
              </button>
              <button
                type="button"
                onClick={() => {
                  onBound(code)
                  setPhase('done')
                }}
                className="h-10 flex-1 rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
              >
                确认绑定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
