'use client'

import { useState } from 'react'
import { Check, ChevronRight, CircleCheck, MapPin, PackageCheck, Truck, X } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { regionText, savedAddresses } from '@/components/mini/address-manage-screen'
import { cn } from '@/lib/utils'

export function SendSampleScreen({
  orderNo,
  examinees,
  site,
  onBack,
  onSubmitted,
}: {
  orderNo: string
  examinees: string
  /** 定点采样订单：取件地址固定为采样机构地址，不可更换 */
  site?: { name: string; address: string; contact?: string; phone?: string }
  onBack: () => void
  onSubmitted: (summary: { address: string }) => void
}) {
  const [addressId, setAddressId] = useState(
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id,
  )
  const [picking, setPicking] = useState(false)
  const [done, setDone] = useState(false)
  const saved = savedAddresses.find((a) => a.id === addressId)
  const address = site
    ? {
        title: site.name,
        subtitle: [site.contact, site.phone].filter(Boolean).join(' '),
        detail: site.address,
      }
    : saved
      ? { title: saved.name, subtitle: saved.phone, detail: `${regionText(saved.region)} ${saved.street}` }
      : undefined

  if (done && address) {
    return (
      <SubPage title="寄样结果" titleId="send-sample-result-title" onBack={onBack}>
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-6 pt-10">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CircleCheck className="size-9" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-heading font-semibold text-foreground">提交成功</h2>
          <p className="mt-1.5 text-center text-note leading-5 text-muted-foreground">
            顺丰快递员将尽快上门取件，请提前封装好样本
          </p>
          <dl className="mt-6 w-full space-y-2.5 rounded-2xl bg-white p-4 text-note">
            {[
              ['订单编号', orderNo],
              ['受检人', examinees],
              ['取件地址', `${address.title} ${address.subtitle}`.trim()],
              ['', address.detail],
              ['承运快递', '顺丰速运（运费由都正承担）'],
            ].map(([k, v], i) => (
              <div key={i} className="flex gap-3">
                <dt className="w-[68px] shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 flex-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
          <button
            type="button"
            onClick={onBack}
            className="h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90"
          >
            返回订单
          </button>
        </div>
      </SubPage>
    )
  }

  return (
    <SubPage title="上门取样" titleId="send-sample-title" onBack={onBack}>
      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        <section className="flex items-center gap-3 rounded-2xl bg-primary/10 p-3.5">
          <Truck className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-caption leading-[18px] text-foreground">
            提交后顺丰快递员将上门取走样本，并直接送往实验室，全程免运费。
          </p>
        </section>

        <section aria-labelledby="pickup-address-label" className="rounded-2xl bg-white p-3.5">
          <h2 id="pickup-address-label" className="text-title font-semibold text-foreground">
            取件地址
          </h2>
          {site && address ? (
            <div className="mt-2.5 flex w-full items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <MapPin className="size-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-body font-medium text-foreground">
                  {address.title}
                  <span className="rounded bg-secondary px-1.5 py-px text-tag font-normal text-primary">采样机构</span>
                </span>
                {address.subtitle && (
                  <span className="mt-0.5 block text-caption leading-[18px] text-foreground">
                    联系电话：{address.subtitle}
                  </span>
                )}
                <span className="mt-0.5 block text-caption leading-[18px] text-muted-foreground">{address.detail}</span>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="mt-2.5 flex w-full items-center gap-3 text-left"
              aria-label={address ? `取件地址：${address.detail}，点击更换` : '选择取件地址'}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <MapPin className="size-4.5" aria-hidden="true" />
              </span>
              {address ? (
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-medium text-foreground">
                    {address.title}
                    <span className="ml-2 font-normal tabular-nums text-muted-foreground">{address.subtitle}</span>
                  </span>
                  <span className="mt-0.5 block text-caption leading-[18px] text-muted-foreground">{address.detail}</span>
                </span>
              ) : (
                <span className="flex-1 text-body text-muted-foreground">请从地址管理中选择取件地址</span>
              )}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          )}
          {site && (
            <p className="mt-2 text-caption leading-[18px] text-muted-foreground">
              定点采样订单由快递员到采样机构取件，无需选择地址
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-3.5">
          <h2 className="flex items-center gap-1.5 text-title font-semibold text-foreground">
            <PackageCheck className="size-4 text-primary" aria-hidden="true" />
            寄样前请确认
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-caption leading-[18px] text-muted-foreground">
            <li>样本管已拧紧并贴好受检人标签</li>
            <li>样本放入密封袋后装回采样盒</li>
            <li>采样后 72 小时内寄出，避免高温暴晒</li>
          </ul>
        </section>
      </div>

      <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <button
          type="button"
          disabled={!address}
          onClick={() => {
            if (!address) return
            onSubmitted({ address: address.detail })
            setDone(true)
          }}
          className="h-10 w-full rounded-full bg-primary text-body font-medium text-primary-foreground active:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
        >
          提交
        </button>
      </div>

      {picking && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45" onClick={() => setPicking(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pick-address-title"
            className="max-h-[70%] rounded-t-2xl bg-white pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <h2 id="pick-address-title" className="text-title font-semibold text-foreground">
                选择取件地址
              </h2>
              <button type="button" onClick={() => setPicking(false)} aria-label="关闭">
                <X className="size-5 text-muted-foreground" aria-hidden="true" />
              </button>
            </div>
            <ul role="radiogroup" aria-labelledby="pick-address-title" className="space-y-2 overflow-y-auto px-3">
              {savedAddresses.map((a) => {
                const selected = a.id === addressId
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setAddressId(a.id)
                        setPicking(false)
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border p-3 text-left',
                        selected ? 'border-primary bg-primary/5' : 'border-border',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-body font-medium text-foreground">{a.name}</span>
                          <span className="text-caption tabular-nums text-muted-foreground">{a.phone}</span>
                          {a.isDefault && (
                            <span className="rounded bg-primary px-1.5 py-px text-tag text-primary-foreground">默认</span>
                          )}
                          {a.tag && (
                            <span className="rounded bg-secondary px-1.5 py-px text-tag text-primary">{a.tag}</span>
                          )}
                        </span>
                        <span className="mt-1 block text-caption leading-[18px] text-muted-foreground">
                          {regionText(a.region)} {a.street}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
                          selected ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c4ccda]',
                        )}
                        aria-hidden="true"
                      >
                        {selected && <Check className="size-3" strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </SubPage>
  )
}
