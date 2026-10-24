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
  UserRound,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { LegalDocScreen, type LegalDocKind } from '@/components/mini/legal-doc-screen'
import { DEFAULT_NICKNAME, DefaultAvatar } from '@/components/mini/default-avatar'
import { genderLabel, initialExaminees, type Examinee, type Gender } from '@/components/mini/checkout-data'
import { ExamineeVerifyScreen } from '@/components/mini/examinee-verify-screen'
import { selfDraft, useSelfVerified, verifySharedSelf } from '@/components/mini/examinee-store'
import { cn } from '@/lib/utils'

export type AccountView = 'main' | 'deactivate' | 'verify'

const maskPhone = (phone: string) => phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')

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
        <span className={cn('flex-1 text-body', danger ? 'text-destructive' : 'text-foreground')}>{label}</span>
        {value && <span className="text-note text-muted-foreground">{value}</span>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
    </li>
  )
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mt-2.5" aria-label={title}>
      {title && <h2 className="px-1.5 pb-1.5 text-caption text-muted-foreground">{title}</h2>}
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
      <label htmlFor={id} className="w-16 shrink-0 text-body text-foreground">
        验证码
      </label>
      <input
        id={id}
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => onCode(e.target.value.replace(/\D/g, ''))}
        placeholder="6 位短信验证码"
        className="min-w-0 flex-1 bg-transparent text-body tabular-nums outline-none placeholder:text-muted-foreground/70"
      />
      <button
        type="button"
        disabled={!canSend || seconds > 0}
        onClick={() => {
          start()
          onSent?.()
        }}
        className="shrink-0 text-note font-medium text-primary disabled:text-muted-foreground"
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
          className="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive-soft text-destructive"
          aria-hidden="true"
        >
          {icon}
        </span>
        <h2 id={`${id}-title`} className="mt-3 text-title font-semibold text-foreground">
          {title}
        </h2>
        <p id={`${id}-desc`} className="mt-2 text-note leading-5 text-muted-foreground">
          {desc}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-full bg-muted text-body font-medium text-foreground"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-full bg-destructive text-body font-medium text-white"
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  )
}

function AvatarSheet({ onClose, onPick }: { onClose: () => void; onPick: (msg: string) => void }) {
  const options = ['使用微信头像', '拍照', '从手机相册选择']
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button type="button" aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="更换头像"
        className="relative overflow-hidden rounded-t-2xl bg-background pb-6 motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <ul className="divide-y divide-border bg-white">
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                onClick={() => onPick('头像已更新')}
                className="h-13 w-full text-center text-title text-foreground active:bg-muted"
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 h-13 w-full bg-white text-center text-title text-muted-foreground active:bg-muted"
        >
          取消
        </button>
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
      <span className="flex items-center gap-1.5 rounded-xl bg-black/75 px-4 py-2.5 text-note text-white">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        {message}
      </span>
    </div>
  )
}

export type Profile = { nickname: string; realName: string; gender: Gender | null; birth: string }
type ProfileField = 'nickname' | 'realName' | 'gender' | 'birth'

const formatBirth = (birth: string) => {
  const [y, m, d] = birth.split('-')
  return `${y}年${Number(m)}月${Number(d)}日`
}

function MainView({
  profile,
  phone,
  verified,
  onVerify,
  onEdit,
  onDeactivate,
  onLogout,
  onAvatar,
}: {
  verified: boolean
  onVerify: () => void
  onAvatar: () => void
  profile: Profile
  phone: string
  onEdit: (field: ProfileField) => void
  onDeactivate: () => void
  onLogout: () => void
}) {
  const [doc, setDoc] = useState<LegalDocKind | null>(null)
  return (
    <div className="flex-1 overflow-y-auto px-3 pb-8 pt-1 [scrollbar-width:none]">
      <Card title="个人资料">
        <li>
          <button type="button" onClick={onAvatar} className="flex w-full items-center gap-2 px-3.5 py-3 text-left">
            <span className="flex-1 text-body text-foreground">头像</span>
                <span className="relative flex size-11 items-center justify-center">
                  <DefaultAvatar className="size-11" />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Camera className="size-3" aria-hidden="true" />
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">更换头像（使用微信头像或从相册选择）</span>
          </button>
        </li>
        <Row label="昵称" value={profile.nickname} onClick={() => onEdit('nickname')} />
        <Row label="真实姓名" value={profile.realName || '未填写'} onClick={() => onEdit('realName')} />
        <Row label="性别" value={profile.gender ? genderLabel[profile.gender] : '未填写'} onClick={() => onEdit('gender')} />
        <Row
          label="出生日期"
          value={profile.birth ? <span className="tabular-nums">{formatBirth(profile.birth)}</span> : '未填写'}
          onClick={() => onEdit('birth')}
        />
        <li className="flex min-h-12 items-center gap-2 px-3.5 py-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-body text-foreground">绑定手机号</span>
            <span className="mt-0.5 text-caption text-muted-foreground">同步微信绑定手机号，不支持修改</span>
          </div>
          <span className="text-note tabular-nums text-muted-foreground">{maskPhone(phone)}</span>
        </li>
      </Card>

      <Card title="账号安全">
        <li>
          <button
            type="button"
            onClick={onVerify}
            className="flex min-h-12 w-full items-center gap-2 px-3.5 py-3 text-left"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body text-foreground">实名认证</span>
              <span className="mt-0.5 text-caption text-muted-foreground">
                {verified ? '本人已认证，身份信息已锁定' : '认证后可添加受检人、签署科研同意书'}
              </span>
            </span>
            {verified ? (
              <span className="flex items-center gap-0.5 rounded bg-success-soft px-1.5 py-px text-caption text-success">
                <ShieldCheck className="size-3" aria-hidden="true" />
                已认证
              </span>
            ) : (
              <span className="rounded bg-warning-soft px-1.5 py-px text-caption text-warning">未认证</span>
            )}
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </li>
      </Card>

      <Card title="隐私与协议">
        <Row label="用户服务协议" onClick={() => setDoc('terms')} />
        <Row label="隐私政策" onClick={() => setDoc('privacy')} />
      </Card>
      {doc && <LegalDocScreen kind={doc} onBack={() => setDoc(null)} />}

      <Card title="其他">
        <Row label="清除缓存" value="12.6 MB" />
        <Row label="注销账号" onClick={onDeactivate} danger />
      </Card>

      <button
        type="button"
        onClick={onLogout}
        className="mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-title font-medium text-destructive"
      >
        <LogOut className="size-4" aria-hidden="true" />
        退出登录
      </button>
    </div>
  )
}

const deactivateNotices = [
  '账号内的受检人、收货地址、用药提醒、健康档案等个人信息将被永久删除，无法恢复',
  '历史检测报告将无法在小程序内查看，请提前下载保存',
  '未使用的优惠券将作废，已授权的科研知情同意将同步撤回',
  '存在待付款、待采样、检测中或售后处理中的订单时，暂不可注销',
]

function DeactivateView({ onSubmitted }: { onSubmitted: () => void }) {
  const [agreed, setAgreed] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:none]">
      <div className="flex items-start gap-2.5 rounded-2xl bg-warning-soft p-3.5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="text-body font-semibold text-[#8a5410]">注销账号是不可恢复的操作</p>
          <p className="mt-0.5 text-caption leading-[18px] text-[#8a5410]/80">
            确认后将立即注销，账号及全部数据会被永久删除且无法撤销。
          </p>
        </div>
      </div>

      <section aria-labelledby="deactivate-notice" className="mt-2.5 rounded-2xl bg-white p-3.5">
        <h2 id="deactivate-notice" className="text-title font-semibold text-foreground">
          注销后你将失去
        </h2>
        <ul className="mt-2 space-y-2">
          {deactivateNotices.map((n, i) => (
            <li key={n} className="flex gap-2 text-caption leading-[18px] text-muted-foreground">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-tag tabular-nums text-foreground">
                {i + 1}
              </span>
              {n}
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#eefaf3] px-3 py-2 text-caption text-[#1f8a55]">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          已检测：当前无进行中的订单，可以注销
        </p>
      </section>

      <label className="mt-3 flex items-start gap-2 px-1.5 text-caption leading-[18px] text-muted-foreground">
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
        disabled={!agreed}
        onClick={() => setConfirming(true)}
        className="mt-auto h-11 w-full shrink-0 rounded-full bg-destructive text-title font-medium text-white disabled:opacity-40"
      >
        确认注销
      </button>

      {confirming && (
        <ConfirmDialog
          id="deactivate-confirm"
          icon={<AlertTriangle className="size-5" />}
          title="确定注销账号？"
          desc="注销将立即生效，账号及全部数据将被永久删除，无法恢复。"
          confirm="立即注销"
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

function BottomSheet({
  id,
  title,
  onClose,
  children,
}: {
  id: string
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl bg-white px-4 pb-6 pt-4 motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <h2 id={`${id}-title`} className="text-center text-title font-semibold text-foreground">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

function SaveButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-4 h-11 w-full rounded-full bg-primary text-title font-medium text-primary-foreground disabled:opacity-40"
    >
      保存
    </button>
  )
}

const textFields = {
  nickname: {
    title: '修改昵称',
    label: '昵称',
    maxLength: 16,
    type: 'nickname',
    placeholder: '请输入昵称',
    hint: '可使用微信昵称，昵称仅用于展示，不影响受检人信息',
  },
  realName: {
    title: '填写真实姓名',
    label: '真实姓名',
    maxLength: 20,
    type: 'text',
    placeholder: '请输入与身份证一致的姓名',
    hint: '用于检测报告与健康档案，请与身份证件保持一致',
  },
} as const

function TextSheet({
  field,
  value,
  onSave,
  onClose,
}: {
  field: keyof typeof textFields
  value: string
  onSave: (v: string) => void
  onClose: () => void
}) {
  const config = textFields[field]
  const [draft, setDraft] = useState(value)
  const trimmed = draft.trim()
  const inputId = `${field}-input`
  return (
    <BottomSheet id={field} title={config.title} onClose={onClose}>
      <label htmlFor={inputId} className="sr-only">
        {config.label}
      </label>
      <div className="mt-4 flex items-center rounded-xl bg-[#f4f6fa] px-3">
        <input
          id={inputId}
          type={config.type}
          value={draft}
          maxLength={config.maxLength}
          placeholder={config.placeholder}
          onChange={(e) => setDraft(e.target.value)}
          className="h-11 min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-muted-foreground/70"
        />
        <span className="text-caption tabular-nums text-muted-foreground">
          {draft.length}/{config.maxLength}
        </span>
      </div>
      <p className="mt-1.5 text-caption text-muted-foreground">{config.hint}</p>
      <SaveButton disabled={!trimmed || trimmed === value} onClick={() => onSave(trimmed)} />
    </BottomSheet>
  )
}

function GenderSheet({
  value,
  onSave,
  onClose,
}: {
  value: Gender | null
  onSave: (v: Gender) => void
  onClose: () => void
}) {
  return (
    <BottomSheet id="gender" title="选择性别" onClose={onClose}>
      <ul className="mt-3 divide-y divide-[#eef1f6]" role="radiogroup" aria-labelledby="gender-title">
        {(Object.keys(genderLabel) as Gender[]).map((g) => (
          <li key={g}>
            <button
              type="button"
              role="radio"
              aria-checked={value === g}
              onClick={() => onSave(g)}
              className="flex h-12 w-full items-center justify-between px-1 text-title text-foreground"
            >
              {genderLabel[g]}
              {value === g && <Check className="size-4.5 text-primary" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}

function BirthSheet({ value, onSave, onClose }: { value: string; onSave: (v: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value)
  const today = new Date().toISOString().slice(0, 10)
  return (
    <BottomSheet id="birth" title="选择出生日期" onClose={onClose}>
      <label htmlFor="birth-input" className="sr-only">
        出生日期
      </label>
      <input
        id="birth-input"
        type="date"
        value={draft}
        min="1900-01-01"
        max={today}
        onChange={(e) => setDraft(e.target.value)}
        className="mt-4 h-11 w-full rounded-xl bg-[#f4f6fa] px-3 text-body tabular-nums outline-none"
      />
      <p className="mt-1.5 text-caption text-muted-foreground">用于计算年龄及剂量相关指标，请如实填写</p>
      <SaveButton disabled={!draft || draft === value || draft > today} onClick={() => onSave(draft)} />
    </BottomSheet>
  )
}

export function AccountSettingsScreen({
  initialView = 'main',
  onBack,
  verified: verifiedOverride,
  onVerified,
}: {
  initialView?: AccountView
  onBack: () => void
  /** 由调用方（如独立演示的受检人列表）提供实名状态；缺省读取共享数据 */
  verified?: boolean
  /** 实名认证成功回调；缺省写入共享受检人列表 */
  onVerified?: (self: Examinee) => void
}) {
  const self = initialExaminees[0]
  const sharedVerified = useSelfVerified()
  const verified = verifiedOverride ?? sharedVerified
  const [view, setView] = useState<AccountView>(initialView)
  const verifyOnly = initialView === 'verify'
  const [profile, setProfile] = useState<Profile>({
    nickname: DEFAULT_NICKNAME,
    realName: self.name,
    gender: self.gender,
    birth: self.birth ?? '',
  })
  const [phone] = useState(self.phone ?? '13812345678')
  const [editing, setEditing] = useState<ProfileField | null>(null)

  const saveProfile = <K extends ProfileField>(field: K, value: Profile[K]) => {
    setProfile((p) => ({ ...p, [field]: value }))
    setEditing(null)
    setToast('已保存')
  }
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  const titles: Record<AccountView, string> = { main: '账号设置', deactivate: '注销账号', verify: '账号设置' }

  const completeVerify = (e: Examinee) => {
    if (onVerified) onVerified(e)
    else verifySharedSelf(e)
    setProfile((p) => ({ ...p, realName: e.name, gender: e.gender, birth: e.birth ?? p.birth }))
    if (verifyOnly) return onBack()
    setView('main')
    setToast('实名认证成功')
  }

  return (
    <SubPage
      title={titles[view]}
      titleId="account-settings-title"
      onBack={() => (view === 'main' ? onBack() : setView('main'))}
    >
      {(view === 'main' || view === 'verify') && (
        <MainView
          profile={profile}
          phone={phone}
          verified={verified}
          onVerify={() => (verified ? setToast('已完成实名认证') : setView('verify'))}
          onEdit={setEditing}
          onDeactivate={() => setView('deactivate')}
          onLogout={() => setLogoutOpen(true)}
          onAvatar={() => setAvatarOpen(true)}
        />
      )}
      {avatarOpen && (
        <AvatarSheet
          onClose={() => setAvatarOpen(false)}
          onPick={(msg) => {
            setAvatarOpen(false)
            setToast(msg)
          }}
        />
      )}
      {view === 'deactivate' && (
          <DeactivateView

          onSubmitted={() => {
            setView('main')
            setToast('账号已注销')
          }}
        />
      )}

      {view === 'verify' && (
        <ExamineeVerifyScreen
          self={{ ...selfDraft, name: profile.realName || selfDraft.name }}
          onBack={() => (verifyOnly ? onBack() : setView('main'))}
          onVerified={completeVerify}
        />
      )}

      {(editing === 'nickname' || editing === 'realName') && (
        <TextSheet
          key={editing}
          field={editing}
          value={profile[editing]}
          onClose={() => setEditing(null)}
          onSave={(v) => saveProfile(editing, v)}
        />
      )}
      {editing === 'gender' && (
        <GenderSheet value={profile.gender} onClose={() => setEditing(null)} onSave={(v) => saveProfile('gender', v)} />
      )}
      {editing === 'birth' && (
        <BirthSheet value={profile.birth} onClose={() => setEditing(null)} onSave={(v) => saveProfile('birth', v)} />
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
