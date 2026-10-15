export const testSteps = ['绑定样本', '采样寄回', '实验室检测', '报告生成'] as const

export type TestStatus = 'unbound' | 'shipping' | 'testing' | 'done'

export type TestOrder = {
  id: string
  name: string
  testee: string
  sampleNo?: string
  status: TestStatus
  step: number
  updatedAt: string
  note: string
  reportSummary?: { label: string; value: string; tone: 'normal' | 'warn' | 'risk' }[]
}

export const statusMeta: Record<TestStatus, { label: string; className: string }> = {
  unbound: { label: '待绑定', className: 'bg-[#fff1e8] text-[#f07a2c]' },
  shipping: { label: '待寄回', className: 'bg-[#fff1e8] text-[#f07a2c]' },
  testing: { label: '检测中', className: 'bg-[#e8f1fe] text-primary' },
  done: { label: '已出报告', className: 'bg-[#e9f8f1] text-[#1f9d6b]' },
}

export const testOrders: TestOrder[] = [
  {
    id: 'o1',
    name: '心脑血管个体化用药基因检测',
    testee: '张华',
    sampleNo: 'DZ2026100812',
    status: 'done',
    step: 3,
    updatedAt: '10-12 14:20',
    note: '报告已生成，涉及 12 种常用药物',
    reportSummary: [
      { label: '氯吡格雷', value: '慢代谢', tone: 'risk' },
      { label: '华法林', value: '需减量', tone: 'warn' },
      { label: '阿托伐他汀', value: '正常', tone: 'normal' },
    ],
  },
  {
    id: 'o2',
    name: '高血压用药基因检测',
    testee: '张建国',
    sampleNo: 'DZ2026101305',
    status: 'testing',
    step: 2,
    updatedAt: '10-14 09:05',
    note: '样本已签收，预计 10-18 出报告',
  },
  {
    id: 'o3',
    name: '全面药物基因组检测',
    testee: '李梅',
    status: 'unbound',
    step: 0,
    updatedAt: '10-15 08:30',
    note: '已发货采样盒，收到后请扫码绑定',
  },
]

export const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '进行中' },
  { key: 'done', label: '已出报告' },
] as const

export type FilterKey = (typeof filterTabs)[number]['key']
