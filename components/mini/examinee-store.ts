'use client'

import { useCallback, useState, useSyncExternalStore } from 'react'
import { initialExaminees, type Examinee } from '@/components/mini/checkout-data'

/** 各检测人名下的历史报告份数（检测人管理、AI 咨询共用） */
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

/**
 * 账号下的检测人列表：检测人管理、检测下单、AI 咨询选择检测人共用同一份数据，任一处增删改即全局同步。
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
