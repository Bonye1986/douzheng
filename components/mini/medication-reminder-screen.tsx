'use client'

import { useEffect, useState } from 'react'
import {
  AlarmClock,
  BellOff,
  Camera,
  Clock,
  MessageSquareText,
  PencilLine,
  Pill,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { DrugScanSheet, type DrugScanResult } from '@/components/mini/drug-scan-sheet'
import { initialExaminees } from '@/components/mini/checkout-data'
import { cn } from '@/lib/utils'

export type ReminderView = 'list' | 'add' | 'scan' | 'edit' | 'delete' | 'empty'

type Frequency = '每天' | '隔天' | '每周'
type Meal = '饭前' | '饭后' | '随餐' | '睡前' | '不限'
type Unit = '片' | '粒' | '袋' | 'mg' | 'ml'
type Advance = 0 | 5 | 15 | 30

export type Reminder = {
  id: string
  memberId: string
  drug: string
  dose: string
  unit: Unit
  times: string[]
  frequency: Frequency
  weekdays: number[]
  meal: Meal
  startDate: string
  days: number | null
  phone: string
  advance: Advance
  note: string
  enabled: boolean
  geneTip?: string
}

const MAX_REMINDERS = 20
const MAX_TIMES = 6
const units: Unit[] = ['片', '粒', '袋', 'mg', 'ml']
const meals: Meal[] = ['饭前', '饭后', '随餐', '睡前', '不限']
const frequencies: Frequency[] = ['每天', '隔天', '每周']
const advances: Advance[] = [0, 5, 15, 30]
const weekdayNames = ['一', '二', '三', '四', '五', '六', '日']
const drugSuggestions = ['氯吡格雷', '阿托伐他汀', '华法林', '二甲双胍', '奥美拉唑']
const accountPhone = initialExaminees[0]?.phone ?? '138****6721'

const members = initialExaminees.map((e) => ({ id: e.id, name: e.name, relation: e.relation }))
const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? '本人'

const initialReminders: Reminder[] = [
  {
    id: 'r1',
    memberId: members[0]?.id ?? 'self',
    drug: '阿托伐他汀钙片',
    dose: '1',
    unit: '片',
    times: ['21:00'],
    frequency: '每天',
    weekdays: [],
    meal: '睡前',
    startDate: '2026-10-01',
    days: null,
    phone: accountPhone,
    advance: 0,
    note: '',
    enabled: true,
    geneTip: 'SLCO1B1 正常功能型，常规剂量即可',
  },
  {
    id: 'r2',
    memberId: members[1]?.id ?? members[0]?.id ?? 'self',
    drug: '氯吡格雷片',
    dose: '75',
    unit: 'mg',
    times: ['08:00'],
    frequency: '每天',
    weekdays: [],
    meal: '饭后',
    startDate: '2026-10-10',
    days: 30,
    phone: accountPhone,
    advance: 15,
    note: '和阿司匹林间隔 2 小时',
    enabled: true,
    geneTip: 'CYP2C19 中间代谢型，请遵医嘱评估疗效',
  },
  {
    id: 'r3',
    memberId: members[2]?.id ?? members[0]?.id ?? 'self',
    drug: '维生素 D3 滴剂',
    dose: '1',
    unit: '粒',
    times: ['09:00'],
    frequency: '每周',
    weekdays: [1, 3, 5],
    meal: '随餐',
    startDate: '2026-09-20',
    days: 60,
    phone: '139****2048',
    advance: 5,
    note: '',
    enabled: false,
  },
]

const scheduleText = (r: Reminder) => {
  if (r.frequency === '每周') return `每周${r.weekdays.map((d) => weekdayNames[d - 1]).join('、')}`
  return r.frequency
}
const courseText = (r: Reminder) => (r.days ? `${r.startDate} 起 · ${r.days} 天` : `${r.startDate} 起 · 长期`)
const advanceText = (a: Advance) => (a === 0 ? '准时' : `提前 ${a} 分钟`)

type Props = {
  onBack: () => void
  initialView?: ReminderView
}

export function MedicationReminderScreen({ onBack, initialView = 'list' }: Props) {
  const [list, setList] = useState<Reminder[]>(initialView === 'empty' ? [] : initialReminders)
  const [form, setForm] = useState<{ target?: Reminder } | null>(
    initialView === 'add' || initialView === 'scan' ? {} : initialView === 'edit' ? { target: initialReminders[1] } : null,
  )
  const [pendingDelete, setPendingDelete] = useState<Reminder | null>(
    initialView === 'delete' ? initialReminders[1] : null,
  )
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const full = list.length >= MAX_REMINDERS

  const openAdd = () => {
    if (full) return setToast(`最多设置 ${MAX_REMINDERS} 条提醒`)
    setForm({})
  }

  const save = (r: Reminder) => {
    const exists = list.some((m) => m.id === r.id)
    setList(exists ? list.map((m) => (m.id === r.id ? r : m)) : [r, ...list])
    setForm(null)
    setToast(exists ? '修改已保存' : '提醒已开启')
  }

  const toggle = (id: string) => {
    const target = list.find((r) => r.id === id)
    setList((l) => l.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
    setToast(target?.enabled ? '已暂停短信提醒' : '已开启短信提醒')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    setList((l) => l.filter((r) => r.id !== pendingDelete.id))
    setPendingDelete(null)
    setToast('已删除')
  }

  return (
    <SubPage title="用药提醒" titleId="medication-reminder-title" onBack={onBack}>
      {list.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
            <ul className="flex flex-col gap-2.5">
              {list.map((r) => (
                <li key={r.id} className={cn('rounded-2xl bg-white p-3.5', !r.enabled && 'opacity-75')}>
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                        r.enabled ? 'bg-secondary text-primary' : 'bg-[#eef1f5] text-muted-foreground',
                      )}
                      aria-hidden="true"
                    >
                      <Pill className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span className="text-title font-semibold text-foreground">{r.drug}</span>
                        <span className="rounded bg-secondary px-1.5 py-px text-caption text-primary">
                          {memberName(r.memberId)}
                        </span>
                      </p>
                      <p className="mt-1 text-caption text-muted-foreground">
                        每次 {r.dose} {r.unit} · {r.meal} · {scheduleText(r)}
                      </p>
                    </div>
                    <Switch
                      checked={r.enabled}
                      onChange={() => toggle(r.id)}
                      label={`${r.drug}短信提醒${r.enabled ? '已开启' : '已暂停'}`}
                    />
                  </div>

                  <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="服用时间">
                    {r.times.map((t) => (
                      <li
                        key={t}
                        className={cn(
                          'flex h-7 items-center gap-1 rounded-full px-2.5 text-note font-medium tabular-nums',
                          r.enabled ? 'bg-background text-foreground' : 'bg-[#f4f6f9] text-muted-foreground',
                        )}
                      >
                        <Clock className="size-3.5 text-primary" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>

                  {r.geneTip && (
                    <p className="mt-2 rounded-lg bg-[#f0f7ff] px-2.5 py-1.5 text-caption leading-4 text-primary">
                      基因提示：{r.geneTip}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="min-w-0 truncate text-caption text-muted-foreground">
                      {r.enabled ? (
                        <>
                          {advanceText(r.advance)}短信 · <span className="tabular-nums">{courseText(r)}</span>
                        </>
                      ) : (
                        '已暂停，不发送短信'
                      )}
                    </span>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingDelete(r)}
                        className="flex h-7 items-center gap-1 rounded-full border border-border px-3 text-caption text-foreground"
                        aria-label={`删除 ${r.drug} 的提醒`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        删除
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ target: r })}
                        className="flex h-7 items-center gap-1 rounded-full border border-primary px-3 text-caption text-primary"
                        aria-label={`编辑 ${r.drug} 的提醒`}
                      >
                        <PencilLine className="size-3.5" aria-hidden="true" />
                        编辑
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-3 flex items-start gap-1.5 px-1 text-caption leading-[18px] text-muted-foreground">
              <ShieldCheck className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
              提醒仅作辅助，请遵医嘱用药；短信免费发送，疗程结束后自动停止。
            </p>
          </div>

          <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
            <button
              type="button"
              onClick={openAdd}
              aria-disabled={full}
              className={cn(
                'flex h-10 w-full items-center justify-center gap-1 rounded-full text-body font-medium',
                full ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground active:opacity-90',
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              添加用药提醒
            </button>
          </div>
        </>
      )}

      {pendingDelete && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-8">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-reminder-title"
            aria-describedby="delete-reminder-desc"
            className="w-full rounded-2xl bg-white px-5 pb-4 pt-5 text-center motion-safe:animate-in motion-safe:zoom-in-95"
          >
            <span
              className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive-soft text-destructive"
              aria-hidden="true"
            >
              <Trash2 className="size-5" />
            </span>
            <h2 id="delete-reminder-title" className="mt-3 text-title font-semibold text-foreground">
              确定删除该提醒？
            </h2>
            <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-left text-caption leading-[18px] text-foreground">
              {pendingDelete.drug} · {memberName(pendingDelete.memberId)}
              <br />
              <span className="text-muted-foreground">
                {scheduleText(pendingDelete)} <span className="tabular-nums">{pendingDelete.times.join('、')}</span>
              </span>
            </p>
            <p id="delete-reminder-desc" className="mt-2 text-note leading-5 text-muted-foreground">
              删除后将不再向 <span className="tabular-nums">{pendingDelete.phone}</span> 发送短信，且不可恢复。仅想暂停可关闭开关。
            </p>
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="h-10 flex-1 rounded-full border border-border text-body text-foreground"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="h-10 flex-1 rounded-full bg-destructive text-body font-medium text-white"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {form && (
        <ReminderFormScreen
          initial={form.target}
          initialScanOpen={initialView === 'scan' && !form.target}
          onBack={() => setForm(null)}
          onSave={save}
        />
      )}

      {toast && (
        <p
          role="status"
          className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/75 px-4 py-2 text-note text-white"
        >
          {toast}
        </p>
      )}
    </SubPage>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center px-8 pt-20 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-secondary" aria-hidden="true">
        <BellOff className="size-11 text-primary" strokeWidth={1.4} />
      </span>
      <h2 className="mt-5 text-title font-semibold text-foreground">还没有用药提醒</h2>
      <p className="mt-1.5 text-note leading-5 text-muted-foreground">
        为自己或家人设置服药时间，到点将通过短信提醒，不错过每一次用药。
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 flex h-10 items-center gap-1 rounded-full bg-primary px-8 text-body font-medium text-primary-foreground active:opacity-90"
      >
        <Plus className="size-4" aria-hidden="true" />
        添加用药提醒
      </button>
    </div>
  )
}

type Errors = Partial<Record<'drug' | 'dose' | 'times' | 'weekdays' | 'days' | 'phone', string>>

function ReminderFormScreen({
  initial,
  initialScanOpen = false,
  onBack,
  onSave,
}: {
  initial?: Reminder
  initialScanOpen?: boolean
  onBack: () => void
  onSave: (r: Reminder) => void
}) {
  const editing = !!initial
  const [memberId] = useState(initial?.memberId ?? members[0]?.id ?? 'self')
  const [drug, setDrug] = useState(initial?.drug ?? '')
  const [dose, setDose] = useState(initial?.dose ?? '1')
  const [unit, setUnit] = useState<Unit>(initial?.unit ?? '片')
  const [times, setTimes] = useState<string[]>(initial?.times ?? ['08:00'])
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? '每天')
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [])
  const [meal, setMeal] = useState<Meal>(initial?.meal ?? '饭后')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '2026-10-15')
  const [longTerm, setLongTerm] = useState(initial ? initial.days === null : false)
  const [days, setDays] = useState(String(initial?.days ?? 7))
  const [phone, setPhone] = useState(initial?.phone ?? accountPhone)
  const [advance, setAdvance] = useState<Advance>(initial?.advance ?? 0)
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [scanOpen, setScanOpen] = useState(initialScanOpen)
  const [scanned, setScanned] = useState<Set<ScanField>>(new Set())

  const clear = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined }))
  const unmark = (k: ScanField) =>
    setScanned((s) => {
      if (!s.has(k)) return s
      const n = new Set(s)
      n.delete(k)
      return n
    })

  const applyScan = (r: DrugScanResult) => {
    setDrug(r.drug)
    setDose(r.dose)
    setUnit(r.unit)
    setMeal(r.meal)
    if (times.length !== r.timesPerDay) {
      const presets = ['08:00', '12:00', '18:00', '21:00', '22:00', '23:00']
      setTimes(presets.slice(0, Math.min(MAX_TIMES, r.timesPerDay)))
    }
    if (!note.trim()) setNote(`规格 ${r.spec}；${r.usage}`.slice(0, 60))
    setScanned(new Set<ScanField>(['drug', 'dose', 'meal', 'times']))
    setErrors({})
    setScanOpen(false)
  }
  const masked = phone.includes('*')

  const setTime = (i: number, v: string) => {
    setTimes((t) => t.map((x, j) => (j === i ? v : x)))
    clear('times')
    unmark('times')
  }
  const addTime = () => {
    if (times.length >= MAX_TIMES) return
    const last = times[times.length - 1] ?? '08:00'
    const h = Math.min(23, Number(last.slice(0, 2)) + 4)
    setTimes([...times, `${String(h).padStart(2, '0')}:00`])
    clear('times')
  }

  const save = () => {
    const next: Errors = {}
    if (drug.trim().length < 2) next.drug = '请填写药品名称'
    if (!/^\d+(\.\d+)?$/.test(dose) || Number(dose) <= 0) next.dose = '请填写正确的剂量'
    if (!times.length) next.times = '至少设置 1 个服用时间'
    else if (new Set(times).size !== times.length) next.times = '服用时间不能重复'
    if (frequency === '每周' && !weekdays.length) next.weekdays = '请选择每周服用的日期'
    if (!longTerm && !(Number(days) >= 1 && Number(days) <= 365)) next.days = '疗程为 1–365 天'
    if (!masked && !/^1\d{10}$/.test(phone)) next.phone = '请输入 11 位手机号'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({
      id: initial?.id ?? `r-${Date.now()}`,
      memberId,
      drug: drug.trim(),
      dose,
      unit,
      times: [...times].sort(),
      frequency,
      weekdays: frequency === '每周' ? [...weekdays].sort() : [],
      meal,
      startDate,
      days: longTerm ? null : Number(days),
      phone: masked ? phone : `${phone.slice(0, 3)}****${phone.slice(7)}`,
      advance,
      note: note.trim(),
      enabled: initial?.enabled ?? true,
      geneTip: initial?.geneTip,
    })
  }

  return (
    <SubPage title={editing ? '编辑用药提醒' : '添加用药提醒'} titleId="reminder-form-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        <section aria-labelledby="reminder-drug-title" className="rounded-2xl bg-white p-3.5">
          <h2 id="reminder-drug-title" className="text-title font-semibold text-foreground">
            用药信息
          </h2>

          {scanned.size > 0 && (
            <p role="status" className="mt-2 flex items-start gap-1.5 rounded-lg bg-[#fff8e6] px-2.5 py-2 text-caption leading-relaxed text-[#8a5a00]">
              <Sparkles className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              已根据药盒照片自动填充，标记「识别」的内容请核对，如有误可直接修改
            </p>
          )}

          <div className="mt-3">
            <label htmlFor="reminder-drug-input" className="flex items-center text-caption text-muted-foreground">
              药品名称
              {scanned.has('drug') && <ScanBadge />}
            </label>
            <div className="relative mt-1.5">
              <input
                id="reminder-drug-input"
                value={drug}
                onChange={(e) => {
                  setDrug(e.target.value.slice(0, 30))
                  clear('drug')
                  unmark('drug')
                }}
                placeholder="请输入药品通用名或商品名"
                aria-invalid={!!errors.drug}
                className="h-10 w-full rounded-xl bg-muted pl-3 pr-11 text-body text-foreground outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setScanOpen(true)}
                aria-label={scanned.size ? '重新拍照识别药盒' : '拍照识别药盒'}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-primary"
              >
                <Camera className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <FieldError msg={errors.drug} />
          {!drug && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {drugSuggestions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDrug(d)}
                  className="h-6 rounded-full border border-border px-2.5 text-caption text-muted-foreground"
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3">
            <span id="reminder-dose-label" className="flex items-center text-caption text-muted-foreground">
              单次剂量
              {scanned.has('dose') && <ScanBadge />}
            </span>
            <div className="mt-1.5 flex gap-2">
              <input
                inputMode="decimal"
                value={dose}
                onChange={(e) => {
                  setDose(e.target.value.replace(/[^\d.]/g, '').slice(0, 6))
                  clear('dose')
                  unmark('dose')
                }}
                aria-labelledby="reminder-dose-label"
                aria-invalid={!!errors.dose}
                className="h-9 w-20 rounded-xl bg-muted px-3 text-center text-body tabular-nums text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
              <ChipGroup
                labelledBy="reminder-dose-label"
                items={units.map((u) => ({ value: u, label: u }))}
                value={unit}
                onChange={(u) => {
                  setUnit(u)
                  unmark('dose')
                }}
                className="mt-0 flex-1"
              />
            </div>
            <FieldError msg={errors.dose} />
          </div>

          <p id="reminder-meal-label" className="mt-3 flex items-center text-caption text-muted-foreground">
            服用要求
            {scanned.has('meal') && <ScanBadge />}
          </p>
          <ChipGroup
            labelledBy="reminder-meal-label"
            items={meals.map((m) => ({ value: m, label: m }))}
            value={meal}
            onChange={(m) => {
              setMeal(m)
              unmark('meal')
            }}
          />
        </section>

        <section aria-labelledby="reminder-plan-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <h2 id="reminder-plan-title" className="text-title font-semibold text-foreground">
            服用计划
          </h2>

          <p id="reminder-freq-label" className="mt-3 text-caption text-muted-foreground">
            用药频率
          </p>
          <ChipGroup
            labelledBy="reminder-freq-label"
            items={frequencies.map((f) => ({ value: f, label: f }))}
            value={frequency}
            onChange={(f) => {
              setFrequency(f)
              clear('weekdays')
            }}
          />
          {frequency === '每周' && (
            <>
              <div className="mt-2 grid grid-cols-7 gap-1.5" role="group" aria-label="每周服用日期">
                {weekdayNames.map((n, i) => {
                  const d = i + 1
                  const on = weekdays.includes(d)
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setWeekdays((w) => (on ? w.filter((x) => x !== d) : [...w, d]))
                        clear('weekdays')
                      }}
                      className={cn(
                        'h-8 rounded-lg text-caption',
                        on ? 'bg-primary font-medium text-primary-foreground' : 'bg-muted text-foreground',
                      )}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
              <FieldError msg={errors.weekdays} />
            </>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-caption text-muted-foreground">
              服用时间 <span className="tabular-nums">({times.length}/{MAX_TIMES})</span>
            </span>
            <button
              type="button"
              onClick={addTime}
              disabled={times.length >= MAX_TIMES}
              className="flex items-center gap-0.5 text-caption font-medium text-primary disabled:text-muted-foreground"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              添加时间
            </button>
          </div>
          <ul className="mt-1.5 grid grid-cols-3 gap-2">
            {times.map((t, i) => (
              <li key={i} className="relative">
                <input
                  type="time"
                  value={t}
                  onChange={(e) => setTime(i, e.target.value)}
                  aria-label={`第 ${i + 1} 次服用时间`}
                  className="h-9 w-full rounded-xl bg-secondary px-2 text-center text-body font-medium tabular-nums text-primary outline-none focus:ring-2 focus:ring-primary/30"
                />
                {times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTimes((x) => x.filter((_, j) => j !== i))}
                    aria-label={`移除 ${t}`}
                    className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-[#9aa5b8] text-white"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <FieldError msg={errors.times} />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-caption text-muted-foreground">开始日期</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 h-9 w-full rounded-xl bg-muted px-2.5 text-note tabular-nums text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="block">
              <span className="text-caption text-muted-foreground">疗程（天）</span>
              <input
                inputMode="numeric"
                value={longTerm ? '长期' : days}
                disabled={longTerm}
                onChange={(e) => {
                  setDays(e.target.value.replace(/\D/g, '').slice(0, 3))
                  clear('days')
                }}
                aria-invalid={!!errors.days}
                className="mt-1.5 h-9 w-full rounded-xl bg-muted px-2.5 text-note tabular-nums text-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:text-muted-foreground"
              />
            </label>
          </div>
          <FieldError msg={errors.days} />
          <div className="mt-2.5 flex items-center justify-between">
            <span id="reminder-longterm-label" className="text-note text-foreground">
              长期服用
            </span>
            <Switch
              checked={longTerm}
              onChange={() => {
                setLongTerm((v) => !v)
                clear('days')
              }}
              labelledBy="reminder-longterm-label"
            />
          </div>
        </section>

        <section aria-labelledby="reminder-sms-title" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <h2 id="reminder-sms-title" className="flex items-center gap-1.5 text-title font-semibold text-foreground">
            <MessageSquareText className="size-4 text-primary" aria-hidden="true" />
            短信通知
          </h2>
          <label className="mt-3 block">
            <span className="text-caption text-muted-foreground">接收手机号</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onFocus={() => masked && setPhone('')}
              onBlur={() => !phone && setPhone(initial?.phone ?? accountPhone)}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                clear('phone')
              }}
              aria-invalid={!!errors.phone}
              className="mt-1.5 h-10 w-full rounded-xl bg-muted px-3 text-body tabular-nums text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <FieldError msg={errors.phone} />
          <p id="reminder-advance-label" className="mt-3 text-caption text-muted-foreground">
            发送时间
          </p>
          <ChipGroup
            labelledBy="reminder-advance-label"
            items={advances.map((a) => ({ value: a, label: advanceText(a) }))}
            value={advance}
            onChange={setAdvance}
          />
        </section>

        <section aria-label="备注" className="mt-2.5 rounded-2xl bg-white p-3.5">
          <label className="block">
            <span className="text-caption text-muted-foreground">备注（选填）</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 40))}
              rows={2}
              placeholder="如：与其他药物间隔 2 小时"
              className="mt-1.5 w-full resize-none rounded-xl bg-muted px-3 py-2 text-note leading-5 text-foreground outline-none placeholder:text-faint focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </section>

        <p className="mt-3 flex items-start gap-1.5 px-1 text-caption leading-[18px] text-muted-foreground">
          <AlarmClock className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
          提醒仅作辅助，不替代医嘱；如需调整剂量请咨询医生或药师。
        </p>
      </div>

      <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <button
          type="button"
          onClick={save}
          className="h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
        >
          {editing ? '保存修改' : '保存并开启提醒'}
        </button>
      </div>

      {scanOpen && <DrugScanSheet onClose={() => setScanOpen(false)} onApply={applyScan} />}
    </SubPage>
  )
}

function ChipGroup<T extends string | number>({
  labelledBy,
  items,
  value,
  onChange,
  className,
}: {
  labelledBy: string
  items: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={cn('mt-1.5 flex flex-wrap gap-1.5', className)}>
      {items.map((i) => (
        <button
          key={String(i.value)}
          type="button"
          role="radio"
          aria-checked={value === i.value}
          onClick={() => onChange(i.value)}
          className={cn(
            'h-8 rounded-full border px-3 text-caption transition-colors',
            value === i.value ? 'border-primary bg-secondary font-medium text-primary' : 'border-border text-foreground',
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}

function Switch({
  checked,
  onChange,
  label,
  labelledBy,
}: {
  checked: boolean
  onChange: () => void
  label?: string
  labelledBy?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClick={onChange}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-[#d5dbe6]')}
    >
      <span
        className={cn(
          'absolute left-0 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

type ScanField = 'drug' | 'dose' | 'meal' | 'times'

function ScanBadge() {
  return (
    <span className="ml-1.5 inline-flex h-4 items-center gap-0.5 rounded bg-[#fff1cc] px-1 text-tag font-medium text-[#8a5a00]">
      <Sparkles className="size-3" aria-hidden="true" />
      识别
    </span>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="pt-1 text-caption text-destructive">
      {msg}
    </p>
  )
}
