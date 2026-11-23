'use client'

import { Building2, Dna, Phone } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { SectionHeading } from '@/components/mini/section-heading'

const APP_VERSION = '1.6.2'
const COMPANY_NAME = '长沙都正生物科技股份有限公司'
const SERVICE_PHONE = '0731-89908530'

const ABOUT_ICONS: Record<string, string> = {
  'about-intro': '/images/icons/sec-intro.png',
  'about-company': '/images/icons/sec-company.png',
}

function SectionTitle({ id, children }: { id: string; children: string }) {
  return <SectionHeading id={id} title={children} as="h3" icon={ABOUT_ICONS[id]} />
}

export function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <SubPage title="关于我们" titleId="about-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:none]">
        <section aria-label="品牌介绍" className="bg-brand-hero px-4 pb-4 pt-6 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Dna className="size-9" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-headline font-semibold tracking-wide text-foreground">DRUGENE</h2>
          <p className="mt-1 text-caption text-muted-foreground">辅助临床精准用药助手</p>
          <p className="mt-1 text-caption tabular-nums text-muted-foreground">版本 V{APP_VERSION}</p>
        </section>

        <div className="space-y-2.5 px-3">
          <section aria-labelledby="about-intro" className="rounded-2xl bg-white p-3.5">
            <SectionTitle id="about-intro">小程序介绍</SectionTitle>
            <p className="mt-2 text-note leading-relaxed text-foreground/80">
              DRUGENE 是长沙都正医学检验有限责任公司基于药物基因数据开发的集药品、基因、检测服务、剂量智控、健康管理、用药提醒、科技前沿、互动问答等于一体的辅助临床精准用药助手。
            </p>
          </section>

          <section aria-labelledby="about-company" className="rounded-2xl bg-white p-3.5">
            <SectionTitle id="about-company">公司简介</SectionTitle>
            <p className="mt-2 text-note leading-relaxed text-foreground/80">
              {COMPANY_NAME}（简称「都正生物」）成立于 2016 年，位于湘江新区，集「产、学、研」于一体，提供临床研究、医药研发信息化、医学检验技术服务，是一家以临床研究为基础、以「数据」沉淀为核心的学术型合同研究组织（Academic CRO）。
            </p>
            <p className="mt-2 text-note leading-relaxed text-foreground/80">
              公司拥有「药物临床评价技术」国家地方联合工程实验室、「复杂基质样本生物分析」湖南省重点实验室等平台，是国家级专精特新「小巨人」企业、「中国研发 CRO 20 强」。旗下长沙都正医学检验有限责任公司专注药物基因组检测、治疗药物监测（TDM）等精准医学服务。
            </p>
          </section>

          <section aria-labelledby="about-contact" className="rounded-2xl bg-white p-3.5">
            <h3 id="about-contact" className="sr-only">
              客服联系电话
            </h3>
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Phone className="size-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-caption text-muted-foreground">客服联系电话</p>
                <p className="mt-0.5 text-title font-semibold tabular-nums text-foreground">{SERVICE_PHONE}</p>
              </div>
              <a
                href={`tel:${SERVICE_PHONE.replace(/-/g, '')}`}
                className="flex h-7 shrink-0 items-center rounded-full bg-primary px-3.5 text-caption font-medium text-primary-foreground"
              >
                拨打
              </a>
            </div>
          </section>

          <footer className="flex flex-col items-center gap-1 pt-2 text-center text-tag text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="size-3" aria-hidden="true" />
              {COMPANY_NAME}
            </span>
            <span>Copyright © 2026 DRUGENE. All rights reserved.</span>
          </footer>
        </div>
      </div>
    </SubPage>
  )
}
