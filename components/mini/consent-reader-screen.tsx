'use client'

import { useEffect, useRef, useState } from 'react'
import { CircleCheck, Clock } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

const MIN_READ_SECONDS = 8

const sections: { title: string; body: string[] }[] = [
  {
    title: '一、检测目的',
    body: [
      '本检测通过分析您的样本中与药物代谢、转运及作用靶点相关的基因位点，为医生制定个体化用药方案提供参考依据。检测结果不能替代临床诊断，具体用药请遵医嘱。',
    ],
  },
  {
    title: '二、检测流程',
    body: [
      '1. 样本采集：根据您选择的采样方式，通过自采样套件或在定点机构完成样本采集。',
      '2. 样本运输：样本将通过冷链物流送达合作实验室，全程可追溯。',
      '3. 实验检测：实验室按照国家相关规范完成核酸提取、文库构建与测序分析。',
      '4. 报告解读：报告生成后将推送至小程序“我的报告”，可预约专业药师进行解读。',
    ],
  },
  {
    title: '三、检测局限性',
    body: [
      '基因检测仅针对已知且经验证的位点，无法覆盖全部遗传变异。药物疗效还受年龄、肝肾功能、合并用药、生活习惯等多种因素影响。',
      '由于样本质量、运输条件等客观原因，存在少量样本需要重新采集的可能，届时我们将免费为您补寄采样套件或重新安排采样。',
    ],
  },
  {
    title: '四、风险与不适',
    body: [
      '唾液采样无创无痛；血液采样可能引起局部轻微疼痛、淤青，极少数情况下出现头晕，通常可自行缓解。',
      '检测结果可能揭示您或血缘亲属的部分遗传信息，请您在充分理解后自愿参加。',
    ],
  },
  {
    title: '五、隐私与数据安全',
    body: [
      '您的样本与基因数据将进行去标识化处理并加密存储，仅用于本次检测与报告出具。未经您的书面授权，我们不会向任何第三方提供可识别您身份的信息，法律法规另有规定的除外。',
      '检测完成后，剩余样本将在规定期限内按医疗废弃物规范销毁。',
    ],
  },
  {
    title: '六、您的权利',
    body: [
      '在样本进入实验检测前，您可随时申请取消检测并退款。您有权查询、复制本人的检测报告，并可申请删除个人基因数据。',
    ],
  },
  {
    title: '七、声明',
    body: [
      '我已充分阅读并理解上述内容，知晓本检测的目的、流程、局限性及可能的风险，自愿进行本项基因检测，并同意按照本同意书约定处理我的样本与数据。',
    ],
  },
]

type Props = {
  onAgree?: () => void
  onBack: () => void
  readOnly?: boolean
  signedAt?: string
}

export function ConsentReaderScreen({ onAgree, onBack, readOnly = false, signedAt }: Props) {
  const [remaining, setRemaining] = useState(MIN_READ_SECONDS)
  const [reachedBottom, setReachedBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  const checkBottom = () => {
    const el = scrollRef.current
    if (!el || reachedBottom) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) setReachedBottom(true)
  }

  const timeDone = remaining <= 0
  const canAgree = timeDone && reachedBottom

  const buttonLabel = canAgree
    ? '我已阅读并同意'
    : !timeDone
      ? `请认真阅读（${remaining}s）`
      : '请滑动至底部完成阅读'

  return (
    <SubPage title="基因检测知情同意书" titleId="consent-title" onBack={onBack}>
      <div ref={scrollRef} onScroll={checkBottom} className="min-h-0 flex-1 overflow-y-auto bg-white px-5 pb-6 pt-4">
        {readOnly ? (
          <p className="flex items-center gap-1.5 rounded-xl bg-[#e6f7ef] px-3 py-2 text-[12px] leading-5 text-[#1f9d6b]">
            <CircleCheck className="size-3.5 shrink-0" aria-hidden="true" />
            已于 {signedAt} 签署，本同意书作为检测依据存档
          </p>
        ) : (
          <p className="rounded-xl bg-[#eef4ff] px-3 py-2 text-[12px] leading-5 text-primary">
            请您仔细阅读以下内容，阅读满 {MIN_READ_SECONDS} 秒并滑动至底部后方可确认同意。
          </p>
        )}
        <h2 className="mt-4 text-center text-[16px] font-semibold text-foreground">药物基因检测知情同意书</h2>
        <p className="mt-1 text-center text-[11px] text-muted-foreground">版本号 V2.3 · 2026 年 9 月更新</p>

        <div className="mt-4 flex flex-col gap-4">
          {sections.map((s) => (
            <section key={s.title}>
              <h3 className="text-[14px] font-semibold text-foreground">{s.title}</h3>
              {s.body.map((p) => (
                <p key={p} className="mt-1.5 text-[13px] leading-6 text-[#4a5468]">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-[#a9b3c6]">— 已到底部 —</p>
      </div>

      {!readOnly && (
      <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <div className="mb-2 flex items-center justify-center gap-4 text-[11px]">
          <span className={cn('flex items-center gap-1', timeDone ? 'text-[#1f9d6b]' : 'text-muted-foreground')}>
            {timeDone ? <CircleCheck className="size-3.5" aria-hidden="true" /> : <Clock className="size-3.5" aria-hidden="true" />}
            阅读满 {MIN_READ_SECONDS} 秒
          </span>
          <span className={cn('flex items-center gap-1', reachedBottom ? 'text-[#1f9d6b]' : 'text-muted-foreground')}>
            <CircleCheck className="size-3.5" aria-hidden="true" />
            滑动至底部
          </span>
        </div>
        <button
          type="button"
          disabled={!canAgree}
          onClick={onAgree}
          aria-live="polite"
          className={cn(
            'h-11 w-full rounded-full text-[15px] font-semibold transition-colors',
            canAgree ? 'bg-primary text-primary-foreground' : 'bg-[#e3e8f1] text-[#a9b3c6]',
          )}
        >
          {buttonLabel}
        </button>
      </div>
      )}
    </SubPage>
  )
}
