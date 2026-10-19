'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Search, ShoppingCart, X } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { TestDetailScreen } from '@/components/mini/test-detail-screen'
import { CartScreen, MAX_QTY, type CartItem } from '@/components/mini/cart-screen'
import { CheckoutScreen, type CheckoutLine } from '@/components/mini/checkout-screen'
import {
  getSamplingModes,
  samplingLabel,
  testCategories,
  testServices,
  type CategoryKey,
  type TestService,
} from '@/components/mini/tests-data'
import { cn } from '@/lib/utils'

export function TestsScreen({
  initialDetailId,
  initialCart = [],
  initialCartOpen = false,
  initialCheckout,
}: {
  initialDetailId?: string
  initialCart?: CartItem[]
  initialCartOpen?: boolean
  initialCheckout?: CheckoutLine[]
}) {
  const [checkout, setCheckout] = useState<{ lines: CheckoutLine[]; fromCart: boolean } | null>(
    initialCheckout ? { lines: initialCheckout, fromCart: false } : null,
  )
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryKey>('all')
  const [detail, setDetail] = useState<TestService | null>(
    () => testServices.find((s) => s.id === initialDetailId) ?? null,
  )
  const [cart, setCart] = useState<CartItem[]>(initialCart)
  const [cartOpen, setCartOpen] = useState(initialCartOpen)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const cartCount = cart.reduce((n, i) => n + i.qty, 0)

  const showToast = (text: string) => {
    clearTimeout(toastTimer.current)
    setToast(text)
    toastTimer.current = setTimeout(() => setToast(null), 1600)
  }

  const addToCart = (service: TestService) => {
    const existing = cart.find((i) => i.id === service.id)
    if (existing && existing.qty >= MAX_QTY) {
      showToast(`单个项目最多购买 ${MAX_QTY} 份`)
      return
    }
    setCart(
      existing
        ? cart.map((i) => (i.id === service.id ? { ...i, qty: i.qty + 1, checked: true } : i))
        : [...cart, { id: service.id, qty: 1, checked: true }],
    )
    showToast('已加入购物车')
  }

  const openCart = () => setCartOpen(true)

  const keyword = query.trim().toLowerCase()
  const list = testServices.filter(
    (s) =>
      (category === 'all' || s.category === category) &&
      (!keyword ||
        s.name.toLowerCase().includes(keyword) ||
        s.summary.toLowerCase().includes(keyword) ||
        s.genes.some((g) => g.toLowerCase().includes(keyword))),
  )

  return (
    <>
      <div className="flex h-full flex-col bg-background" inert={!!detail || cartOpen || !!checkout}>
        <div className="shrink-0 bg-white">
          <StatusBar />
          <header className="relative flex h-11 items-center justify-center">
            <h1 className="text-heading font-semibold text-foreground">检测</h1>
            <Capsule className="absolute right-3" />
          </header>

          <div className="flex items-center gap-2 px-4 pb-2.5 pt-1">
            <label className="flex h-9 flex-1 items-center gap-2 rounded-full bg-muted px-3.5">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">搜索检测服务</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索检测项目、药物或基因"
                className="min-w-0 flex-1 bg-transparent text-note text-foreground outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="清空搜索"
                  className="flex size-4 items-center justify-center rounded-full bg-[#c3ccdb] text-white"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}
            </label>
            <CartButton count={cartCount} onClick={openCart} />
          </div>

          <div
            role="tablist"
            aria-label="检测分类"
            className="flex gap-5 overflow-x-auto px-4 [scrollbar-width:none]"
          >
            {testCategories.map((c) => {
              const active = category === c.key
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    'relative shrink-0 pb-2.5 pt-1 text-body transition-colors',
                    active ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {c.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-0 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-primary transition-opacity',
                      active ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3 [scrollbar-width:none]">
          {list.length ? (
            <>
              <p className="mb-2 text-caption text-muted-foreground" aria-live="polite">
                共 {list.length} 项检测服务
              </p>
              <ul className="flex flex-col gap-2.5">
                {list.map((s) => (
                  <li key={s.id}>
                    <ServiceCard service={s} onOpen={() => setDetail(s)} onAdd={() => addToCart(s)} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center" aria-live="polite">
              <Search className="size-8 text-[#c3ccdb]" aria-hidden="true" />
              <p className="mt-3 text-body text-foreground">没有找到相关检测服务</p>
              <p className="mt-1 text-caption text-muted-foreground">换个关键词，或切换到「全部」分类试试</p>
            </div>
          )}
        </div>
      </div>

      {detail && (
        <div className="contents" inert={cartOpen || !!checkout}>
          <TestDetailScreen
            key={detail.id}
            service={detail}
            cartCount={cartCount}
            onBack={() => setDetail(null)}
            onAddToCart={() => addToCart(detail)}
            onBuyNow={() => setCheckout({ lines: [{ id: detail.id, qty: 1 }], fromCart: false })}
            onContact={() => showToast('正在为你接入在线客服')}
            onOpenCart={openCart}
          />
        </div>
      )}

      {cartOpen && (
        <div className="contents" inert={!!checkout}>
          <CartScreen
            items={cart}
            onChange={setCart}
            onBack={() => setCartOpen(false)}
            onCheckout={() =>
              setCheckout({
                lines: cart.filter((i) => i.checked).map(({ id, qty }) => ({ id, qty })),
                fromCart: true,
              })
            }
            onOpenService={(s) => {
              setDetail(s)
              setCartOpen(false)
            }}
            onAddRecommend={addToCart}
          />
        </div>
      )}

      {checkout && (
        <CheckoutScreen
          lines={checkout.lines}
          onBack={() => setCheckout(null)}
          onSubmitted={() => {
            if (checkout.fromCart) setCart((c) => c.filter((i) => !i.checked))
          }}
          onDone={() => {
            setCheckout(null)
            setCartOpen(false)
            setDetail(null)
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex justify-center"
        >
          <span className="rounded-lg bg-[#1f2a3d]/85 px-4 py-2.5 text-note text-white">{toast}</span>
        </div>
      )}
    </>
  )
}

export function CartButton({
  count,
  onClick,
  className,
}: {
  count: number
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count ? `购物车，已有 ${count} 件` : '购物车'}
      className={cn('relative flex size-9 shrink-0 items-center justify-center rounded-full text-foreground', className)}
    >
      <ShoppingCart className="size-6" strokeWidth={1.8} aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-tag font-medium tabular-nums text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

function ServiceCard({
  service,
  onOpen,
  onAdd,
}: {
  service: TestService
  onOpen: () => void
  onAdd: () => void
}) {
  return (
    <article className="relative flex gap-3 rounded-2xl bg-white p-3" aria-labelledby={`svc-${service.id}`}>
      <Image
        src={service.image}
        alt=""
        width={96}
        height={96}
        className="size-24 shrink-0 rounded-xl bg-secondary object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2 id={`svc-${service.id}`} className="line-clamp-2 text-title font-semibold leading-5 text-foreground">
          <button type="button" onClick={onOpen} className="text-left after:absolute after:inset-0 after:rounded-2xl">
            {service.name}
          </button>
        </h2>
        <p className="mt-0.5 truncate text-caption text-muted-foreground">{service.summary}</p>
        <p className="mt-1 flex flex-wrap gap-1">
          <span className="rounded bg-success-soft px-1.5 py-px text-tag text-success">
                {getSamplingModes(service.id).includes('self') ? '支持居家自采' : samplingLabel.site}
          </span>
          {service.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded bg-secondary px-1.5 py-px text-tag text-primary">
              {tag}
            </span>
          ))}
        </p>
        <div className="mt-auto flex items-end justify-between pt-1.5">
          <p className="flex items-baseline gap-1.5">
            <span className="text-heading font-bold leading-none text-warning">
              <span className="text-caption">¥</span>
              {service.price}
            </span>
            {service.originalPrice && (
              <span className="text-caption text-faint line-through">¥{service.originalPrice}</span>
            )}
            <span className="text-caption text-muted-foreground">{service.sold}</span>
          </p>
          <button
            type="button"
            onClick={onAdd}
            aria-label={`将${service.name}加入购物车`}
            className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95"
          >
            <Plus className="size-4" strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
