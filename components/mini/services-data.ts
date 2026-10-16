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
    tone: 'light',
  },
]

export type ServiceCategoryId = 'tests' | 'health' | 'report' | 'remind'

export type ServiceCategory = {
  id: ServiceCategoryId
  label: string
  requiresLogin?: boolean
}

export const serviceCategories: ServiceCategory[] = [
  { id: 'tests', label: '检测服务' },
  { id: 'health', label: '健康管理', requiresLogin: true },
  { id: 'report', label: '报告解读' },
  { id: 'remind', label: '用药提醒', requiresLogin: true },
]

export const reportChatQuestion = '帮我解读一下检测报告'

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

export type ArticleBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'tip'; text: string }

export type Article = {
  id: string
  title: string
  category: string
  reads: string
  summary: string
  minutes: number
  updated: string
  author: string
  cover: string
  content: ArticleBlock[]
}

export const articleCategories = ['全部', '基因与药物', '心血管', '精神神经', '检测须知'] as const

export const articles: Article[] = [
  {
    id: 'a1',
    cover: '/images/articles/a1.png',
    title: '同一种药，为什么别人有效我却没用？',
    category: '基因与药物',
    reads: '3.2万',
    summary: '药物在体内的吸收、代谢与作用靶点都受基因影响，这是“同药不同效”的重要原因。',
    minutes: 4,
    updated: '2026-10-12',
    author: '临床药学部',
    content: [
      { type: 'p', text: '生活中常听到这样的疑问：同样的药、同样的剂量，邻居吃了效果很好，自己吃了却没什么用，甚至出现明显不良反应。这背后，基因差异是一个重要原因。' },
      { type: 'h', text: '基因如何影响药效' },
      { type: 'list', items: ['代谢酶基因：决定药物在肝脏中被分解的快慢，例如 CYP2C19、CYP2D6', '转运体基因：影响药物进入细胞或被排出的效率', '靶点基因：决定药物与作用部位结合的程度'] },
      { type: 'p', text: '以代谢酶为例，“慢代谢型”人群药物分解慢，血药浓度偏高，容易出现不良反应；“超快代谢型”人群分解过快，药物可能还没起效就被清除了。' },
      { type: 'h', text: '药物基因检测能做什么' },
      { type: 'p', text: '通过一次采样，检测与常用药物相关的基因位点，结合 CPIC、DPWG 等国际指南，给出“正常使用、谨慎使用、避免使用”等分级建议，帮助医生更精准地选药和定剂量。' },
      { type: 'tip', text: '基因只是影响药效的因素之一，年龄、肝肾功能、合并用药同样重要。请勿根据检测结果自行停药或换药。' },
    ],
  },
  {
    id: 'a2',
    cover: '/images/articles/a2.png',
    title: '吃氯吡格雷前，建议先了解 CYP2C19 基因',
    category: '心血管',
    reads: '1.8万',
    summary: '约 14% 的中国人群为 CYP2C19 慢代谢型，服用氯吡格雷后抗血小板效果可能明显减弱。',
    minutes: 3,
    updated: '2026-10-08',
    author: '心内科药师团队',
    content: [
      { type: 'p', text: '氯吡格雷是冠心病、支架术后常用的抗血小板药物。它本身没有活性，需要在肝脏经 CYP2C19 酶转化后才能发挥作用。' },
      { type: 'h', text: '慢代谢型意味着什么' },
      { type: 'p', text: 'CYP2C19 功能缺失的人群，无法有效激活氯吡格雷，血小板抑制效果不足，支架内血栓和心血管事件风险随之升高。' },
      { type: 'list', items: ['正常代谢型：可按常规剂量使用', '中间代谢型：疗效可能降低，可结合临床评估', '慢代谢型：指南建议考虑换用替格瑞洛等其他药物'] },
      { type: 'tip', text: '已在服用氯吡格雷的患者，请勿自行停药。如有疑问，可携带检测报告咨询主治医生。' },
    ],
  },
  {
    id: 'a3',
    cover: '/images/articles/a3.png',
    title: '药物基因检测需要空腹吗？采样常见问题汇总',
    category: '检测须知',
    reads: '9.6千',
    summary: '无需空腹抽血，唾液或口腔拭子即可完成采样，但采样前 30 分钟需避免进食饮水。',
    minutes: 2,
    updated: '2026-10-05',
    author: '检测服务中心',
    content: [
      { type: 'h', text: '需要空腹吗？' },
      { type: 'p', text: '不需要。基因信息终身不变，与是否进食无关。但为了保证样本质量，唾液或口腔拭子采样前 30 分钟内请勿进食、饮水、吸烟或嚼口香糖。' },
      { type: 'h', text: '正在吃药会影响结果吗？' },
      { type: 'p', text: '不会。药物不会改变您的基因型，正常服药期间即可采样。' },
      { type: 'h', text: '其他常见问题' },
      { type: 'list', items: ['一次检测，终身有效，后续新增用药也可参考同一份报告', '儿童可使用口腔拭子采样，过程无痛', '样本寄回后约 7–10 个工作日出具报告'] },
      { type: 'tip', text: '若样本不合格，平台会主动联系并免费寄送新的采样套装。' },
    ],
  },
  {
    id: 'a4',
    cover: '/images/articles/a4.png',
    title: '抗抑郁药换了好几种都不理想？可能与基因有关',
    category: '精神神经',
    reads: '1.2万',
    summary: 'CYP2D6、CYP2C19 基因影响多种抗抑郁药的血药浓度，检测可减少“试药”周期。',
    minutes: 4,
    updated: '2026-09-30',
    author: '精神科药师团队',
    content: [
      { type: 'p', text: '抗抑郁药通常需要 4–6 周才能判断疗效，如果反复换药，治疗周期会被大大拉长。研究显示，基因差异是疗效与不良反应个体差异的重要来源。' },
      { type: 'h', text: '涉及哪些基因' },
      { type: 'list', items: ['CYP2D6：影响帕罗西汀、氟西汀、文拉法辛等', 'CYP2C19：影响舍曲林、西酞普兰、艾司西酞普兰等'] },
      { type: 'p', text: '医生可参考检测结果，优先选择与您代谢类型匹配的药物和起始剂量，减少无效试药。' },
      { type: 'tip', text: '抗抑郁药不可骤然停用，任何调整都应在专科医生指导下进行。' },
    ],
  },
  {
    id: 'a5',
    cover: '/images/articles/a5.png',
    title: '华法林剂量为什么因人而异？',
    category: '心血管',
    reads: '7.4千',
    summary: 'CYP2C9 与 VKORC1 基因可解释约 40% 的华法林剂量差异，有助于更快达到目标 INR。',
    minutes: 3,
    updated: '2026-09-22',
    author: '临床药学部',
    content: [
      { type: 'p', text: '华法林是常用的口服抗凝药，治疗窗窄，剂量过高易出血，过低则无法预防血栓。不同患者所需剂量可相差 10 倍以上。' },
      { type: 'h', text: '关键基因' },
      { type: 'list', items: ['CYP2C9：影响华法林的代谢清除速度', 'VKORC1：影响药物作用靶点的敏感性'] },
      { type: 'p', text: '结合基因型的剂量算法，可帮助医生估算更合适的起始剂量，缩短调药时间。' },
      { type: 'tip', text: '服用华法林期间仍需定期监测 INR，基因检测不能替代常规监测。' },
    ],
  },
  {
    id: 'a6',
    cover: '/images/articles/a6.png',
    title: '一次检测终身有效？关于报告时效的三个误区',
    category: '基因与药物',
    reads: '5.1千',
    summary: '基因型终身不变，但用药建议会随指南更新，平台会同步更新报告解读。',
    minutes: 2,
    updated: '2026-09-15',
    author: '检测服务中心',
    content: [
      { type: 'h', text: '误区一：报告过几年就失效了' },
      { type: 'p', text: '基因型终身不变，检测结果长期有效。' },
      { type: 'h', text: '误区二：只能用于当前在吃的药' },
      { type: 'p', text: '报告覆盖多种常用药物，未来新增用药时同样可以参考。' },
      { type: 'h', text: '误区三：用药建议永远不变' },
      { type: 'p', text: '随着 CPIC、DPWG 等指南更新，用药建议可能调整。平台会同步更新解读内容，并在「我的报告」中提示。' },
    ],
  },
]

export type QuizOption = { id: string; text: string }

export type QuizQuestion = {
  id: string
  question: string
  options: QuizOption[]
  answerId: string
  explanation: string
}

export type QuizTopic = {
  id: string
  title: string
  questions: QuizQuestion[]
}

export const quizTopics: QuizTopic[] = [
  {
    id: 'gene',
    title: '基因检测常识',
    questions: [
      {
        id: 'g1',
        question: '药物基因检测结果会随年龄改变吗？',
        options: [
          { id: 'a', text: '会，需要每年复查' },
          { id: 'b', text: '不会，基因型终身不变' },
        ],
        answerId: 'b',
        explanation: '人的基因型出生即确定，检测一次即可长期作为用药参考；但用药方案仍需结合年龄、肝肾功能等综合判断。',
      },
      {
        id: 'g2',
        question: '药物基因检测通常采集什么样本？',
        options: [
          { id: 'a', text: '口腔拭子或少量血液' },
          { id: 'b', text: '必须做组织穿刺' },
        ],
        answerId: 'a',
        explanation: '常用口腔黏膜拭子或静脉血，居家即可完成采样，无需穿刺。',
      },
      {
        id: 'g3',
        question: '检测前是否必须空腹？',
        options: [
          { id: 'a', text: '必须空腹 8 小时' },
          { id: 'b', text: '一般无需空腹' },
        ],
        answerId: 'b',
        explanation: '基因检测不受饮食影响；口腔拭子采样前 30 分钟避免进食、饮水、吸烟即可。',
      },
    ],
  },
  {
    id: 'cardio',
    title: '心血管用药',
    questions: [
      {
        id: 'c1',
        question: '氯吡格雷的疗效主要与哪个基因相关？',
        options: [
          { id: 'a', text: 'CYP2C19' },
          { id: 'b', text: 'BRCA1' },
        ],
        answerId: 'a',
        explanation: 'CYP2C19 慢代谢者活化氯吡格雷能力下降，抗血小板效果可能减弱，可咨询医生调整方案。',
      },
      {
        id: 'c2',
        question: '华法林剂量个体差异大，主要原因之一是？',
        options: [
          { id: 'a', text: '服药时间早晚' },
          { id: 'b', text: 'CYP2C9 / VKORC1 基因差异' },
        ],
        answerId: 'b',
        explanation: '这两个基因影响华法林代谢与敏感性，检测结果可辅助医生确定起始剂量。',
      },
    ],
  },
  {
    id: 'safety',
    title: '安全用药',
    questions: [
      {
        id: 's1',
        question: '感觉症状好转后，可以自行停药吗？',
        options: [
          { id: 'a', text: '可以，没症状就停' },
          { id: 'b', text: '不建议，应遵医嘱调整' },
        ],
        answerId: 'b',
        explanation: '降压、抗凝等药物擅自停用可能导致病情反弹甚至危险，停药或减量请先咨询医生。',
      },
      {
        id: 's2',
        question: '服用头孢类抗生素期间饮酒会怎样？',
        options: [
          { id: 'a', text: '可能引发双硫仑样反应' },
          { id: 'b', text: '没有影响' },
        ],
        answerId: 'a',
        explanation: '可出现面部潮红、心悸、血压下降等，用药期间及停药后 7 天内应避免饮酒。',
      },
    ],
  },
]
