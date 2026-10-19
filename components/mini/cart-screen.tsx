'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, ChevronLeft, Plus } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { CareBagIcon } from '@/components/mini/tests-screen'
import {
  getSamplingModes,
  sampleTypeText,
  samplingLabel,
  testServices,
  type TestService,
} from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

export const MAX_QTY = 10

export type CartItem = { id: string; qty: number; checked: boolean }

type Props = {
  items: CartItem[]
  onChange: (items: CartItem[]) => void
  onBack: () => void
  onCheckout: (count: number) => void
  onOpenService: (service: TestService) => void
  onAddRecommend: (service: TestService) => void
}

export function CartScreen({ items, onChange, onBack, onCheckout, onOpenService, onAddRecommend }: Props) {
  const [managing, setManaging] = useState(false)

  const rows = items
    .map((item) => ({ item, service: testServices.find((s) => s.id === item.id) }))
    .filter((r): r is { item: CartItem; service: TestService } => !!r.service)

  const checkedRows = rows.filter((r) => r.item.checked)
  const allChecked = rows.length > 0 && checkedRows.length === rows.length
  const checkedQty = checkedRows.reduce((n, r) => n + r.item.qty, 0)
  const total = checkedRows.reduce((n, r) => n + r.service.price * r.item.qty, 0)
  const saved = checkedRows.reduce(
    (n, r) => n + ((r.service.originalPrice ?? r.service.price) - r.service.price) * r.item.qty,
    0,
  )

  const update = (id: string, patch: Partial<CartItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  const toggleAll = () => onChange(items.map((i) => ({ ...i, checked: !allChecked })))
  const removeChecked = () => {
    onChange(items.filter((i) => !i.checked))
    setManaging(false)
  }

  const recommends = testServices.filter((s) => !items.some((i) => i.id === s.id)).slice(0, 4)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
      className="absolute inset-0 z-20 flex flex-col bg-background motion-safe:animate-in motion-safe:slide-in-from-right"
    >
      <div className="shrink-0 bg-white">
        <StatusBar />
        <div className="relative flex h-11 items-center justify-center px-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className="absolute left-2 flex size-9 items-center justify-center rounded-full text-foreground"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <h1 id="cart-title" className="text-heading font-semibold text-foreground">
            购物车{rows.length > 0 && <span className="text-body font-normal text-muted-foreground">（{rows.length}）</span>}
          </h1>
          <Capsule className="absolute right-3" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        {rows.length > 0 ? (
          <section aria-label="已选检测服务" className="rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <p className="text-note font-medium text-foreground">检测服务</p>
              <button
                type="button"
                onClick={() => setManaging((m) => !m)}
                aria-pressed={managing}
                className="text-note text-primary"
              >
                {managing ? '完成' : '管理'}
              </button>
            </div>
            <ul>
              {rows.map(({ item, service }) => (
                <li key={item.id} className="border-b border-border last:border-0">
                  <CartRow
                    item={item}
                    service={service}
                    onToggle={() => update(item.id, { checked: !item.checked })}
                    onOpen={() => onOpenService(service)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary">
                <CareBagIcon className="size-7 text-primary" />
            </span>
            <p className="mt-3 text-body font-medium text-foreground">购物车还是空的</p>
            <p className="mt-1 text-caption text-muted-foreground">挑选适合你或家人的用药基因检测吧</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 h-8 rounded-full border border-primary px-5 text-note text-primary active:bg-secondary"
            >
              去逛逛
            </button>
          </section>
        )}

        {recommends.length > 0 && (
          <section aria-labelledby="cart-recommend" className="mt-4">
            <h2 id="cart-recommend" className="mb-2 px-1 text-title font-semibold text-foreground">
              为你推荐
            </h2>
            <ul className="grid grid-cols-2 gap-2.5">
              {recommends.map((s) => (
                <li key={s.id} className="relative flex flex-col overflow-hidden rounded-2xl bg-white">
                  <Image src={s.image} alt="" width={180} height={120} className="h-[104px] w-full bg-secondary object-cover" />
                  <div className="flex flex-1 flex-col p-2.5">
                    <h3 className="line-clamp-2 text-note leading-[18px] text-foreground">
                      <button type="button" onClick={() => onOpenService(s)} className="text-left after:absolute after:inset-0">
                        {s.name}
                      </button>
                    </h3>
                    <div className="mt-auto flex items-center justify-between pt-1.5">
                      <span className="text-title font-bold text-warning">
                        <span className="text-caption">¥</span>
                        {s.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAddRecommend(s)}
                        aria-label={`将${s.name}加入购物车`}
                        className="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95"
                      >
                        <Plus className="size-4" strokeWidth={2.4} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {rows.length > 0 && (
        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-white px-4 pb-6 pt-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={allChecked}
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-note text-foreground"
          >
            <CheckDot checked={allChecked} />
            全选
          </button>

          {managing ? (
            <button
              type="button"
              onClick={removeChecked}
              disabled={!checkedRows.length}
              className="ml-auto h-10 rounded-full border border-destructive px-6 text-body font-medium text-destructive disabled:border-border disabled:text-faint"
            >
              删除{checkedRows.length > 0 && `(${checkedRows.length})`}
            </button>
          ) : (
            <>
              <div className="ml-auto text-right">
                <p className="text-note text-foreground">
                  合计：
                  <span className="text-heading font-bold tabular-nums text-warning">
                    <span className="text-caption">¥</span>
                    {total.toLocaleString('zh-CN')}
                  </span>
                </p>
                {saved > 0 && <p className="text-caption text-muted-foreground">已优惠 ¥{saved.toLocaleString('zh-CN')}</p>}
              </div>
              <button
                type="button"
                onClick={() => onCheckout(checkedQty)}
                disabled={!checkedQty}
                className="h-10 min-w-[104px] rounded-full bg-primary px-5 text-body font-medium text-primary-foreground active:opacity-90 disabled:bg-[#b9d3f8]"
              >
                结算{checkedQty > 0 && `(${checkedQty})`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function CartRow({
  item,
  service,
  onToggle,
  onOpen,
}: {
  item: CartItem
  service: TestService
  onToggle: () => void
  onOpen: () => void
}) {
  return (
    <div className="flex items-center gap-2.5 p-3.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={item.checked}
        aria-label={`选择${service.name}`}
        onClick={onToggle}
        className="-m-1.5 p-1.5"
      >
        <CheckDot checked={item.checked} />
      </button>
      <button type="button" onClick={onOpen} className="shrink-0" aria-label={`查看${service.name}详情`}>
        <Image src={service.image} alt="" width={76} height={76} className="size-[76px] rounded-xl bg-secondary object-cover" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col self-stretch">
        <p className="line-clamp-2 text-note font-medium leading-[18px] text-foreground">{service.name}</p>
        <p className="mt-1 flex">
          <span className="rounded bg-muted px-1.5 py-px text-tag text-muted-foreground">
                {getSamplingModes(service.id).map((m) => samplingLabel[m]).join(' / ')} · {sampleTypeText(service.id, undefined, '/')}
          </span>
        </p>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <p className="flex items-baseline gap-1">
            <span className="text-title font-bold text-warning">
              <span className="text-caption">¥</span>
              {service.price}
            </span>
            {service.originalPrice && (
              <span className="text-tag text-faint line-through">¥{service.originalPrice}</span>
            )}
          </p>
          <span className="text-note tabular-nums text-muted-foreground" aria-label={`共 ${item.qty} 份`}>
            ×{item.qty}
          </span>
        </div>
      </div>
    </div>
  )
}

function CheckDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-faint/60 bg-white',
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </span>
  )
}
