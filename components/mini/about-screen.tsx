'use client'

import {
  BellRing,
  Building2,
  ClipboardList,
  Database,
  Dna,
  FileHeart,
  FileText,
  FlaskConical,
  Gauge,
  Lightbulb,
  MessagesSquare,
  Newspaper,
  Phone,
  Rocket,
  Search,
  type LucideIcon,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { SectionHeading } from '@/components/mini/section-heading'

const APP_VERSION = '1.6.2'
const COMPANY_NAME = '长沙都正生物科技股份有限公司'
const SERVICE_PHONE = '0731-89908530'

type Module = {
  icon: LucideIcon
  title: string
  desc?: string
  children?: { title: string; desc: string }[]
}

const modules: Module[] = [
  {
    icon: Search,
    title: '药物基因搜索',
    desc: '可对药品或基因进行检索，搜索对应药品的说明书信息、基因位点信息及相关用药、检测建议。',
  },
  { icon: FlaskConical, title: '检测服务', desc: '可提供详细、全面、多样化、个性化的基因检测服务。' },
  {
    icon: Gauge,
    title: '剂量智控',
    children: [
      {
        title: '剂量模型',
        desc: '异烟肼片动态有效区间：基于 PopPK（群体药代动力学）模型库实现异烟肼片给药后血药浓度模拟，辅助临床 TDM（治疗药物监测）有效性判断。',
      },
      { title: '基因用药', desc: '根据个体基因型信息，为您提供药物选择、剂量调整等个体化用药建议。' },
      {
        title: '医学计算器',
        desc: '涵盖体重指数（BMI）、体表面积（BSA）、基础代谢率（BMR）计算，以及小儿药物剂量的多种计算方式（按年龄、体重、体表面积），为用户精准计算用药相关医学指标，助力科学、合理用药，守护用药健康防线。',
      },
    ],
  },
  {
    icon: FileText,
    title: '我的报告',
    desc: '可提供检测人当前所有检测报告的用药指导情况，通过直观标识（如警惕不良反应、疗效不足等），针对多类疾病用药给出更换药物、调整剂量等指导建议，同时提供所有检测报告的预览功能。',
  },
  {
    icon: ClipboardList,
    title: '我的订单',
    desc: '支持查询所有订单详情，已完成订单可预览、下载报告，方便用户查询、管理基因检测服务订单。',
  },
  {
    icon: FileHeart,
    title: '健康管理',
    desc: '支持用户上传第三方检测机构或医院的检查报告单、处方单或病历单，助力用户便捷管理个人健康报告资料。',
  },
  {
    icon: BellRing,
    title: '用药提醒',
    desc: '支持用户自行添加药品，设置如用药频次、每次剂量、用药方式等用药信息，设定打卡起始时间及每日打卡规则，还可对已添加的用药提醒执行关闭打卡、修改、查看打卡记录、删除等操作，助力用户规范用药流程，通过定时提醒保障服药的规律性与依从性。',
  },
  {
    icon: Rocket,
    title: '科技前沿',
    desc: '专注药物基因组学领域的研究与应用进展，通过定期发布资讯，为用户传递专业、及时的行业动态，助力用户紧跟药物基因组学前沿趋势，拓宽在精准医疗等方面的认知视野。',
  },
  { icon: Newspaper, title: '知识科普', desc: '用药及健康类新闻，助您及时了解健康信息。' },
  {
    icon: MessagesSquare,
    title: '互动问答',
    desc: '聚焦精准用药与健康用药领域，以问答形式持续产出内容。通过抛出贴近生活的用药疑问，引导用户思考、参与互动，助力大家提升科学用药认知，筑牢安全用药知识防线，实现知识获取与互动体验的融合。',
  },
]

function SectionTitle({ id, icon: Icon, children }: { id: string; icon: LucideIcon; children: string }) {
  return (
    <SectionHeading id={id} title={children} as="h3" />
  )
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
            <SectionTitle id="about-intro" icon={Lightbulb}>
              小程序介绍
            </SectionTitle>
            <p className="mt-2 text-note leading-relaxed text-foreground/80">
              DRUGENE 是长沙都正医学检验有限责任公司基于药物基因数据开发的集药品、基因、检测服务、剂量智控、健康管理、用药提醒、科技前沿、互动问答等于一体的辅助临床精准用药助手。
            </p>
          </section>

          <section aria-labelledby="about-source" className="rounded-2xl bg-white p-3.5">
            <SectionTitle id="about-source" icon={Database}>
              数据来源
            </SectionTitle>
            <p className="mt-2 text-note leading-relaxed text-foreground/80">
              收录国内外最新临床指南、专家共识、大型临床研究等权威资料中有关基因、药物、疾病以及它们之间的药物基因组学关系的数据，可为人们提供科学、权威、前沿、实用的安全用药知识，辅助临床精准用药。
            </p>
          </section>

          <section aria-labelledby="about-modules" className="rounded-2xl bg-white p-3.5">
            <SectionTitle id="about-modules" icon={Gauge}>
              功能模块
            </SectionTitle>
            <ul className="mt-3 space-y-3.5">
              {modules.map((m) => (
                <li key={m.title} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <m.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-note font-semibold text-foreground">{m.title}</p>
                    {m.desc && <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">{m.desc}</p>}
                    {m.children && (
                      <ul className="mt-1.5 space-y-1.5 rounded-lg bg-background p-2.5">
                        {m.children.map((c) => (
                          <li key={c.title} className="flex gap-1.5">
                            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                            <p className="text-caption leading-relaxed text-muted-foreground">
                              <span className="font-medium text-foreground">{c.title}：</span>
                              {c.desc}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3.5 rounded-lg bg-background px-3 py-2.5 text-caption leading-relaxed text-foreground/80">
              DRUGENE 会不定期推更新基因、药物数据和逐步完善、��加其他新功能，敬请期待。
            </p>
          </section>

          <section aria-labelledby="about-company" className="rounded-2xl bg-white p-3.5">
            <SectionTitle id="about-company" icon={Building2}>
              公司简介
            </SectionTitle>
            <p className="mt-2 text-note leading-relaxed text-foreground/80">
              {COMPANY_NAME}（简称「都正生物」）成立于 2016 年，位于湘江新区，集「产、学、研」于一体，提供临床研究、医药研发信息化、医学检验技术服务，是一家以临床研究为基础、以「数据」沉淀为核心的学术型合同研究组织（Academic CRO）。
            </p>
            <p className="mt-2 text-note leading-relaxed text-foreground/80">
              公司拥有「药物临床评价技术」国家地方联合工程实验室、「复杂基质样本生物分析」湖南省重点实验室等平台，是国家级专精特新「小巨人」企业、「中国研发 CRO 20 强」。旗下长沙都正医学检验有限责任公司专注药物基因组检测、治疗药物监测（TDM）等精准医学服务。
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: '员工', value: '630+' },
                { label: '外聘专家', value: '67' },
                { label: '合作医院', value: '240+' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-background py-2">
                  <dt className="text-caption text-muted-foreground">{s.label}</dt>
                  <dd className="mt-0.5 text-title font-semibold tabular-nums text-primary">{s.value}</dd>
                </div>
              ))}
            </dl>
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
