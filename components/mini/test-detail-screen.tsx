'use client'

import Image from 'next/image'
import { ChevronLeft, Clock, Dna, FlaskConical, Headset, Pill, ShieldCheck } from 'lucide-react'
import { Capsule, StatusBar } from '@/components/mini/phone-frame'
import { CartButton } from '@/components/mini/tests-screen'
import { samplingLabel, testFlow, type TestService } from '@/components/mini/tests-data'

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
  const facts = [
    { icon: FlaskConical, label: '采样方式', value: `${samplingLabel[service.sampling]} · ${service.sampleType}` },
    { icon: Clock, label: '出报告时间', value: `样本签收后 ${service.turnaround}` },
    { icon: Pill, label: '覆盖药物', value: `${service.drugCount} 种常用药物` },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      className="absolute inset-0 z-10 flex flex-col bg-[#f4f8fe] motion-safe:animate-in motion-safe:slide-in-from-right"
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
          <p className="text-[17px] font-semibold text-foreground">服务详情</p>
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
          className="h-[280px] w-full bg-[#eef4fd] object-cover"
        />

        <div className="relative -mt-4 flex flex-col gap-2.5 px-3">
          <section aria-label="基本信息" className="rounded-2xl bg-white p-4">
            <p className="flex items-baseline gap-2">
              <span className="text-[24px] font-bold leading-none text-[#f07a2c]">
                <span className="text-[14px]">¥</span>
                {service.price}
              </span>
              {service.originalPrice && (
                <span className="text-[12px] text-[#b8c2d6] line-through">¥{service.originalPrice}</span>
              )}
              <span className="ml-auto text-[12px] text-muted-foreground">{service.sold}</span>
            </p>
            <h1 id="detail-title" className="mt-2.5 text-pretty text-[17px] font-semibold leading-6 text-foreground">
              {service.name}
            </h1>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{service.summary}</p>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {service.tags.map((tag) => (
                <span key={tag} className="rounded bg-[#e8f1fe] px-1.5 py-0.5 text-[11px] text-primary">
                  {tag}
                </span>
              ))}
            </p>

            <dl className="mt-3 flex flex-col gap-2.5 border-t border-border pt-3">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-[13px]">
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <dt className="w-[70px] shrink-0 text-muted-foreground">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="detail-intro" className="rounded-2xl bg-white p-4">
            <h2 id="detail-intro" className="text-[15px] font-semibold text-foreground">
              详情介绍
            </h2>

            <h3 className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-foreground">
              <Dna className="size-4 text-primary" aria-hidden="true" />
              主要检测基因
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {service.genes.map((g) => (
                <li key={g} className="rounded-md bg-[#f2f5fa] px-2 py-1 font-mono text-[11px] text-foreground">
                  {g}
                </li>
              ))}
            </ul>

            <h3 className="mt-4 text-[13px] font-medium text-foreground">适用人群</h3>
            <ul className="mt-1.5 flex flex-col gap-1">
              {service.audience.map((a) => (
                <li key={a} className="flex gap-2 text-[13px] leading-5 text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>

            <h3 className="mt-4 text-[13px] font-medium text-foreground">检测流程</h3>
            <ol className="mt-2.5 flex items-start">
              {testFlow.map((step, i) => (
                <li key={step} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="relative flex w-full justify-center">
                    {i > 0 && <span className="absolute right-1/2 top-1/2 h-px w-full bg-[#cfe0fb]" aria-hidden="true" />}
                    <span className="relative flex size-6 items-center justify-center rounded-full bg-[#e8f1fe] text-[12px] font-semibold text-primary">
                      {i + 1}
                    </span>
                  </span>
                  <span className="text-[11px] text-foreground">{step}</span>
                </li>
              ))}
            </ol>

            <h3 className="mt-4 text-[13px] font-medium text-foreground">注意事项</h3>
            <ul className="mt-1.5 flex flex-col gap-1">
              {service.notes.map((n) => (
                <li key={n} className="flex gap-2 text-[13px] leading-5 text-muted-foreground">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-[#f07a2c]" aria-hidden="true" />
                  {n}
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-[#f4f8fe] p-2.5 text-[11px] leading-4 text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0 text-[#1f9d6b]" aria-hidden="true" />
              样本仅用于本次检测，数据加密存储；报告结果仅供临床用药参考，不作为诊断依据。
            </p>
          </section>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-white px-3 pb-6 pt-2">
        <button
          type="button"
          onClick={onContact}
          className="flex w-11 flex-col items-center gap-0.5 text-[10px] text-muted-foreground"
        >
          <Headset className="size-5 text-foreground" strokeWidth={1.8} aria-hidden="true" />
          客服
        </button>
        <div className="flex w-11 flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
          <CartButton count={cartCount} onClick={onOpenCart} className="size-6 [&>svg]:size-5" />
          <span aria-hidden="true">购物车</span>
        </div>
        <div className="ml-1 flex h-10 flex-1 overflow-hidden rounded-full">
          <button
            type="button"
            onClick={onAddToCart}
            className="flex-1 bg-[#e8f1fe] text-[14px] font-medium text-primary active:bg-[#d8e7fd]"
          >
            加入购物车
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            className="flex-1 bg-primary text-[14px] font-medium text-primary-foreground active:opacity-90"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  )
}
