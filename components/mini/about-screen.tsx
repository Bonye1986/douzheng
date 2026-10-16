'use client'

import { useState } from 'react'
import {
  Award,
  Building2,
  Check,
  ChevronRight,
  Copy,
  Dna,
  FlaskConical,
  Mail,
  MapPin,
  Microscope,
  Phone,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'

const APP_VERSION = '1.6.2'

const stats = [
  { value: '120+', label: '覆盖药物' },
  { value: '86', label: '检测位点' },
  { value: '30万+', label: '服务用户' },
  { value: '7-10', label: '出报告(工作日)' },
]

const strengths: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Microscope, title: '自建医学检验实验室', desc: '持有《医疗机构执业许可证》，全流程质控' },
  { icon: Dna, title: '权威指南解读', desc: '依据 CPIC、DPWG 与国内专家共识给出用药建议' },
  { icon: ShieldCheck, title: '隐私安全', desc: '样本去标识化管理，数据加密存储，未经授权不对外提供' },
]

const certificates = ['CAP 能力验证', 'ISO 15189', '国家临检中心室间质评', '等保三级']

const milestones = [
  { year: '2026', text: '上线 AI 报告解读与用药提醒服务' },
  { year: '2024', text: '儿童安全用药检测项目上线，合作机构超 600 家' },
  { year: '2021', text: '通过 ISO 15189 医学实验室认可' },
  { year: '2018', text: '药问基因成立，专注药物基因组学检测' },
]

const contacts: { key: string; icon: LucideIcon; label: string; value: string; action: 'call' | 'copy' }[] = [
  { key: 'phone', icon: Phone, label: '客服热线', value: '400-820-6688', action: 'call' },
  { key: 'mail', icon: Mail, label: '商务合作', value: 'bd@yaowengene.com', action: 'copy' },
  { key: 'addr', icon: MapPin, label: '公司地址', value: '上海市浦东新区张江高科技园区科苑路 88 号', action: 'copy' },
]

const legalLinks = ['用户协议', '隐私政策', '检测知情同意书', '营业执照与资质']

export function AboutScreen({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState<string | null>(null)
  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'latest'>('idle')

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
  }

  const handleCheckUpdate = () => {
    if (updateState === 'checking') return
    setUpdateState('checking')
    setTimeout(() => setUpdateState('latest'), 1000)
  }

  return (
    <SubPage title="关于我们" titleId="about-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:none]">
        {/* 品牌头部 */}
        <section aria-label="品牌介绍" className="bg-gradient-to-b from-[#d6e7ff] to-[#f4f8fe] px-4 pb-4 pt-6 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Dna className="size-9" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-[20px] font-semibold text-foreground">药问基因</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">用药前查基因，让每一次用药更精准</p>
          <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">版本 V{APP_VERSION}</p>
        </section>

        <div className="space-y-2.5 px-3">
          {/* 数据概览 */}
          <ul aria-label="平台数据" className="grid grid-cols-4 rounded-2xl bg-white py-3.5">
            {stats.map((s) => (
              <li key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="text-[17px] font-semibold tabular-nums text-primary">{s.value}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </li>
            ))}
          </ul>

          {/* 公司简介 */}
          <section aria-labelledby="about-intro" className="rounded-2xl bg-white p-3.5">
            <h3 id="about-intro" className="text-[15px] font-semibold text-foreground">
              公司简介
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">
              药问基因是一家专注药物基因组学的精准医疗服务平台。我们通过检测与药物代谢、疗效和不良反应相关的基因位点，结合临床用药指南，为用户和医生提供个体化的用药参考，帮助减少“试药”过程，降低用药风险。
            </p>
          </section>

          {/* 核心优势 */}
          <section aria-labelledby="about-strengths" className="rounded-2xl bg-white p-3.5">
            <h3 id="about-strengths" className="text-[15px] font-semibold text-foreground">
              核心优势
            </h3>
            <ul className="mt-3 space-y-3">
              {strengths.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-primary">
                    <s.icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{s.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 资质认证 */}
          <section aria-labelledby="about-certs" className="rounded-2xl bg-white p-3.5">
            <h3 id="about-certs" className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
              资质认证
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {certificates.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-1.5 rounded-lg bg-[#f4f8fe] px-2.5 py-2 text-[12px] text-foreground"
                >
                  <Award className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          {/* 发展历程 */}
          <section aria-labelledby="about-history" className="rounded-2xl bg-white p-3.5">
            <h3 id="about-history" className="text-[15px] font-semibold text-foreground">
              发展历程
            </h3>
            <ol className="mt-3">
              {milestones.map((m, i) => (
                <li key={m.year} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 size-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-primary ring-4 ring-primary/15' : 'bg-primary/40'}`}
                      aria-hidden="true"
                    />
                    {i < milestones.length - 1 && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
                  </div>
                  <div className="pb-3.5">
                    <p className="text-[13px] font-semibold tabular-nums text-foreground">{m.year}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{m.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 联系我们 */}
          <section aria-labelledby="about-contact" className="rounded-2xl bg-white px-3.5 pt-3.5">
            <h3 id="about-contact" className="text-[15px] font-semibold text-foreground">
              联系我们
            </h3>
            <ul className="mt-1 divide-y divide-border">
              {contacts.map((c) => {
                const isCopied = copied === c.key
                return (
                  <li key={c.key} className="flex items-center gap-3 py-3">
                    <c.icon className="size-[18px] shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-muted-foreground">{c.label}</p>
                      <p className="mt-0.5 text-[13px] text-foreground">{c.value}</p>
                    </div>
                    {c.action === 'call' ? (
                      <a
                        href={`tel:${c.value.replace(/-/g, '')}`}
                        className="flex h-7 shrink-0 items-center rounded-full bg-primary px-3 text-[12px] font-medium text-primary-foreground"
                      >
                        拨打
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCopy(c.key, c.value)}
                        className={`flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 text-[12px] ${
                          isCopied ? 'border-primary/30 bg-[#eef5ff] text-primary' : 'border-border text-foreground'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="size-3.5" aria-hidden="true" />
                        ) : (
                          <Copy className="size-3.5" aria-hidden="true" />
                        )}
                        {isCopied ? '已复制' : '复制'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="pb-3 text-[11px] text-muted-foreground">客服时间：每天 9:00–21:00（节假日不休）</p>
          </section>

          {/* 协议与资质、版本 */}
          <section aria-label="协议与版本" className="rounded-2xl bg-white px-3.5">
            <ul className="divide-y divide-border">
              {legalLinks.map((l) => (
                <li key={l}>
                  <button type="button" className="flex w-full items-center justify-between py-3 text-left">
                    <span className="text-[13px] text-foreground">{l}</span>
                    <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={handleCheckUpdate}
                  className="flex w-full items-center justify-between py-3 text-left"
                  aria-live="polite"
                >
                  <span className="text-[13px] text-foreground">检查更新</span>
                  <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                    {updateState === 'checking' && (
                      <>
                        <RefreshCw className="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
                        检查中…
                      </>
                    )}
                    {updateState === 'latest' && (
                      <>
                        <Check className="size-3.5 text-primary" aria-hidden="true" />
                        已是最新版本
                      </>
                    )}
                    {updateState === 'idle' && (
                      <>
                        <span className="tabular-nums">V{APP_VERSION}</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </span>
                </button>
              </li>
            </ul>
          </section>

          <footer className="flex flex-col items-center gap-1 pt-2 text-center text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="size-3" aria-hidden="true" />
              上海药问基因科技有限公司
            </span>
            <span className="flex items-center gap-1">
              <FlaskConical className="size-3" aria-hidden="true" />
              沪ICP备2018012345号-1
            </span>
            <span>Copyright © 2018-2026 Yaowen Gene. All rights reserved.</span>
          </footer>
        </div>
      </div>
    </SubPage>
  )
}
