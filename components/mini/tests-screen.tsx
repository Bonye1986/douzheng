'use client'

import { useState } from 'react'
import { ChevronRight, FileText, PackageCheck, ScanLine, Sparkles, Truck } from 'lucide-react'
import { StatusBar } from '@/components/mini/phone-frame'
import {
  filterTabs,
  statusMeta,
  testOrders,
  testSteps,
  type FilterKey,
  type TestOrder,
} from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

type Props = { onOpenChat?: (question?: string) => void }

export function TestsScreen({ onOpenChat }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all')

  const orders = testOrders.filter((o) =>
    filter === 'all' ? true : filter === 'done' ? o.status === 'done' : o.status !== 'done',
  )

  return (
    <div className="flex h-full flex-col bg-[#f4f8fe]">
      <div className="bg-white">
        <StatusBar />
        <header className="flex h-11 shrink-0 items-center justify-center">
          <h1 className="text-[17px] font-semibold text-foreground">检测</h1>
        </header>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 [scrollbar-width:none]">
        <div className="flex flex-col gap-3 px-4 pt-3">
          <BindCard />

          <section aria-labelledby="my-tests">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 id="my-tests" className="text-[15px] font-semibold text-foreground">
                我的检测
              </h2>
              <div role="tablist" aria-label="检测状态筛选" className="flex rounded-full bg-white p-0.5">
                {filterTabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={filter === t.key}
                    onClick={() => setFilter(t.key)}
                    className={cn(
                      'h-6 rounded-full px-2.5 text-[11px] transition-colors',
                      filter === t.key ? 'bg-primary font-medium text-primary-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {orders.length ? (
              <ul className="flex flex-col gap-3">
                {orders.map((o) => (
                  <li key={o.id}>
                    <OrderCard order={o} onOpenChat={onOpenChat} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-white py-10 text-center text-[13px] text-muted-foreground">暂无相关检测</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function BindCard() {
  return (
    <section
      aria-label="绑定采样盒"
      className="rounded-2xl bg-[linear-gradient(135deg,#2f7cf6,#5aa2ff)] p-4 text-primary-foreground"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[16px] font-semibold">收到采样盒了吗？</p>
          <p className="mt-1 text-[12px] text-white/80">扫描盒内条形码，绑定检测人后再采样</p>
        </div>
        <button
          type="button"
          className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-3.5 text-[13px] font-medium text-primary"
        >
          <ScanLine className="size-4" aria-hidden="true" />
          扫码绑定
        </button>
      </div>

      <ol className="mt-4 flex items-start rounded-xl bg-white/15 px-2 py-2.5" aria-label="检测流程">
        {testSteps.map((s, i) => (
          <li key={s} className="relative flex flex-1 flex-col items-center gap-1">
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-primary">
              {i + 1}
            </span>
            <span className="whitespace-nowrap text-[11px]">{s}</span>
            {i < testSteps.length - 1 && (
              <ChevronRight
                className="absolute -right-1.5 top-1 size-3 text-white/60"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function OrderCard({ order, onOpenChat }: { order: TestOrder } & Props) {
  const meta = statusMeta[order.status]

  return (
    <article className="rounded-2xl bg-white p-4" aria-labelledby={`order-${order.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`order-${order.id}`} className="truncate text-[14px] font-medium text-foreground">
            {order.name}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            检测人 {order.testee}
            {order.sampleNo && <span className="ml-2 tabular-nums">样本号 {order.sampleNo}</span>}
          </p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', meta.className)}>
          {meta.label}
        </span>
      </div>

      <StepProgress step={order.step} done={order.status === 'done'} />

      <p className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-foreground">{order.note}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{order.updatedAt}</span>
      </p>

      {order.reportSummary && (
        <ul className="mt-3 grid grid-cols-3 gap-2" aria-label="报告摘要">
          {order.reportSummary.map((r) => (
            <li
              key={r.label}
              className={cn(
                'rounded-lg px-2 py-1.5 text-center',
                r.tone === 'risk' && 'bg-[#feecee]',
                r.tone === 'warn' && 'bg-[#fff1e8]',
                r.tone === 'normal' && 'bg-[#e9f8f1]',
              )}
            >
              <p className="truncate text-[11px] text-muted-foreground">{r.label}</p>
              <p
                className={cn(
                  'text-[12px] font-medium',
                  r.tone === 'risk' && 'text-[#e04a5a]',
                  r.tone === 'warn' && 'text-[#f07a2c]',
                  r.tone === 'normal' && 'text-[#1f9d6b]',
                )}
              >
                {r.value}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
        <OrderActions order={order} onOpenChat={onOpenChat} />
      </div>
    </article>
  )
}

function StepProgress({ step, done }: { step: number; done: boolean }) {
  return (
    <ol className="mt-3 flex items-start" aria-label={`当前进度：${testSteps[step]}`}>
      {testSteps.map((s, i) => {
        const reached = i <= step
        const current = i === step && !done
        return (
          <li key={s} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="relative flex w-full items-center justify-center">
              {i > 0 && (
                <span
                  className={cn('absolute right-1/2 h-0.5 w-full', reached ? 'bg-primary' : 'bg-[#e3e9f3]')}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  'relative z-10 size-2.5 rounded-full',
                  reached ? 'bg-primary' : 'bg-[#e3e9f3]',
                  current && 'ring-4 ring-primary/20',
                )}
              />
            </span>
            <span
              className={cn(
                'text-[10px]',
                current ? 'font-medium text-primary' : reached ? 'text-foreground' : 'text-muted-foreground',
              )}
              aria-current={current ? 'step' : undefined}
            >
              {s}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

const ghostBtn = 'flex h-8 items-center gap-1 rounded-full border border-border px-3 text-[12px] text-foreground'
const primaryBtn = 'flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-medium text-primary-foreground'

function OrderActions({ order, onOpenChat }: { order: TestOrder } & Props) {
  if (order.status === 'unbound') {
    return (
      <>
        <button type="button" className={ghostBtn}>
          <Truck className="size-3.5" aria-hidden="true" />
          查看物流
        </button>
        <button type="button" className={primaryBtn}>
          <ScanLine className="size-3.5" aria-hidden="true" />
          扫码绑定
        </button>
      </>
    )
  }
  if (order.status === 'shipping') {
    return (
      <button type="button" className={primaryBtn}>
        <PackageCheck className="size-3.5" aria-hidden="true" />
        预约寄回
      </button>
    )
  }
  if (order.status === 'testing') {
    return (
      <button type="button" className={ghostBtn}>
        <Truck className="size-3.5" aria-hidden="true" />
        样本物流
      </button>
    )
  }
  return (
    <>
      <button type="button" className={ghostBtn}>
        <FileText className="size-3.5" aria-hidden="true" />
        查看报告
      </button>
      <button
        type="button"
        onClick={() => onOpenChat?.(`帮我解读${order.testee}的${order.name}报告`)}
        className={primaryBtn}
      >
        <Sparkles className="size-3.5" aria-hidden="true" />
        AI 解读
      </button>
    </>
  )
}
