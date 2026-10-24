'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, CheckCircle2, ImageIcon, RotateCcw, ScanLine, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DrugScanResult = {
  drug: string
  spec: string
  dose: string
  unit: string
  meal: '饭前' | '饭后' | '随餐' | '睡前' | '不限'
  timesPerDay: number
  manufacturer: string
  approval: string
  usage: string
}

const SAMPLE_IMAGE = '/images/drug-box-sample.png'

const sampleResult: DrugScanResult = {
  drug: '硫酸氢氯吡格雷片',
  spec: '75mg × 7片',
  dose: '1',
  unit: '片',
  meal: '不限',
  timesPerDay: 1,
  manufacturer: '示例制药有限公司',
  approval: '国药准字H2000XXXX',
  usage: '口服，一日一次，每次 1 片，可与或不与食物同服',
}

type Stage = 'capture' | 'recognizing' | 'result' | 'failed'

export function DrugScanSheet({
  onClose,
  onApply,
}: {
  onClose: () => void
  onApply: (r: DrugScanResult) => void
}) {
  const [stage, setStage] = useState<Stage>('capture')
  const [photo, setPhoto] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
  }, [])

  useEffect(() => {
    if (stage !== 'recognizing') return
    const t = setTimeout(() => setStage(attempt === 0 || attempt % 3 !== 2 ? 'result' : 'failed'), 1600)
    return () => clearTimeout(t)
  }, [stage, attempt])

  const startRecognize = (src: string) => {
    setPhoto(src)
    setAttempt((a) => a + 1)
    setStage('recognizing')
  }

  const onFile = (file?: File) => {
    if (!file) return
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = URL.createObjectURL(file)
    startRecognize(objectUrl.current)
  }

  const retake = () => {
    setPhoto(null)
    setStage('capture')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drug-scan-title"
      className="absolute inset-0 z-40 flex flex-col bg-[#0b1220] text-white"
    >
      <header className="flex h-11 shrink-0 items-center justify-between px-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭识别"
          className="flex size-8 items-center justify-center rounded-full bg-white/10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <h2 id="drug-scan-title" className="text-title font-semibold">
          拍照识别药盒
        </h2>
        <span className="size-8" aria-hidden="true" />
      </header>

      <div className="relative mx-4 mt-2 aspect-[4/3] overflow-hidden rounded-2xl bg-black/40">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="已拍摄的药盒照片" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-white/60">
            <ScanLine className="size-8" aria-hidden="true" />
            <p className="text-caption">将药盒正面放入框内，确保药名与规格清晰</p>
          </div>
        )}

        <div aria-hidden="true" className="pointer-events-none absolute inset-4">
          {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map(
            (c) => (
              <span key={c} className={cn('absolute size-5 rounded-[3px] border-primary', c)} />
            ),
          )}
          {stage === 'recognizing' && (
            <span className="absolute inset-x-0 h-0.5 animate-[drugscan_1.6s_ease-in-out_infinite] bg-primary shadow-[0_0_12px_2px] shadow-primary/70" />
          )}
        </div>

        {stage === 'recognizing' && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/55 py-2 text-caption" role="status">
            <Zap className="size-3.5 text-primary" aria-hidden="true" />
            正在识别药品名称、规格与用法…
          </div>
        )}
      </div>

      <style>{`@keyframes drugscan{0%{top:0}50%{top:calc(100% - 2px)}100%{top:0}}`}</style>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {stage === 'capture' && (
        <div className="mt-auto flex flex-col items-center gap-4 px-6 pb-8">
          <ul className="w-full space-y-1 text-caption leading-relaxed text-white/60">
            <li>· 光线充足、避免反光，药盒正面朝上</li>
            <li>· 识别结果仅供参考，请以说明书及医嘱为准</li>
          </ul>
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-16 flex-col items-center gap-1 text-caption text-white/80"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
                <ImageIcon className="size-5" aria-hidden="true" />
              </span>
              相册
            </button>
            <button
              type="button"
              onClick={() => startRecognize(SAMPLE_IMAGE)}
              aria-label="拍照"
              className="flex size-16 items-center justify-center rounded-full border-4 border-white/30 bg-white"
            >
              <Camera className="size-6 text-[#0b1220]" aria-hidden="true" />
            </button>
            <span className="w-16" aria-hidden="true" />
          </div>
        </div>
      )}

      {stage === 'failed' && (
        <div className="mt-auto rounded-t-3xl bg-white px-4 pb-6 pt-5 text-center text-foreground">
          <p className="text-title font-semibold">未能识别药品信息</p>
          <p className="mt-1.5 text-caption leading-relaxed text-muted-foreground">
            照片可能模糊或药名被遮挡，请重新拍摄，或返回手动填写
          </p>
          <div className="mt-4 flex gap-2.5">
            <button type="button" onClick={onClose} className="h-10 flex-1 rounded-full border border-border text-body">
              手动填写
            </button>
            <button type="button" onClick={retake} className="h-10 flex-1 rounded-full bg-primary text-body font-medium text-primary-foreground">
              重新拍摄
            </button>
          </div>
        </div>
      )}

      {stage === 'result' && (
        <div className="mt-auto flex max-h-[62%] flex-col rounded-t-3xl bg-white text-foreground">
          <div className="flex items-center gap-1.5 px-4 pt-4">
            <CheckCircle2 className="size-4 text-[#16a36a]" aria-hidden="true" />
            <p className="text-title font-semibold">识别成功</p>
            <span className="ml-auto text-caption text-muted-foreground">填入后可手动修改</span>
          </div>
          <dl className="mt-3 flex-1 space-y-2 overflow-y-auto px-4 text-caption [scrollbar-width:none]">
            {[
              ['药品名称', sampleResult.drug],
              ['规格', sampleResult.spec],
              ['单次剂量', `${sampleResult.dose} ${sampleResult.unit}`],
              ['服用频次', `每天 ${sampleResult.timesPerDay} 次`],
              ['服用要求', sampleResult.meal],
              ['用法用量', sampleResult.usage],
              ['生产企业', sampleResult.manufacturer],
              ['批准文号', sampleResult.approval],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted-foreground">{k}</dt>
                <dd className="flex-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-2.5 px-4 pb-6 pt-4">
            <button
              type="button"
              onClick={retake}
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-border text-body"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              重拍
            </button>
            <button
              type="button"
              onClick={() => onApply(sampleResult)}
              className="h-10 flex-[2] rounded-full bg-primary text-body font-medium text-primary-foreground"
            >
              填入表单
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
