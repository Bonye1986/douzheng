'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  BookOpen,
  ChevronRight,
  Clock,
  Eye,
  FileSearch,
  Headphones,
  Info,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  TestTube,
  ThumbsDown,
  ThumbsUp,
  Truck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'

export type GuideView = 'list' | 'detail'

type Category = 'all' | 'order' | 'sample' | 'report' | 'privacy'

type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'steps'; items: string[] }
  | { type: 'tip'; text: string }

type Article = {
  id: string
  category: Exclude<Category, 'all'>
  title: string
  summary: string
  icon: LucideIcon
  minutes: number
  views: number
  updated: string
  cover?: string
  content: Block[]
}

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'order', label: '下单购买' },
  { key: 'sample', label: '采样寄回' },
  { key: 'report', label: '查看报告' },
  { key: 'privacy', label: '授权隐私' },
]

const categoryLabel: Record<Exclude<Category, 'all'>, string> = {
  order: '下单购买',
  sample: '采样寄回',
  report: '查看报告',
  privacy: '授权隐私',
}

const articles: Article[] = [
  {
    id: 'saliva',
    category: 'sample',
    title: '口腔拭子自采样操作指南',
    summary: '采样前 30 分钟禁食禁水，按步骤刮取两侧口腔黏膜，正确封装后寄回。',
    icon: TestTube,
    minutes: 3,
    views: 12860,
    updated: '2026-10-10',
    cover: '/images/guide-saliva-sampling.png',
    content: [
      { type: 'p', text: '自采样套装包含采样拭子 2 支、样本管 1 支、样本袋与回寄信封。请在收到套装后 7 天内完成采样并寄回，以保证样本质量。' },
      { type: 'h', text: '采样前准备' },
      { type: 'steps', items: ['采样前 30 分钟内不要进食、饮水、吸烟或嚼口香糖', '用清水漱口 2 次，静待 5 分钟', '洗净双手，核对样本管上的受检人姓名与条码'] },
      { type: 'h', text: '采样步骤' },
      {
        type: 'steps',
        items: [
          '取出拭子，避免手指触碰棉头',
          '将棉头贴住一侧脸颊内侧，上下刮擦 20 次并旋转拭子',
          '换另一支拭子，在另一侧脸颊重复操作',
          '将两支拭子放入样本管，沿折断线折断并拧紧管盖',
        ],
      },
      { type: 'tip', text: '若采样时出现出血、或采样后超过 7 天未寄回，样本可能不合格，平台将通知您免费重采样。' },
      { type: 'h', text: '封装与寄回' },
      { type: 'p', text: '将样本管装入样本袋并密封，放入回寄信封后在「我的订单 · 待采样」点击「预约寄回」，快递员将上门取件，运费由平台承担。' },
    ],
  },
  {
    id: 'order',
    category: 'order',
    title: '如何选择检测项目并下单',
    summary: '按用药场景选择检测项目，一个项目可为多位受检人下单，一人一份。',
    icon: PackageCheck,
    minutes: 2,
    views: 8420,
    updated: '2026-10-06',
    content: [
      { type: 'p', text: '平台提供心血管、精神神经、儿童安全用药等多种用药基因检测项目，可先通过 AI 咨询描述用药情况，获取项目推荐。' },
      { type: 'h', text: '下单流程' },
      {
        type: 'steps',
        items: [
          '在「检测」页选择项目，查看服务详情与检测位点',
          '加入购物车或立即购买，为每个项目选择受检人',
          '选择采样方式：自采样（邮寄套装）或定点采样（到机构采样）',
          '勾选《检测知情同意书》，可选勾选科研知情同意书后提交支付',
        ],
      },
      { type: 'tip', text: '《检测知情同意书》为下单必选项，签署后不可撤回；科研知情同意书为选填，可在下单后签署或撤回。' },
    ],
  },
  {
    id: 'onsite',
    category: 'sample',
    title: '定点采样预约与到店核销',
    summary: '选择附近合作机构，到店出示核销码，由专业人员完成采样。',
    icon: Truck,
    minutes: 2,
    views: 3906,
    updated: '2026-09-28',
    content: [
      { type: 'p', text: '选择定点采样时，下单需指定合作采样机构。支付成功后订单进入「待采样」，并生成到店核销码。' },
      { type: 'steps', items: ['在营业时间内到达所选机构', '向工作人员出示订单核销码与受检人身份证件', '由专业人员完成采样，样本由机构统一寄送实验室'] },
      { type: 'tip', text: '核销码有效期 30 天，过期未核销可在订单中申请改约或退款。' },
    ],
  },
  {
    id: 'report',
    category: 'report',
    title: '如何查看和解读检测报告',
    summary: '报告出具后短信通知，支持 AI 通俗解读与药物分级用药建议。',
    icon: FileSearch,
    minutes: 4,
    views: 10215,
    updated: '2026-10-02',
    content: [
      { type: 'p', text: '实验室收样后约 7–10 个工作日出具报告，出具后将以短信通知，您可在「我的 · 我的报告」查看。' },
      { type: 'h', text: '报告结构' },
      { type: 'steps', items: ['检测概览：受检人信息、检测项目与位点', '用药提示：按「正常使用 / 谨慎使用 / 避免使用」分级', '基因型详情：代谢类型与指南证据来源'] },
      { type: 'tip', text: '报告结果仅供临床参考，请勿自行调整用药，务必在医生指导下使用。' },
      { type: 'p', text: '点击报告中的「AI 解读」，可选择通俗版或专业版，结合受检人信息对具体药物进行问答。' },
    ],
  },
  {
    id: 'privacy',
    category: 'privacy',
    title: '基因数据如何被保护',
    summary: '数据加密存储、最小化使用，科研授权可随时签署撤销书撤回。',
    icon: ShieldCheck,
    minutes: 3,
    views: 5132,
    updated: '2026-09-20',
    content: [
      { type: 'p', text: '您的基因数据与报告采用加密存储，仅用于为您出具检测报告与提供用药解读服务。' },
      { type: 'steps', items: ['未签署科研知情同意书时，数据不会用于任何科研用途', '签署科研授权需通过 e签宝 人脸核验，确保本人意愿', '已授权可在「授权与同意书」签署撤销书，撤回后不再使用'] },
      { type: 'tip', text: '如需注销账号并删除数据，可在「账号设置」中提交申请或联系客服。' },
    ],
  },
  {
    id: 'ai',
    category: 'report',
    title: 'AI 咨询的通俗版与专业版',
    summary: '通俗版用生活化语言解释，专业版展示基因型、代谢类型与证据等级。',
    icon: Sparkles,
    minutes: 2,
    views: 4378,
    updated: '2026-09-15',
    content: [
      { type: 'p', text: 'AI 咨询支持在对话顶部切换通俗版与专业版。关联检测人后，AI 会结合其基本信息与历史报告给出个性化回答。' },
      { type: 'steps', items: ['通俗版：适合普通用户，重点说明能不能用、注意什么', '专业版：适合医生药师，展示基因型、表型与 CPIC / DPWG 指南依据'] },
      { type: 'tip', text: '未关联检测人时，AI 按通用医学知识回答，不代表个体化结论。' },
    ],
  },
]

function formatViews(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString('zh-CN')
}

function ArticleMeta({ article }: { article: Article }) {
  return (
    <span className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-0.5">
        <Clock className="size-3" aria-hidden="true" />
        <span className="tabular-nums">{article.minutes}</span> 分钟
      </span>
      <span className="flex items-center gap-0.5">
        <Eye className="size-3" aria-hidden="true" />
        <span className="tabular-nums">{formatViews(article.views)}</span>
        <span className="sr-only">次阅读</span>
      </span>
    </span>
  )
}

function GuideList({ onOpen }: { onOpen: (id: string) => void }) {
  const [category, setCategory] = useState<Category>('all')
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const q = keyword.trim()
    return articles.filter(
      (a) => (category === 'all' || a.category === category) && (!q || a.title.includes(q) || a.summary.includes(q)),
    )
  }, [category, keyword])

  const featured = category === 'all' && !keyword.trim() ? articles.find((a) => a.cover) : undefined
  const rest = featured ? filtered.filter((a) => a.id !== featured.id) : filtered

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 bg-white px-3 pb-2 pt-1">
        <label className="flex h-9 items-center gap-2 rounded-full bg-[#f2f5fa] px-3">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">搜索指南</span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索采样、报告、授权等问题"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
          {keyword && (
            <button type="button" onClick={() => setKeyword('')} aria-label="清空搜索" className="text-muted-foreground">
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </label>
        <div role="tablist" aria-label="指南分类" className="mt-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {categories.map((c) => {
            const active = c.key === category
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(c.key)}
                className={`h-7 shrink-0 rounded-full px-3 text-[12px] ${
                  active ? 'bg-primary font-medium text-primary-foreground' : 'bg-[#f2f5fa] text-foreground'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3 [scrollbar-width:none]">
        {featured && (
          <button
            type="button"
            onClick={() => onOpen(featured.id)}
            className="block w-full overflow-hidden rounded-2xl bg-white text-left"
          >
            <div className="relative aspect-[16/8] w-full bg-[#eaf2ff]">
              <Image src={featured.cover!} alt="" fill sizes="360px" className="object-cover" />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                新手必读
              </span>
            </div>
            <div className="p-3">
              <h2 className="text-[15px] font-semibold text-foreground">{featured.title}</h2>
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{featured.summary}</p>
              <div className="mt-2">
                <ArticleMeta article={featured} />
              </div>
            </div>
          </button>
        )}

        {rest.length > 0 ? (
          <ul className={`overflow-hidden rounded-2xl bg-white ${featured ? 'mt-2.5' : ''}`} aria-label="指南文章">
            {rest.map((a, i) => (
              <li key={a.id} className={i > 0 ? 'border-t border-[#eef1f6]' : ''}>
                <button type="button" onClick={() => onOpen(a.id)} className="flex w-full items-start gap-3 p-3 text-left">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-primary">
                    <a.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-foreground">{a.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[12px] leading-relaxed text-muted-foreground">
                      {a.summary}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="rounded bg-[#f2f5fa] px-1.5 py-px text-[10px] text-muted-foreground">
                        {categoryLabel[a.category]}
                      </span>
                      <ArticleMeta article={a} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !featured && (
            <div className="flex flex-col items-center px-6 pt-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-[#eaf2ff] text-primary">
                <BookOpen className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-3 text-[14px] font-medium text-foreground">没有找到相关指南</p>
              <p className="mt-1 text-[12px] text-muted-foreground">换个关键词试试，或直接联系客服</p>
            </div>
          )
        )}

        <div className="mt-2.5 flex items-center gap-3 rounded-2xl bg-white p-3">
          <Headphones className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="flex-1 text-[12px] text-muted-foreground">没有找到答案？</p>
          <button type="button" className="h-7 rounded-full border border-primary px-3 text-[12px] text-primary">
            联系客服
          </button>
        </div>
      </div>
    </div>
  )
}

function GuideDetail({ article, onOpen }: { article: Article; onOpen: (id: string) => void }) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const related = articles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 2)
  const more = related.length ? related : articles.filter((a) => a.id !== article.id).slice(0, 2)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none]">
        <article className="bg-white px-4 pb-5 pt-3">
          <span className="rounded bg-[#eaf2ff] px-1.5 py-0.5 text-[11px] text-primary">{categoryLabel[article.category]}</span>
          <h2 className="mt-2 text-[19px] font-semibold leading-snug text-foreground text-balance">{article.title}</h2>
          <div className="mt-2 flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <span>
              更新于 <span className="tabular-nums">{article.updated}</span>
            </span>
            <ArticleMeta article={article} />
          </div>

          {article.cover && (
            <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#eaf2ff]">
              <Image src={article.cover} alt={`${article.title}示意图`} fill sizes="360px" className="object-cover" />
            </div>
          )}

          <div className="mt-3 space-y-3">
            {article.content.map((b, i) => {
              if (b.type === 'h')
                return (
                  <h3 key={i} className="flex items-center gap-1.5 pt-1 text-[15px] font-semibold text-foreground">
                    <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                    {b.text}
                  </h3>
                )
              if (b.type === 'p')
                return (
                  <p key={i} className="text-[14px] leading-relaxed text-foreground/85">
                    {b.text}
                  </p>
                )
              if (b.type === 'steps')
                return (
                  <ol key={i} className="space-y-2">
                    {b.items.map((s, j) => (
                      <li key={j} className="flex gap-2.5 text-[14px] leading-relaxed text-foreground/85">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-medium tabular-nums text-primary-foreground">
                          {j + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                )
              return (
                <aside key={i} className="flex gap-2 rounded-xl bg-[#fff7ee] p-3 text-[13px] leading-relaxed text-[#9a5a1e]">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>{b.text}</p>
                </aside>
              )
            })}
          </div>

          <section aria-label="文章反馈" className="mt-6 border-t border-[#eef1f6] pt-4 text-center">
            <p className="text-[13px] text-muted-foreground">
              {feedback ? '感谢反馈，我们会持续优化内容' : '这篇指南对你有帮助吗？'}
            </p>
            <div className="mt-2.5 flex justify-center gap-3">
              {(
                [
                  { key: 'up', label: '有帮助', icon: ThumbsUp },
                  { key: 'down', label: '没帮助', icon: ThumbsDown },
                ] as const
              ).map((f) => {
                const active = feedback === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFeedback(active ? null : f.key)}
                    className={`flex h-8 items-center gap-1.5 rounded-full border px-4 text-[12px] ${
                      active ? 'border-primary bg-[#eaf2ff] text-primary' : 'border-[#e3e8f0] text-foreground'
                    }`}
                  >
                    <f.icon className="size-3.5" aria-hidden="true" />
                    {f.label}
                  </button>
                )
              })}
            </div>
          </section>
        </article>

        <section aria-labelledby="guide-related" className="mt-2.5 bg-white px-4 py-3">
          <h3 id="guide-related" className="text-[14px] font-semibold text-foreground">
            相关指南
          </h3>
          <ul className="mt-1">
            {more.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onOpen(a.id)} className="flex w-full items-center gap-2.5 py-2.5 text-left">
                  <a.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex-1 truncate text-[13px] text-foreground">{a.title}</span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex shrink-0 gap-2.5 border-t border-[#eef1f6] bg-white px-3 pb-6 pt-2.5">
        <button
          type="button"
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary text-[14px] text-primary"
        >
          <Headphones className="size-4" aria-hidden="true" />
          联系客服
        </button>
        <button
          type="button"
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[14px] font-medium text-primary-foreground"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          问问 AI
        </button>
      </div>
    </div>
  )
}

export function GuideScreen({
  initialView = 'list',
  initialArticleId = 'saliva',
  onBack,
}: {
  initialView?: GuideView
  initialArticleId?: string
  onBack: () => void
}) {
  const [articleId, setArticleId] = useState<string | null>(initialView === 'detail' ? initialArticleId : null)
  const article = articles.find((a) => a.id === articleId)

  if (article) {
    return (
      <SubPage key={article.id} title="指南详情" titleId="guide-detail-title" onBack={() => setArticleId(null)}>
        <GuideDetail article={article} onOpen={setArticleId} />
      </SubPage>
    )
  }

  return (
    <SubPage title="使用指南" titleId="guide-title" onBack={onBack}>
      <GuideList onOpen={setArticleId} />
    </SubPage>
  )
}
