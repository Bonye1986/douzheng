'use client'

import { useState } from 'react'
import { Building2, Check, Copy, FlaskConical, House, Phone, Truck } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

export type LogisticsDirection = 'outbound' | 'return'

type TrackEvent = { time: string; title: string; desc: string }

const lab = { name: '都正医学检验实验室', address: '上海市浦东新区张江高科技园区蔡伦路 780 号' }
const home = { name: '王建国', address: '上海市徐汇区漕溪北路 398 号 汇智大厦 12 楼' }

const tracks: Record<LogisticsDirection, { trackingNo: string; label: string; eta: string; events: TrackEvent[] }> = {
  outbound: {
    trackingNo: 'SF1407 3382 9015',
    label: '采样盒运输中',
    eta: '预计明日 12:00 前送达',
    events: [
      { time: '10-14 08:12', title: '派送中', desc: '【上海徐汇漕河泾营业点】快递员 刘师傅（138****2207）正在为您派件' },
      { time: '10-14 05:36', title: '运输中', desc: '快件已到达【上海徐汇集散中心】' },
      { time: '10-13 21:48', title: '运输中', desc: '快件已从【上海浦东转运中心】发出，下一站【上海徐汇集散中心】' },
      { time: '10-13 18:20', title: '已揽收', desc: '顺丰速运已收取快件，揽收网点【上海张江营业点】' },
      { time: '10-13 16:05', title: '已发货', desc: '实验室已打包采样盒并交付快递' },
    ],
  },
  return: {
    trackingNo: 'SF1428 6650 3321',
    label: '样本回寄中',
    eta: '预计 10-12 送达实验室',
    events: [
      { time: '10-11 07:40', title: '运输中', desc: '快件已到达【上海浦东转运中心】，即将派送至实验室' },
      { time: '10-10 22:15', title: '运输中', desc: '快件已从【上海徐汇集散中心】发出' },
      { time: '10-10 15:32', title: '已揽收', desc: '快递员 刘师傅（138****2207）已上门取件，样本已密封装箱' },
      { time: '10-10 09:18', title: '已预约', desc: '已预约顺丰上门取件，取件时间 10-10 14:00-16:00' },
    ],
  },
}

export function LogisticsScreen({
  direction,
  orderNo,
  trackingNo: trackingNoProp,
  site,
  onBack,
}: {
  direction: LogisticsDirection
  orderNo: string
  trackingNo?: string
  site?: { name: string; address: string }
  onBack: () => void
}) {
  const track = tracks[direction]
  const trackingNo = trackingNoProp ?? track.trackingNo
  const [copied, setCopied] = useState(false)
  const sender = site ?? home
  const from = direction === 'outbound' ? lab : sender
  const to = direction === 'outbound' ? home : lab

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trackingNo.replace(/\s/g, ''))
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <SubPage title="物流详情" titleId="logistics-title" onBack={onBack}>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3 pb-6 [scrollbar-width:none]">
        <section className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <p className="flex items-center gap-1.5 text-[17px] font-semibold">
            <Truck className="size-4" aria-hidden="true" />
            {track.label}
          </p>
          <p className="mt-1 text-[12px] text-primary-foreground/85">{track.eta}</p>
        </section>

        <section aria-label="运单信息" className="rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">顺丰速运</p>
              <p className="mt-0.5 text-[12px] tabular-nums text-muted-foreground">运单号 SF{trackingNo.replace(/^SF/, '')}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={copy}
                className="flex h-7 items-center gap-1 rounded-full border border-border px-3 text-[12px] text-foreground"
              >
                {copied ? <Check className="size-3.5 text-primary" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                {copied ? '已复制' : '复制'}
              </button>
              <a
                href="tel:95338"
                aria-label="拨打顺丰客服 95338"
                className="flex size-7 items-center justify-center rounded-full border border-border text-foreground"
              >
                <Phone className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
          <ol className="mt-3 space-y-2.5 border-t border-border pt-3">
            {[
              { tag: '发', icon: direction === 'outbound' ? FlaskConical : site ? Building2 : House, ...from },
              { tag: '收', icon: direction === 'outbound' ? House : FlaskConical, ...to },
            ].map((p) => (
              <li key={p.tag} className="flex gap-2.5">
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
                    p.tag === '发' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground',
                  )}
                >
                  {p.tag}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-[12px] leading-[18px] text-muted-foreground">{p.address}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="logistics-track" className="rounded-2xl bg-white p-4">
          <h2 id="logistics-track" className="text-[14px] font-semibold text-foreground">
            物流轨迹
          </h2>
          <ol className="mt-3">
            {track.events.map((e, i) => {
              const latest = i === 0
              return (
                <li key={`${e.time}-${e.title}`} className="flex gap-3">
                  <div className="flex w-4 flex-col items-center">
                    <span
                      className={cn(
                        'mt-1 shrink-0 rounded-full',
                        latest ? 'size-3 bg-primary ring-4 ring-primary/15' : 'size-2 bg-[#cfd8e6]',
                      )}
                      aria-hidden="true"
                    />
                    {i < track.events.length - 1 && <span className="mt-1 w-px flex-1 bg-[#e3eaf4]" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <p className="flex items-baseline justify-between gap-2">
                      <span className={cn('text-[13px] font-medium', latest ? 'text-primary' : 'text-foreground')}>
                        {e.title}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{e.time}</span>
                    </p>
                    <p className={cn('mt-0.5 text-[12px] leading-[18px]', latest ? 'text-foreground' : 'text-muted-foreground')}>
                      {e.desc}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="border-t border-border pt-3 text-[11px] tabular-nums text-muted-foreground">关联订单 {orderNo}</p>
        </section>
      </div>
    </SubPage>
  )
}
