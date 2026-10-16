import { cn } from '@/lib/utils'

/** 注册时由系统生成的默认昵称：品牌前缀 + 6 位随机字母数字，不含手机号等个人信息 */
export const DEFAULT_NICKNAME = '都正用户_K7Q2M9'

/** 用户未上传头像时的默认头像：裁切品牌 logo 左侧的图形标识，居中放在白色圆形内 */
export function DefaultAvatar({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border', className)}>
      <span className="relative block h-[60%] w-[56%] overflow-hidden">
        <img
          src="/images/drugene-logo.png"
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-0 h-[140%] w-auto max-w-none"
        />
      </span>
    </span>
  )
}
