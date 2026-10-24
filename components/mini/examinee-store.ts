'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
import { initialExaminees, type Examinee } from '@/components/mini/checkout-data'

/** 各受检人名下的历史报告份数（受检人管理、AI 咨询共用） */
export const examineeReportCount: Record<string, number> = { self: 2, spouse: 1, child: 1 }

type Updater = Examinee[] | ((prev: Examinee[]) => Examinee[])

let examinees: Examinee[] = initialExaminees
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => examinees
const getServerSnapshot = () => initialExaminees

function setSharedExaminees(next: Updater) {
  examinees = typeof next === 'function' ? next(examinees) : next
  listeners.forEach((l) => l())
}

/** 实名认证前的本人资料（来自微信授权与账号设置），用于实名认证页回填 */
export const selfDraft: Examinee = { ...initialExaminees[0], idCard: undefined }

/** 本人是否已实名认证：受检人列表中存在已认证的「本人」 */
export const isSelfVerified = (list: Examinee[]) => list.some((m) => m.relation === '本人' && !!m.idCard)

/** 实名认证成功后将「本人」置顶写入受检人列表 */
export const withVerifiedSelf = (list: Examinee[], self: Examinee) => [
  self,
  ...list.filter((m) => m.relation !== '本人'),
]

/** 模拟新用户登录：尚未实名认证，受检人列表为空 */
export function startUnverifiedSession() {
  setSharedExaminees([])
}

/** 完成本人实名认证（共享数据） */
export function verifySharedSelf(self: Examinee) {
  setSharedExaminees((l) => withVerifiedSelf(l, self))
}

/** 共享数据中的本人实名状态 */
export function useSelfVerified() {
  return isSelfVerified(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot))
}

/**
 * 账号下的受检人列表：受检人管理、检测下单、AI 咨询选择受检人共用同一份数据，任一处增删改即全局同步。
 * `isolated` 用于设计稿中需要独立演示的状态（如空列表），不影响共享数据。
 */
export function useExaminees(isolated?: Examinee[]) {
  const shared = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [local, setLocal] = useState<Examinee[] | undefined>(isolated)
  const setLocalList = useCallback(
    (next: Updater) => setLocal((prev) => (typeof next === 'function' ? next(prev ?? []) : next)),
    [],
  )
  if (local !== undefined) return [local, setLocalList] as const
  return [shared, setSharedExaminees] as const
}
