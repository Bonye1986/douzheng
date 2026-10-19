'use client'

import Image from 'next/image'
import { ChevronLeft, Dna, FlaskConical, Headset, ShieldCheck } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { CartButton } from '@/components/mini/tests-screen'
import {
  getSamplingModes,
  sampleTypeText,
  samplingLabel,
  testFlow,
  type TestService,
} from '@/components/mini/tests-data'

type Props = {
  service: TestService
  cartCount: number
  onBack: () => void
  onAddToCart: () => void
  onBuyNow: () => void
  onContact: () => void
  onOpenCart: () => void
}

export function TestDetailScreen({ service, cartCount, onBack, onAddToCart, onBuyNow, onContact, onOpenCart }: Props) {
  const samplingOptions = getSamplingModes(service.id).map((mode) => ({
    mode,
    label: samplingLabel[mode],
    samples: sampleTypeText(service.id, mode),
  }))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      className="absolute inset-0 z-10 flex flex-col bg-background motion-safe:animate-in motion-safe:slide-in-from-right"
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
          <p className="text-heading font-semibold text-foreground">服务详情</p>
          <Capsule className="absolute right-3" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none]">
        <Image
          src={service.image}
          alt={`${service.name}采样盒`}
          width={375}
          height={280}
          priority
          className="h-[280px] w-full bg-secondary object-cover"
        />

        <div className="relative -mt-4 flex flex-col gap-2.5 px-3">
          <section aria-label="基本信息" className="rounded-2xl bg-white p-4">
            <p className="flex items-baseline gap-2">
              <span className="text-headline font-bold leading-none text-warning">
                <span className="text-body">¥</span>
                {service.price}
              </span>
              {service.originalPrice && (
                <span className="text-caption text-faint line-through">¥{service.originalPrice}</span>
              )}
            </p>
            <h1 id="detail-title" className="mt-2.5 text-pretty text-heading font-semibold leading-6 text-foreground">
              {service.name}
            </h1>
            <p className="mt-1 text-note leading-5 text-muted-foreground">{service.summary}</p>

            <div className="mt-3 border-t border-border pt-3">
              <p className="flex items-center gap-1.5 text-note font-medium text-foreground">
                <FlaskConical className="size-4 text-primary" aria-hidden="true" />
                采样方式
              </p>
              <dl className="mt-2 flex flex-col gap-2">
                {samplingOptions.map(({ mode, label, samples }) => (
                  <div key={mode} className="flex items-start gap-2.5 rounded-xl bg-background px-3 py-2.5">
                    <dt className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-caption font-medium leading-[18px] text-primary">
                      {label}
                    </dt>
                    <dd className="text-note leading-[22px] text-foreground">{samples}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section aria-labelledby="detail-intro" className="rounded-2xl bg-white p-4">
            <h2 id="detail-intro" className="text-title font-semibold text-foreground">
              详情介绍
            </h2>

            <h3 className="mt-3 flex items-center gap-1.5 text-note font-medium text-foreground">
              <Dna className="size-4 text-primary" aria-hidden="true" />
              主要检测基因
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {service.genes.map((g) => (
                <li key={g} className="rounded-md bg-muted px-2 py-1 font-mono text-caption text-foreground">
                  {g}
                </li>
              ))}
            </ul>

            <h3 className="mt-4 text-note font-medium text-foreground">适用人群</h3>
            <ul className="mt-1.5 flex flex-col gap-1">
              {service.audience.map((a) => (
                <li key={a} className="flex gap-2 text-note leading-5 text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>

            <h3 className="mt-4 text-note font-medium text-foreground">检测流程</h3>
            <ol className="mt-2.5 flex items-start">
              {testFlow.map((step, i) => (
                <li key={step} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="relative flex w-full justify-center">
                    {i > 0 && <span className="absolute right-1/2 top-1/2 h-px w-full bg-[#cfe0fb]" aria-hidden="true" />}
                    <span className="relative flex size-6 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-primary">
                      {i + 1}
                    </span>
                  </span>
                  <span className="text-caption text-foreground">{step}</span>
                </li>
              ))}
            </ol>

            <h3 className="mt-4 text-note font-medium text-foreground">注意事项</h3>
            <ul className="mt-1.5 flex flex-col gap-1">
              {service.notes.map((n) => (
                <li key={n} className="flex gap-2 text-note leading-5 text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {n}
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-background p-2.5 text-caption leading-4 text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
              样本仅用于本次检测，数据加密存储；报告结果仅供临床用药参考，不作为诊断依据。
            </p>
          </section>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-white px-3 pb-6 pt-2">
        <button
          type="button"
          onClick={onContact}
          className="flex w-11 flex-col items-center gap-0.5 text-tag text-muted-foreground"
        >
          <Headset className="size-5 text-foreground" strokeWidth={1.8} aria-hidden="true" />
          客服
        </button>
        <div className="flex w-11 flex-col items-center gap-0.5 text-tag text-muted-foreground">
          <CartButton count={cartCount} onClick={onOpenCart} className="size-6 text-foreground active:bg-transparent [&>svg]:size-5" />
          <span aria-hidden="true">购物车</span>
        </div>
        <div className="ml-1 flex h-10 flex-1 overflow-hidden rounded-full">
          <button
            type="button"
            onClick={onAddToCart}
            className="flex-1 bg-secondary text-body font-medium text-primary active:bg-[#d8e7fd]"
          >
            加入购物车
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            className="flex-1 bg-primary text-body font-medium text-primary-foreground active:opacity-90"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  )
}
