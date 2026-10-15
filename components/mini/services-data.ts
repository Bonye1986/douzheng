import {
  CalendarClock,
  Dna,
  FileSearch,
  HeartPulse,
  type LucideIcon,
  MessagesSquare,
  Pill,
  ShieldPlus,
  Users,
} from 'lucide-react'

export type Banner = {
  id: string
  title: string
  subtitle: string
  cta: string
  image: string
  tone: 'light' | 'dark'
}

export const banners: Banner[] = [
  {
    id: 'gene',
    title: '药物基因检测',
    subtitle: '一次检测，终身用药参考',
    cta: '立即了解',
    image: '/images/banner-gene-test.png',
    tone: 'light',
  },
  {
    id: 'report',
    title: '报告 AI 解读',
    subtitle: '看懂基因型与用药建议',
    cta: '去解读',
    image: '/images/banner-report.png',
    tone: 'dark',
  },
]

export type ServiceCategory = {
  id: string
  label: string
  icon: LucideIcon
  color: string
  chatQuestion?: string
}

export const serviceCategories: ServiceCategory[] = [
  { id: 'gene', label: '基因检测', icon: Dna, color: 'bg-[#e8f1fe] text-primary' },
  { id: 'consult', label: '用药咨询', icon: MessagesSquare, color: 'bg-[#fff1e8] text-[#f07a2c]', chatQuestion: '我想咨询用药问题' },
  { id: 'report', label: '报告解读', icon: FileSearch, color: 'bg-[#e9f8f1] text-[#1f9d6b]', chatQuestion: '帮我解读一下检测报告' },
  { id: 'remind', label: '用药提醒', icon: CalendarClock, color: 'bg-[#f1edfe] text-[#7357e6]' },
  { id: 'cardio', label: '心脑血管', icon: HeartPulse, color: 'bg-[#feecee] text-[#e04a5a]' },
  { id: 'chronic', label: '慢病用药', icon: Pill, color: 'bg-[#e8f1fe] text-primary' },
  { id: 'family', label: '家庭检测', icon: Users, color: 'bg-[#fff1e8] text-[#f07a2c]' },
  { id: 'safety', label: '用药安全', icon: ShieldPlus, color: 'bg-[#e9f8f1] text-[#1f9d6b]' },
]

export type RecommendedTest = {
  id: string
  name: string
  desc: string
  tags: string[]
  price: number
  originalPrice?: number
  sold: string
}

export const recommendedTests: RecommendedTest[] = [
  {
    id: 'full',
    name: '个体化用药基因检测 · 全面版',
    desc: '覆盖 20+ 科室常用药物，指导选药与剂量',
    tags: ['居家采样', '终身有效'],
    price: 1299,
    originalPrice: 1599,
    sold: '2.3万人已检',
  },
  {
    id: 'cardio',
    name: '心脑血管用药基因检测',
    desc: '氯吡格雷、华法林、他汀类等药物反应评估',
    tags: ['热门', '指南推荐'],
    price: 599,
    originalPrice: 799,
    sold: '1.1万人已检',
  },
  {
    id: 'mental',
    name: '精神类药物基因检测',
    desc: '抗抑郁、抗焦虑药物代谢与疗效预测',
    tags: ['定点采样'],
    price: 899,
    sold: '6800人已检',
  },
]

export type Article = {
  id: string
  title: string
  category: string
  reads: string
}

export const articles: Article[] = [
  { id: 'a1', title: '同一种药，为什么别人有效我却没用？', category: '基因与药物', reads: '3.2万' },
  { id: 'a2', title: '吃氯吡格雷前，建议先了解 CYP2C19 基因', category: '心血管', reads: '1.8万' },
  { id: 'a3', title: '药物基因检测需要空腹吗？采样常见问题汇总', category: '检测须知', reads: '9.6千' },
]

export type QuizOption = { id: string; text: string }

export const dailyQuiz = {
  question: '药物基因检测结果会随年龄改变吗？',
  options: [
    { id: 'a', text: '会，需要每年复查' },
    { id: 'b', text: '不会，基因型终身不变' },
  ] satisfies QuizOption[],
  answerId: 'b',
  explanation: '人的基因型出生即确定，检测一次即可长期作为用药参考；但用药方案仍需结合年龄、肝肾功能等综合判断。',
  participants: '1,286',
}
