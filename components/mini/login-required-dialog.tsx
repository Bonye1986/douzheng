import { UserRound } from 'lucide-react'

export function LoginRequiredDialog({
  feature,
  onLogin,
  onCancel,
}: {
  feature: string
  onLogin: () => void
  onCancel: () => void
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-8">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        aria-describedby="login-required-desc"
        className="w-full rounded-2xl bg-white px-5 pb-4 pt-5 text-center motion-safe:animate-in motion-safe:zoom-in-95"
      >
        <span
          className="mx-auto flex size-11 items-center justify-center rounded-full bg-secondary text-primary"
          aria-hidden="true"
        >
          <UserRound className="size-5" />
        </span>
        <h2 id="login-required-title" className="mt-3 text-title font-semibold text-foreground">
          请先登录
        </h2>
        <p id="login-required-desc" className="mt-2 text-note leading-5 text-muted-foreground">
          {`登录后即可使用「${feature}」，数据将安全保存在你的账号中`}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-full bg-muted text-body font-medium text-foreground"
          >
            暂不登录
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="h-10 rounded-full bg-primary text-body font-medium text-primary-foreground"
          >
            去登录
          </button>
        </div>
      </div>
    </div>
  )
}
