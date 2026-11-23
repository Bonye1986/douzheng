'use client'

import { useState } from 'react'
import { Check, ClipboardList, TriangleAlert } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import type { Survey, SurveyQuestion } from '@/components/mini/services-data'
import { cn } from '@/lib/utils'

export type SurveyAnswers = Record<string, string[] | string>

function isAnswered(q: SurveyQuestion, value: SurveyAnswers[string] | undefined) {
  if (q.optional) return true
  if (q.kind === 'text') return typeof value === 'string' && value.trim().length > 0
  return Array.isArray(value) && value.length > 0
}

function QuestionCard({
  index,
  question,
  value,
  onChange,
}: {
  index: number
  question: SurveyQuestion
  value: SurveyAnswers[string] | undefined
  onChange: (value: string[] | string) => void
}) {
  const titleId = `survey-q-${question.id}`
  const picked = Array.isArray(value) ? value : []

  return (
    <section aria-labelledby={titleId} className="rounded-2xl bg-white p-4">
      <h3 id={titleId} className="flex gap-1.5 text-body font-medium leading-snug text-foreground">
        <span className="tabular-nums text-primary">{index + 1}.</span>
        <span className="flex-1">
          {question.title}
          <span className="ml-1 text-caption font-normal text-muted-foreground">
            {question.kind === 'multi' ? '多选' : question.kind === 'single' ? '单选' : question.optional ? '选填' : '必填'}
          </span>
        </span>
      </h3>

      {question.kind === 'text' ? (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={200}
          rows={3}
          aria-labelledby={titleId}
          placeholder="请输入您的想法（200 字以内）"
          className="mt-3 w-full resize-none rounded-xl border border-border bg-[#f8fafd] p-3 text-note text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary"
        />
      ) : (
        <div
          role={question.kind === 'single' ? 'radiogroup' : 'group'}
          aria-labelledby={titleId}
          className="mt-3 flex flex-col gap-2"
        >
          {question.options?.map((o) => {
            const active = picked.includes(o.id)
            return (
              <button
                key={o.id}
                type="button"
                role={question.kind === 'single' ? 'radio' : 'checkbox'}
                aria-checked={active}
                onClick={() =>
                  onChange(
                    question.kind === 'single'
                      ? [o.id]
                      : active
                        ? picked.filter((id) => id !== o.id)
                        : [...picked, o.id],
                  )
                }
                className={cn(
                  'flex min-h-11 items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left text-note transition-colors',
                  active ? 'border-primary bg-secondary text-primary' : 'border-border bg-[#f8fafd] text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center border',
                    question.kind === 'single' ? 'rounded-full' : 'rounded',
                    active ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c5cfdf] bg-white',
                  )}
                  aria-hidden="true"
                >
                  {active && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="flex-1">{o.text}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

function LeaveSurveyDialog({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-8">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-survey-title"
        aria-describedby="leave-survey-desc"
        className="w-full rounded-2xl bg-white px-5 pb-4 pt-5 text-center motion-safe:animate-in motion-safe:zoom-in-95"
      >
        <span
          className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#fff4e5] text-[#f08c00]"
          aria-hidden="true"
        >
          <TriangleAlert className="size-5" />
        </span>
        <h2 id="leave-survey-title" className="mt-3 text-title font-semibold text-foreground">
          确定离开问卷？
        </h2>
        <p id="leave-survey-desc" className="mt-2 text-note leading-5 text-muted-foreground">
          退出后已填写内容将不保存
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={onStay}
            className="h-10 rounded-full bg-muted text-body font-medium text-foreground"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="h-10 rounded-full bg-primary text-body font-medium text-primary-foreground"
          >
            确认离开
          </button>
        </div>
      </div>
    </div>
  )
}

export function SurveyScreen({
  survey,
  onBack,
  onSubmit,
}: {
  survey: Survey
  onBack: () => void
  onSubmit: (answers: SurveyAnswers) => void
}) {
  const [answers, setAnswers] = useState<SurveyAnswers>({})

  const required = survey.questions.filter((q) => !q.optional)
  const done = required.filter((q) => isAnswered(q, answers[q.id])).length
  const remaining = required.length - done
  const progress = required.length ? Math.round((done / required.length) * 100) : 100
  const [confirmLeave, setConfirmLeave] = useState(false)
  const hasDraft = Object.values(answers).some((v) => (Array.isArray(v) ? v.length > 0 : v.trim() !== ''))

  const handleBack = () => {
    if (hasDraft) setConfirmLeave(true)
    else onBack()
  }

  return (
    <SubPage title="问卷调查" titleId="survey-title" onBack={handleBack}>
      {confirmLeave && <LeaveSurveyDialog onStay={() => setConfirmLeave(false)} onLeave={onBack} />}
          <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3 [scrollbar-width:none]">
            <header className="rounded-2xl bg-gradient-to-br from-[#3f7ee8] to-[#5b9bf5] p-4 text-white">
              <p className="flex items-center gap-1.5 text-title font-semibold">
                <ClipboardList className="size-4" aria-hidden="true" />
                {survey.title}
              </p>
              <p className="mt-1 text-caption leading-relaxed text-white/85">{survey.intro}</p>
              <div className="mt-3 flex items-center gap-3 text-caption text-white/85">
                <span>共 {survey.questions.length} 题</span>
              </div>
              <div
                role="progressbar"
                aria-label="答题进度"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25"
              >
                <div className="h-full rounded-full bg-white transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </header>

            <div className="mt-3 flex flex-col gap-2.5">
              {survey.questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  index={i}
                  question={q}
                  value={answers[q.id]}
                  onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
                />
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-border bg-white px-3 pb-6 pt-2.5">
            <button
              type="button"
              disabled={remaining > 0}
              onClick={() => onSubmit(answers)}
              className="flex h-10 w-full items-center justify-center rounded-full bg-primary text-body font-medium text-primary-foreground transition-opacity disabled:opacity-45"
            >
              {remaining > 0 ? `还有 ${remaining} 题未作答` : '提交问卷'}
            </button>
          </div>
    </SubPage>
  )
}
