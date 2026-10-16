'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { initialExaminees } from '@/components/mini/checkout-data'
import { cn } from '@/lib/utils'

export type AccountView = 'main' | 'phone' | 'deactivate'

const maskPhone = (phone: string) => phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')

type SmsKey = 'reminder' | 'report' | 'logistics' | 'marketing'

const smsOptions: { key: SmsKey; title: string; desc: string }[] = [
  { key: 'reminder', title: '用药提醒短信', desc: '到达设定服药时间时发送短信提醒' },
  { key: 'report', title: '报告出具通知', desc: '检测报告出具后第一时间通知' },
  { key: 'logistics', title: '订单与样本进度', desc: '采样盒发货、样本签收、重采样等通知' },
  { key: 'marketing', title: '优惠活动推送', desc: '新品上线、优惠券发放等活动信息' },
]

function Toggle({ checked, onChange, labelledBy }: { checked: boolean; onChange: () => void; labelledBy: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
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

function Row({
  label,
  value,
  onClick,
  danger,
}: {
  label: string
  value?: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex min-h-12 w-full items-center gap-2 px-3.5 py-3 text-left">
        <span className={cn('flex-1 text-[14px]', danger ? 'text-[#e5603a]' : 'text-foreground')}>{label}</span>
        {value && <span className="text-[13px] text-muted-foreground">{value}</span>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  )
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mt-2.5" aria-label={title}>
      {title && <h2 className="px-1.5 pb-1.5 text-[12px] text-muted-foreground">{title}</h2>}
      <ul className="divide-y divide-[#eef1f6] rounded-2xl bg-white">{children}</ul>
    </section>
  )
}

function useCountdown() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])
  return [seconds, () => setSeconds(60)] as const
}

function CodeInput({
  id,
  code,
  onCode,
  canSend,
  onSent,
}: {
  id: string
  code: string
  onCode: (v: string) => void
  canSend: boolean
  onSent?: () => void
}) {
  const [seconds, start] = useCountdown()
  return (
    <div className="flex items-center gap-2 px-3.5 py-3">
      <label htmlFor={id} className="w-16 shrink-0 text-[14px] text-foreground">
        验证码
      </label>
      <input
        id={id}
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => onCode(e.target.value.replace(/\D/g, ''))}
        placeholder="6 位短信验证码"
        className="min-w-0 flex-1 bg-transparent text-[14px] tabular-nums outline-none placeholder:text-muted-foreground/70"
      />
      <button
        type="button"
        disabled={!canSend || seconds > 0}
        onClick={() => {
          start()
          onSent?.()
        }}
        className="shrink-0 text-[13px] font-medium text-primary disabled:text-muted-foreground"
      >
        {seconds > 0 ? <span className="tabular-nums">{seconds}s 后重发</span> : '获取验证码'}
      </button>
    </div>
  )
}

function ConfirmDialog({
  id,
  icon,
  title,
  desc,
  confirm,
  onConfirm,
  onCancel,
}: {
  id: string
  icon: React.ReactNode
  title: string
  desc: string
  confirm: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-8">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        className="w-full rounded-2xl bg-white px-5 pb-4 pt-5 text-center motion-safe:animate-in motion-safe:zoom-in-95"
      >
        <span
          className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#fdecea] text-[#e5603a]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <h2 id={`${id}-title`} className="mt-3 text-[16px] font-semibold text-foreground">
          {title}
        </h2>
        <p id={`${id}-desc`} className="mt-2 text-[13px] leading-5 text-muted-foreground">
          {desc}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-full bg-[#f1f4f9] text-[14px] font-medium text-foreground"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-full bg-[#e5603a] text-[14px] font-medium text-white"
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-1/2 z-50 flex justify-center px-10 motion-safe:animate-in motion-safe:fade-in"
    >
      <span className="flex items-center gap-1.5 rounded-xl bg-black/75 px-4 py-2.5 text-[13px] text-white">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        {message}
      </span>
    </div>
  )
}

function MainView({
  nickname,
  phone,
  onEditNickname,
  onPhone,
  onDeactivate,
  onLogout,
}: {
  nickname: string
  phone: string
  onEditNickname: () => void
  onPhone: () => void
  onDeactivate: () => void
  onLogout: () => void
}) {
  const [sms, setSms] = useState<Record<SmsKey, boolean>>({
    reminder: true,
    report: true,
    logistics: true,
    marketing: false,
  })

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-8 pt-1 [scrollbar-width:none]">
      <Card title="个人资料">
        <li>
          <button type="button" className="flex w-full items-center gap-2 px-3.5 py-3 text-left">
            <span className="flex-1 text-[14px] text-foreground">头像</span>
            <span className="relative flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserRound className="size-6" aria-hidden="true" />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Camera className="size-3" aria-hidden="true" />
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">更换头像（使用微信头像或从相册选择）</span>
          </button>
        </li>
        <Row label="昵称" value={nickname} onClick={onEditNickname} />
        <Row label="绑定手机号" value={<span className="tabular-nums">{maskPhone(phone)}</span>} onClick={onPhone} />
      </Card>

      <section className="mt-2.5" aria-labelledby="sms-settings-title">
        <div className="flex items-center justify-between px-1.5 pb-1.5">
          <h2 id="sms-settings-title" className="text-[12px] text-muted-foreground">
            短信通知
          </h2>
          <span className="text-[11px] text-muted-foreground">
            发送至 <span className="tabular-nums">{maskPhone(phone)}</span>
          </span>
        </div>
        <ul className="divide-y divide-[#eef1f6] rounded-2xl bg-white">
          {smsOptions.map((o) => (
            <li key={o.key} className="flex items-center gap-3 px-3.5 py-3">
              <span className="min-w-0 flex-1">
                <span id={`sms-${o.key}`} className="block text-[14px] text-foreground">
                  {o.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{o.desc}</span>
              </span>
              <Toggle
                checked={sms[o.key]}
                labelledBy={`sms-${o.key}`}
                onChange={() => setSms((s) => ({ ...s, [o.key]: !s[o.key] }))}
              />
            </li>
          ))}
        </ul>
        {!sms.reminder && (
          <p className="mt-1.5 flex items-start gap-1 px-1.5 text-[11px] leading-4 text-[#c27a12]">
            <AlertTriangle className="mt-px size-3 shrink-0" aria-hidden="true" />
            已关闭用药提醒短信，到点将不再通知，可能影响按时服药。
          </p>
        )}
      </section>

      <Card title="隐私与协议">
        <Row label="用户服务协议" />
          <Row label="隐私政策" />
      </Card>

      <Card title="其他">
        <Row label="清除缓存" value="12.6 MB" />
        <Row label="注销账号" onClick={onDeactivate} danger />
      </Card>

      <button
        type="button"
        onClick={onLogout}
        className="mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-[15px] font-medium text-[#e5603a]"
      >
        <LogOut className="size-4" aria-hidden="true" />
        退出登录
      </button>
    </div>
  )
}

function PhoneView({ phone, onDone }: { phone: string; onDone: (newPhone: string) => void }) {
  const [step, setStep] = useState<'verify' | 'bind'>('verify')
  const [oldCode, setOldCode] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newCode, setNewCode] = useState('')
  const phoneValid = /^1[3-9]\d{9}$/.test(newPhone) && newPhone !== phone

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:none]">
      <ol className="flex items-center gap-2 px-1 text-[12px]" aria-label="更换步骤">
        {['验证原手机号', '绑定新手机号'].map((s, i) => {
          const active = (step === 'verify' ? 0 : 1) >= i
          return (
            <li key={s} className="flex flex-1 items-center gap-1.5" aria-current={active ? 'step' : undefined}>
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-[11px] font-medium tabular-nums',
                  active ? 'bg-primary text-primary-foreground' : 'bg-[#e3e8f0] text-muted-foreground',
                )}
              >
                {step === 'bind' && i === 0 ? <Check className="size-3" aria-hidden="true" /> : i + 1}
              </span>
              <span className={active ? 'text-foreground' : 'text-muted-foreground'}>{s}</span>
              {i === 0 && <span className="h-px flex-1 bg-[#dbe2ec]" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#e8f1ff] text-primary">
          <Smartphone className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {step === 'verify' ? '当前绑定手机号' : '请输入要绑定的新手机号'}
        </p>
        {step === 'verify' && (
          <p className="mt-0.5 text-[20px] font-semibold tabular-nums text-foreground">{maskPhone(phone)}</p>
        )}
      </div>

      <div className="mt-4 divide-y divide-[#eef1f6] rounded-2xl bg-white">
        {step === 'verify' ? (
          <CodeInput id="old-code" code={oldCode} onCode={setOldCode} canSend />
        ) : (
          <>
            <div className="flex items-center gap-2 px-3.5 py-3">
              <label htmlFor="new-phone" className="w-16 shrink-0 text-[14px] text-foreground">
                新手机号
              </label>
              <input
                id="new-phone"
                inputMode="numeric"
                maxLength={11}
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入 11 位手机号"
                className="min-w-0 flex-1 bg-transparent text-[14px] tabular-nums outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <CodeInput id="new-code" code={newCode} onCode={setNewCode} canSend={phoneValid} />
          </>
        )}
      </div>
      {step === 'bind' && newPhone.length === 11 && newPhone === phone && (
        <p className="mt-1.5 px-1.5 text-[11px] text-[#e5603a]">新手机号不能与当前手机号相同</p>
      )}

      <ul className="mt-3 space-y-1 px-1.5 text-[11px] leading-4 text-muted-foreground">
        <li>· 更换后，登录账号、短信通知（用药提醒、报告出具等）将使用新手机号</li>
        <li>· 检测人信息中填写的手机号不会自动变更，可在检测人管理中修改</li>
        <li>· 原手机号无法接收验证码？请联系客服人工处理</li>
      </ul>

      <button
        type="button"
        disabled={step === 'verify' ? oldCode.length !== 6 : !phoneValid || newCode.length !== 6}
        onClick={() => (step === 'verify' ? setStep('bind') : onDone(newPhone))}
        className="mt-auto h-11 w-full shrink-0 rounded-full bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-40"
      >
        {step === 'verify' ? '下一步' : '确认更换'}
      </button>
    </div>
  )
}

const deactivateNotices = [
  '账号内的检测人、收货地址、用药提醒、健康档案等个人信息将被永久删除，无法恢复',
  '历史检测报告将无法在小程序内查看，请提前下载保存',
  '未使用的优惠券将作废，已授权的科研知情同意将同步撤回',
  '存在待付款、待采样、检测中或售后处理中的订单时，暂不可注销',
]

function DeactivateView({ phone, onSubmitted }: { phone: string; onSubmitted: () => void }) {
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:none]">
      <div className="flex items-start gap-2.5 rounded-2xl bg-[#fff4e5] p-3.5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#c27a12]" aria-hidden="true" />
        <div>
          <p className="text-[14px] font-semibold text-[#8a5410]">注销账号是不可恢复的操作</p>
          <p className="mt-0.5 text-[12px] leading-[18px] text-[#8a5410]/80">
            提交后进入 7 天冷静期，期间重新登录即可撤销注销申请。
          </p>
        </div>
      </div>

      <section aria-labelledby="deactivate-notice" className="mt-2.5 rounded-2xl bg-white p-3.5">
        <h2 id="deactivate-notice" className="text-[14px] font-semibold text-foreground">
          注销后你将失去
        </h2>
        <ul className="mt-2 space-y-2">
          {deactivateNotices.map((n, i) => (
            <li key={n} className="flex gap-2 text-[12px] leading-[18px] text-muted-foreground">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#f1f4f9] text-[10px] tabular-nums text-foreground">
                {i + 1}
              </span>
              {n}
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#eefaf3] px-3 py-2 text-[12px] text-[#1f8a55]">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          已检测：当前无进行中的订单，可以注销
        </p>
      </section>

      <section aria-label="身份验证" className="mt-2.5 rounded-2xl bg-white">
        <p className="px-3.5 pt-3 text-[12px] text-muted-foreground">
          验证码将发送至 <span className="tabular-nums text-foreground">{maskPhone(phone)}</span>
        </p>
        <CodeInput id="deactivate-code" code={code} onCode={setCode} canSend />
      </section>

      <label className="mt-3 flex items-start gap-2 px-1.5 text-[12px] leading-[18px] text-muted-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
        />
        <span>
          我已阅读并同意 <span className="text-primary">《账号注销须知》</span>，知晓注销后数据无法恢复
        </span>
      </label>

      <button
        type="button"
        disabled={!agreed || code.length !== 6}
        onClick={() => setConfirming(true)}
        className="mt-auto h-11 w-full shrink-0 rounded-full bg-[#e5603a] text-[15px] font-medium text-white disabled:opacity-40"
      >
        申请注销
      </button>

      {confirming && (
        <ConfirmDialog
          id="deactivate-confirm"
          icon={<AlertTriangle className="size-5" />}
          title="确定注销账号？"
          desc="7 天冷静期结束后账号及全部数据将被永久删除。"
          confirm="确认注销"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            onSubmitted()
          }}
        />
      )}
    </div>
  )
}

function NicknameSheet({ value, onSave, onClose }: { value: string; onSave: (v: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value)
  const trimmed = draft.trim()
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nickname-title"
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl bg-white px-4 pb-6 pt-4 motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <h2 id="nickname-title" className="text-center text-[16px] font-semibold text-foreground">
          修改昵称
        </h2>
        <label htmlFor="nickname-input" className="sr-only">
          昵称
        </label>
        <div className="mt-4 flex items-center rounded-xl bg-[#f4f6fa] px-3">
          <input
            id="nickname-input"
            type="nickname"
            value={draft}
            maxLength={16}
            onChange={(e) => setDraft(e.target.value)}
            className="h-11 min-w-0 flex-1 bg-transparent text-[14px] outline-none"
          />
          <span className="text-[11px] tabular-nums text-muted-foreground">{draft.length}/16</span>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">可使用微信昵称，昵称仅用于展示，不影响检测人信息</p>
        <button
          type="button"
          disabled={!trimmed || trimmed === value}
          onClick={() => onSave(trimmed)}
          className="mt-4 h-11 w-full rounded-full bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </div>
  )
}

export function AccountSettingsScreen({
  initialView = 'main',
  onBack,
}: {
  initialView?: AccountView
  onBack: () => void
}) {
  const self = initialExaminees[0]
  const [view, setView] = useState<AccountView>(initialView)
  const [nickname, setNickname] = useState(self.name)
  const [phone, setPhone] = useState(self.phone ?? '13812345678')
  const [editingNickname, setEditingNickname] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  const titles: Record<AccountView, string> = { main: '账号设置', phone: '更换手机号', deactivate: '注销账号' }

  return (
    <SubPage
      title={titles[view]}
      titleId="account-settings-title"
      onBack={() => (view === 'main' ? onBack() : setView('main'))}
    >
      {view === 'main' && (
        <MainView
          nickname={nickname}
          phone={phone}
          onEditNickname={() => setEditingNickname(true)}
          onPhone={() => setView('phone')}
          onDeactivate={() => setView('deactivate')}
          onLogout={() => setLogoutOpen(true)}
        />
      )}
      {view === 'phone' && (
        <PhoneView
          phone={phone}
          onDone={(p) => {
            setPhone(p)
            setView('main')
            setToast('手机号已更换')
          }}
        />
      )}
      {view === 'deactivate' && (
        <DeactivateView
          phone={phone}
          onSubmitted={() => {
            setView('main')
            setToast('注销申请已提交，7 天内登录可撤销')
          }}
        />
      )}

      {editingNickname && (
        <NicknameSheet
          value={nickname}
          onClose={() => setEditingNickname(false)}
          onSave={(v) => {
            setNickname(v)
            setEditingNickname(false)
            setToast('昵称已保存')
          }}
        />
      )}
      {logoutOpen && (
        <ConfirmDialog
          id="logout-confirm"
          icon={<LogOut className="size-5" />}
          title="确定退出登录？"
          desc="退出后将无法接收订单进度与用药提醒短信，再次使用需重新授权手机号登录。"
          confirm="退出登录"
          onCancel={() => setLogoutOpen(false)}
          onConfirm={() => {
            setLogoutOpen(false)
            setToast('已退出登录')
          }}
        />
      )}
      {toast && <Toast message={toast} />}
    </SubPage>
  )
}
