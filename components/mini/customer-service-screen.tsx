'use client'

import { useEffect, useRef, useState } from 'react'
import { ClipboardList, FileText, Headphones, ImageIcon, Mic, Plus, Smile, UserRound, X } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'

type OrderCard = { kind: 'order'; no: string; product: string; status: string; amount: string }
type Message =
  | { id: string; from: 'agent' | 'user'; kind: 'text'; text: string; time?: string }
  | ({ id: string; from: 'user'; time?: string } & OrderCard)
  | { id: string; from: 'system'; kind: 'notice'; text: string }

const quickQuestions = ['如何采集唾液样本？', '报告多久能出？', '如何申请退款？', '样本寄回地址', '科研同意书怎么撤回？']

const quickAnswers: Record<string, string> = {
  '如何采集唾液样本？':
    '采样前 30 分钟请勿进食、饮水、吸烟。打开采样管后将唾液吐至刻度线（约 2ml），旋紧盖子并轻摇 5 次即可。详细图文可在「我的 · 使用指南」查看。',
  '报告多久能出？': '实验室收到样本后一般 7–10 个工作日出具报告，出报告后会第一时间短信通知您。',
  '如何申请退款？': '未寄样的订单可在「我的订单」中直接申请退款；已寄样订单请提供订单号，我帮您核实处理。',
  '样本寄回地址': '请使用采样盒内附带的顺丰回寄单寄回，运费已预付，无需填写地址，预约顺丰上门取件即可。',
  '科研同意书怎么撤回？': '进入「我的 · 授权与同意书 · 科研知情同意书」，找到对应检测人点击「撤回授权」，经人脸核验后即可完成撤回。',
}

const recentOrder: OrderCard = {
  kind: 'order',
  no: 'DZ202610081523',
  product: '儿童安全用药基因检测',
  status: '检测中',
  amount: '¥1,280.00',
}

const initialMessages: Message[] = [
  { id: 'n1', from: 'system', kind: 'notice', text: '已接入人工客服 · 工作时间 9:00–18:00' },
  {
    id: 'm1',
    from: 'agent',
    kind: 'text',
    time: '10:24',
    text: '您好，我是都正客服小正，很高兴为您服务！请问有什么可以帮您？您可以直接描述问题，或点击下方常见问题。',
  },
]

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function Avatar({ from }: { from: 'agent' | 'user' }) {
  return from === 'agent' ? (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <Headphones className="size-5" aria-hidden="true" />
    </span>
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#c9d6ea] text-white">
      <UserRound className="size-5" aria-hidden="true" />
    </span>
  )
}

function OrderBubble({ order }: { order: OrderCard }) {
  return (
    <div className="w-56 rounded-md bg-white p-3 text-left">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <ClipboardList className="size-3.5" aria-hidden="true" />
        订单咨询
      </p>
      <p className="mt-1.5 text-[14px] font-medium text-foreground">{order.product}</p>
      <dl className="mt-1.5 space-y-0.5 text-[12px] text-muted-foreground">
        <div className="flex justify-between">
          <dt>订单号</dt>
          <dd className="tabular-nums">{order.no}</dd>
        </div>
        <div className="flex justify-between">
          <dt>状态</dt>
          <dd className="text-primary">{order.status}</dd>
        </div>
        <div className="flex justify-between">
          <dt>实付</dt>
          <dd className="tabular-nums text-foreground">{order.amount}</dd>
        </div>
      </dl>
    </div>
  )
}

export function CustomerServiceScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [orderTipOpen, setOrderTipOpen] = useState(true)
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const agentReply = (text: string) => {
    setTyping(true)
    timers.current.push(
      window.setTimeout(() => {
        setTyping(false)
        setMessages((m) => [...m, { id: `a${Date.now()}`, from: 'agent', kind: 'text', text, time: nowTime() }])
      }, 1200),
    )
  }

  const sendText = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    setMessages((m) => [...m, { id: `u${Date.now()}`, from: 'user', kind: 'text', text, time: nowTime() }])
    setDraft('')
    agentReply(quickAnswers[text] ?? '收到，正在为您查询，请稍候。如需进一步核实，请提供订单号或检测人姓名。')
  }

  const sendOrder = () => {
    setMessages((m) => [...m, { id: `o${Date.now()}`, from: 'user', time: nowTime(), ...recentOrder }])
    setOrderTipOpen(false)
    setPanelOpen(false)
    agentReply('已收到您的订单，该样本已于 10 月 10 日送达实验室，目前正在检测中，预计 10 月 18 日前出具报告。')
  }

  return (
    <SubPage title="都正客服" titleId="customer-service-title" onBack={onBack}>
      <div className="flex min-h-0 flex-1 flex-col bg-[#ededed]">
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:none]" aria-live="polite">
          <ul className="flex flex-col gap-4">
            {messages.map((msg) => {
              if (msg.from === 'system') {
                return (
                  <li key={msg.id} className="self-center rounded bg-black/5 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {msg.text}
                  </li>
                )
              }
              const mine = msg.from === 'user'
              return (
                <li key={msg.id} className={`flex items-start gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                  <Avatar from={msg.from} />
                  <div className={`flex max-w-[72%] flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                    {msg.time && <span className="text-[10px] tabular-nums text-muted-foreground">{msg.time}</span>}
                    {msg.kind === 'order' ? (
                      <OrderBubble order={msg} />
                    ) : (
                      <p
                        className={`rounded-md px-3 py-2 text-[14px] leading-relaxed ${
                          mine ? 'bg-[#95ec69] text-[#111]' : 'bg-white text-foreground'
                        }`}
                      >
                        {msg.text}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
            {typing && (
              <li className="flex items-start gap-2">
                <Avatar from="agent" />
                <p className="rounded-md bg-white px-3 py-2 text-[13px] text-muted-foreground">对方正在输入…</p>
              </li>
            )}
          </ul>
        </div>

        {orderTipOpen && (
          <div className="mx-3 mb-2 flex items-center gap-2.5 rounded-lg bg-white p-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#eef5ff] text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-foreground">您可能想咨询：{recentOrder.product}</p>
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {recentOrder.no} · {recentOrder.status}
              </p>
            </div>
            <button
              type="button"
              onClick={sendOrder}
              className="h-7 shrink-0 rounded-full bg-primary px-3 text-[12px] font-medium text-primary-foreground"
            >
              发送订单
            </button>
            <button
              type="button"
              onClick={() => setOrderTipOpen(false)}
              aria-label="关闭订单推荐"
              className="flex size-6 items-center justify-center text-muted-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div
          role="list"
          aria-label="常见问题"
          className="flex gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none]"
        >
          {quickQuestions.map((q) => (
            <button
              key={q}
              role="listitem"
              type="button"
              onClick={() => sendText(q)}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="shrink-0 border-t border-black/5 bg-[#f7f7f7] pb-5">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendText(draft)
            }}
            className="flex items-center gap-2 px-2.5 py-2"
          >
            <button type="button" aria-label="语音输入" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/70 text-foreground">
              <Mic className="size-4" aria-hidden="true" />
            </button>
            <label htmlFor="cs-input" className="sr-only">
              输入消息
            </label>
            <input
              id="cs-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setPanelOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
              }}
              enterKeyHint="send"
              className="h-9 min-w-0 flex-1 rounded-md bg-white px-3 text-[14px] text-foreground outline-none"
            />
            <button type="button" aria-label="表情" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/70 text-foreground">
              <Smile className="size-4" aria-hidden="true" />
            </button>
            {draft.trim() ? (
              <button type="submit" className="h-8 shrink-0 rounded-md bg-[#07c160] px-3 text-[13px] font-medium text-white">
                发送
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                aria-label="更多功能"
                aria-expanded={panelOpen}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/70 text-foreground"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            )}
          </form>

          {panelOpen && (
            <ul className="grid grid-cols-4 gap-y-4 border-t border-black/5 px-4 pb-2 pt-4">
              {[
                { label: '图片', icon: ImageIcon, onClick: () => setPanelOpen(false) },
                { label: '发送订单', icon: ClipboardList, onClick: sendOrder },
                { label: '发送报告', icon: FileText, onClick: () => setPanelOpen(false) },
              ].map((item) => (
                <li key={item.label}>
                  <button type="button" onClick={item.onClick} className="flex w-full flex-col items-center gap-1.5">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-white text-foreground">
                      <item.icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SubPage>
  )
}
