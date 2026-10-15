'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { genderLabel, relations, type Examinee, type Gender } from '@/components/mini/checkout-data'
import { cn } from '@/lib/utils'

type Props = {
  hasSelf: boolean
  targetName?: string
  onBack: () => void
  onSave: (e: Examinee) => void
}

type Errors = Partial<Record<'relation' | 'name' | 'birth' | 'phone' | 'idCard', string>>

const ageFrom = (birth: string) => {
  const b = new Date(birth)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--
  return age
}

export function ExamineeFormScreen({ hasSelf, targetName, onBack, onSave }: Props) {
  const [relation, setRelation] = useState<string>('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [birth, setBirth] = useState('')
  const [phone, setPhone] = useState('')
  const [idCard, setIdCard] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  const today = new Date().toISOString().slice(0, 10)

  const save = () => {
    const next: Errors = {}
    if (!relation) next.relation = '请选择与本人关系'
    if (!/^[\u4e00-\u9fa5·a-zA-Z]{2,20}$/.test(name.trim())) next.name = '请填写 2–20 位真实姓名'
    if (!birth || birth > today) next.birth = '请选择正确的出生日期'
    if (phone && !/^1\d{10}$/.test(phone)) next.phone = '请输入 11 位手机号'
    if (idCard && !/^\d{17}[\dXx]$/.test(idCard)) next.idCard = '请输入 18 位身份证号'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({
      id: `m-${Date.now()}`,
      name: name.trim(),
      relation,
      gender,
      age: ageFrom(birth),
      phone: phone ? `${phone.slice(0, 3)}****${phone.slice(7)}` : undefined,
    })
  }

  const clear = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined }))

  return (
    <SubPage title="添加受检人" titleId="examinee-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        {targetName && (
          <p className="mb-2.5 rounded-xl bg-[#eef5ff] px-3 py-2 text-[12px] leading-[18px] text-primary">
            保存后将自动为该受检人选择「{targetName}」
          </p>
        )}

        <section aria-labelledby="relation-title" className="rounded-2xl bg-white p-3.5">
          <h2 id="relation-title" className="text-[14px] font-semibold text-foreground">
            与本人关系
            <span className="ml-0.5 text-[#e5603a]" aria-hidden="true">
              *
            </span>
          </h2>
          <div role="radiogroup" aria-labelledby="relation-title" className="mt-2.5 flex flex-wrap gap-2">
            {relations.map((r) => {
              const disabled = r === '本人' && hasSelf
              const on = relation === r
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={disabled}
                  onClick={() => {
                    setRelation(r)
                    clear('relation')
                  }}
                  className={cn(
                    'h-8 min-w-[56px] rounded-full border px-3.5 text-[13px] transition-colors disabled:opacity-40',
                    on ? 'border-primary bg-[#eef5ff] font-medium text-primary' : 'border-border bg-white text-foreground',
                  )}
                >
                  {r}
                </button>
              )
            })}
          </div>
          {hasSelf && <p className="mt-2 text-[11px] text-muted-foreground">「本人」已存在，每个账号仅可添加一位本人</p>}
          <FieldError msg={errors.relation} />
        </section>

        <section aria-label="基本信息" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <Row label="姓名" required error={errors.name}>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 20))
                clear('name')
              }}
              placeholder="请输入真实姓名"
              aria-invalid={!!errors.name}
              className="min-w-0 flex-1 bg-transparent text-right text-[14px] text-foreground outline-none placeholder:text-[#a9b3c6]"
            />
          </Row>
          <Row label="性别" required>
            <div role="radiogroup" aria-label="性别" className="ml-auto flex rounded-full bg-[#f2f5fa] p-0.5">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={gender === g}
                  onClick={() => setGender(g)}
                  className={cn(
                    'h-7 w-12 rounded-full text-[13px] transition-colors',
                    gender === g ? 'bg-white font-medium text-primary shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  {genderLabel[g]}
                </button>
              ))}
            </div>
          </Row>
          <Row label="出生日期" required error={errors.birth}>
            <input
              type="date"
              value={birth}
              max={today}
              onChange={(e) => {
                setBirth(e.target.value)
                clear('birth')
              }}
              aria-invalid={!!errors.birth}
              className={cn(
                'min-w-0 flex-1 bg-transparent text-right text-[14px] outline-none',
                birth ? 'text-foreground' : 'text-[#a9b3c6]',
              )}
            />
          </Row>
          <Row label="手机号" error={errors.phone}>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                clear('phone')
              }}
              placeholder="选填，用于报告通知"
              aria-invalid={!!errors.phone}
              className="min-w-0 flex-1 bg-transparent text-right text-[14px] tabular-nums text-foreground outline-none placeholder:text-[#a9b3c6]"
            />
          </Row>
          <Row label="身份证号" error={errors.idCard} last>
            <input
              value={idCard}
              onChange={(e) => {
                setIdCard(e.target.value.replace(/[^\dXx]/g, '').slice(0, 18).toUpperCase())
                clear('idCard')
              }}
              placeholder="选填，用于报告实名归档"
              aria-invalid={!!errors.idCard}
              className="min-w-0 flex-1 bg-transparent text-right text-[14px] tabular-nums text-foreground outline-none placeholder:text-[#a9b3c6]"
            />
          </Row>
        </section>

        <p className="mt-3 flex items-start gap-1.5 px-1 text-[11px] leading-[18px] text-muted-foreground">
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
          受检人信息仅用于样本登记与报告归档，加密存储，不会向第三方披露。未成年人需由监护人代为添加。
        </p>
      </div>

      <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <button
          type="button"
          onClick={save}
          className="h-10 w-full rounded-full bg-primary text-[14px] font-medium text-primary-foreground active:opacity-90"
        >
          保存受检人
        </button>
      </div>
    </SubPage>
  )
}

function Row({
  label,
  required,
  error,
  last,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn('py-1', !last && 'border-b border-border')}>
      <label className="flex h-11 items-center gap-3">
        <span className="w-[68px] shrink-0 text-[14px] text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-[#e5603a]" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {children}
      </label>
      <FieldError msg={error} align="right" />
    </div>
  )
}

function FieldError({ msg, align }: { msg?: string; align?: 'right' }) {
  if (!msg) return null
  return (
    <p role="alert" className={cn('pb-1.5 text-[11px] text-[#e5603a]', align === 'right' ? 'text-right' : 'mt-1.5')}>
      {msg}
    </p>
  )
}
