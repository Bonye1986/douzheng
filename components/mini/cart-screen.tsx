'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
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
      className="absolute inset-0 z-20 flex flex-col bg-[#f4f8fe] motion-safe:animate-in motion-safe:slide-in-from-right"
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
          <h1 id="cart-title" className="text-[17px] font-semibold text-foreground">
            购物车{rows.length > 0 && <span className="text-[14px] font-normal text-muted-foreground">（{rows.length}）</span>}
          </h1>
          <Capsule className="absolute right-3" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        {rows.length > 0 ? (
          <section aria-label="已选检测服务" className="rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <p className="text-[13px] font-medium text-foreground">检测服务</p>
              <button
                type="button"
                onClick={() => setManaging((m) => !m)}
                aria-pressed={managing}
                className="text-[13px] text-primary"
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
                    onQty={(qty) => update(item.id, { qty })}
                    onOpen={() => onOpenService(service)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#eef4fd]">
              <ShoppingCart className="size-7 text-primary" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <p className="mt-3 text-[14px] font-medium text-foreground">购物车还是空的</p>
            <p className="mt-1 text-[12px] text-muted-foreground">挑选适合你或家人的用药基因检测吧</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 h-8 rounded-full border border-primary px-5 text-[13px] text-primary active:bg-[#e8f1fe]"
            >
              去逛逛
            </button>
          </section>
        )}

        {recommends.length > 0 && (
          <section aria-labelledby="cart-recommend" className="mt-4">
            <h2 id="cart-recommend" className="mb-2 px-1 text-[14px] font-semibold text-foreground">
              为你推荐
            </h2>
            <ul className="grid grid-cols-2 gap-2.5">
              {recommends.map((s) => (
                <li key={s.id} className="relative flex flex-col overflow-hidden rounded-2xl bg-white">
                  <Image src={s.image} alt="" width={180} height={120} className="h-[104px] w-full bg-[#eef4fd] object-cover" />
                  <div className="flex flex-1 flex-col p-2.5">
                    <h3 className="line-clamp-2 text-[13px] leading-[18px] text-foreground">
                      <button type="button" onClick={() => onOpenService(s)} className="text-left after:absolute after:inset-0">
                        {s.name}
                      </button>
                    </h3>
                    <div className="mt-auto flex items-center justify-between pt-1.5">
                      <span className="text-[15px] font-bold text-[#e0651c]">
                        <span className="text-[11px]">¥</span>
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
            className="flex items-center gap-1.5 text-[13px] text-foreground"
          >
            <CheckDot checked={allChecked} />
            全选
          </button>

          {managing ? (
            <button
              type="button"
              onClick={removeChecked}
              disabled={!checkedRows.length}
              className="ml-auto h-10 rounded-full border border-[#e5603a] px-6 text-[14px] font-medium text-[#e5603a] disabled:border-border disabled:text-[#b8c2d6]"
            >
              删除{checkedRows.length > 0 && `(${checkedRows.length})`}
            </button>
          ) : (
            <>
              <div className="ml-auto text-right">
                <p className="text-[13px] text-foreground">
                  合计：
                  <span className="text-[18px] font-bold tabular-nums text-[#e0651c]">
                    <span className="text-[12px]">¥</span>
                    {total.toLocaleString('zh-CN')}
                  </span>
                </p>
                {saved > 0 && <p className="text-[11px] text-muted-foreground">已优惠 ¥{saved.toLocaleString('zh-CN')}</p>}
              </div>
              <button
                type="button"
                onClick={() => onCheckout(checkedQty)}
                disabled={!checkedQty}
                className="h-10 min-w-[104px] rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground active:opacity-90 disabled:bg-[#b9d3f8]"
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
  onQty,
  onOpen,
}: {
  item: CartItem
  service: TestService
  onToggle: () => void
  onQty: (qty: number) => void
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
        <Image src={service.image} alt="" width={76} height={76} className="size-[76px] rounded-xl bg-[#eef4fd] object-cover" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col self-stretch">
        <p className="line-clamp-2 text-[13px] font-medium leading-[18px] text-foreground">{service.name}</p>
        <p className="mt-1 flex">
          <span className="rounded bg-[#f2f5fa] px-1.5 py-px text-[10px] text-muted-foreground">
                {getSamplingModes(service.id).map((m) => samplingLabel[m]).join(' / ')} · {sampleTypeText(service.id, undefined, '/')}
          </span>
        </p>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <p className="flex items-baseline gap-1">
            <span className="text-[15px] font-bold text-[#e0651c]">
              <span className="text-[11px]">¥</span>
              {service.price}
            </span>
            {service.originalPrice && (
              <span className="text-[10px] text-[#b8c2d6] line-through">¥{service.originalPrice}</span>
            )}
          </p>
          <Stepper value={item.qty} onChange={onQty} label={service.name} />
        </div>
      </div>
    </div>
  )
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex h-6 items-center overflow-hidden rounded-md border border-border" role="group" aria-label={`${label}份数`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="减少一份"
        className="flex size-6 items-center justify-center text-foreground disabled:text-[#c3ccdb]"
      >
        <Minus className="size-3" aria-hidden="true" />
      </button>
      <span className="flex h-full w-7 items-center justify-center border-x border-border text-[12px] tabular-nums text-foreground" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label="增加一份"
        className="flex size-6 items-center justify-center text-foreground disabled:text-[#c3ccdb]"
      >
        <Plus className="size-3" aria-hidden="true" />
      </button>
    </div>
  )
}

function CheckDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c3ccdb] bg-white',
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </span>
  )
}
