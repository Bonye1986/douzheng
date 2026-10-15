export const testCategories = [
  { key: 'all', label: '全部' },
  { key: 'full', label: '综合用药' },
  { key: 'cardio', label: '心脑血管' },
  { key: 'mental', label: '精神神经' },
  { key: 'chronic', label: '慢病用药' },
  { key: 'child', label: '儿童用药' },
] as const

export type TestCategory = Exclude<(typeof testCategories)[number]['key'], 'all'>
export type CategoryKey = (typeof testCategories)[number]['key']

export type SamplingMode = 'self' | 'site'

export const samplingLabel: Record<SamplingMode, string> = {
  self: '居家自采样',
  site: '定点采样',
}

export type TestService = {
  id: string
  name: string
  category: TestCategory
  summary: string
  image: string
  price: number
  originalPrice?: number
  sold: string
  tags: string[]
  sampling: SamplingMode
  sampleType: string
  turnaround: string
  drugCount: number
  genes: string[]
  audience: string[]
  notes: string[]
}

export const testFlow = ['下单购买', '采样寄回', '实验室检测', '查看报告']

export const testServices: TestService[] = [
  {
    id: 'full',
    name: '个体化用药基因检测 · 全面版',
    category: 'full',
    summary: '覆盖 20+ 科室常用药物，指导选药与剂量',
    image: '/images/products/full.png',
    price: 1299,
    originalPrice: 1599,
    sold: '2.3万人已检',
    tags: ['终身有效', '附 AI 解读'],
    sampling: 'self',
    sampleType: '口腔拭子',
    turnaround: '7–10 个工作日',
    drugCount: 260,
    genes: ['CYP2C19', 'CYP2D6', 'CYP2C9', 'VKORC1', 'SLCO1B1', 'HLA-B'],
    audience: ['长期服用多种药物的人群', '用药效果不佳或不良反应明显者', '希望建立家庭用药档案的人群'],
    notes: ['采样前 30 分钟内避免进食、饮水、吸烟', '采样后 3 日内寄回，避免高温暴晒', '报告结果仅供医生参考，请勿自行调整用药'],
  },
  {
    id: 'cardio',
    name: '心脑血管用药基因检测',
    category: 'cardio',
    summary: '氯吡格雷、华法林、他汀类等药物反应评估',
    image: '/images/products/cardio.png',
    price: 599,
    originalPrice: 799,
    sold: '1.1万人已检',
    tags: ['热门', '指南推荐'],
    sampling: 'self',
    sampleType: '口腔拭子',
    turnaround: '5–7 个工作日',
    drugCount: 48,
    genes: ['CYP2C19', 'CYP2C9', 'VKORC1', 'SLCO1B1', 'ABCB1'],
    audience: ['冠心病、支架术后需抗血小板治疗者', '房颤、血栓需抗凝治疗者', '需长期服用他汀类药物者'],
    notes: ['采样前 30 分钟内避免进食、饮水、吸烟', '正在服用的药物无需停用', '报告结果仅供医生参考，请勿自行调整用药'],
  },
  {
    id: 'hypertension',
    name: '高血压用药基因检测',
    category: 'cardio',
    summary: '评估 ARB、β 受体阻滞剂等降压药敏感性',
    image: '/images/products/cardio.png',
    price: 399,
    sold: '8600人已检',
    tags: ['性价比之选'],
    sampling: 'self',
    sampleType: '口腔拭子',
    turnaround: '5–7 个工作日',
    drugCount: 32,
    genes: ['CYP2D6', 'CYP2C9', 'ADRB1', 'ACE', 'AGTR1'],
    audience: ['新确诊高血压、尚未确定用药方案者', '血压控制不理想需调整方案者'],
    notes: ['采样前 30 分钟内避免进食、饮水、吸烟', '降压药请按医嘱继续服用'],
  },
  {
    id: 'mental',
    name: '精神类药物基因检测',
    category: 'mental',
    summary: '抗抑郁、抗焦虑药物代谢与疗效预测',
    image: '/images/products/mental.png',
    price: 899,
    sold: '6800人已检',
    tags: ['隐私保护'],
    sampling: 'site',
    sampleType: '静脉血 2 mL',
    turnaround: '7–10 个工作日',
    drugCount: 65,
    genes: ['CYP2D6', 'CYP2C19', 'CYP1A2', 'HTR2A', 'SLC6A4'],
    audience: ['抑郁、焦虑等需长期服药者', '换药多次仍效果不佳者'],
    notes: ['请携带身份证至合作采样点', '无需空腹，采样约 5 分钟'],
  },
  {
    id: 'epilepsy',
    name: '癫痫用药安全基因检测',
    category: 'mental',
    summary: '卡马西平等药物严重皮肤不良反应风险筛查',
    image: '/images/products/mental.png',
    price: 499,
    sold: '3200人已检',
    tags: ['用药前必查'],
    sampling: 'site',
    sampleType: '静脉血 2 mL',
    turnaround: '5–7 个工作日',
    drugCount: 18,
    genes: ['HLA-B*15:02', 'HLA-A*31:01', 'CYP2C9'],
    audience: ['计划使用卡马西平、奥卡西平者', '癫痫、三叉神经痛患者'],
    notes: ['请携带身份证至合作采样点', '建议在开始用药前完成检测'],
  },
  {
    id: 'diabetes',
    name: '糖尿病用药基因检测',
    category: 'chronic',
    summary: '二甲双胍、磺脲类降糖药疗效与风险评估',
    image: '/images/products/chronic.png',
    price: 459,
    sold: '5100人已检',
    tags: ['慢病管理'],
    sampling: 'self',
    sampleType: '口腔拭子',
    turnaround: '5–7 个工作日',
    drugCount: 26,
    genes: ['SLC22A1', 'CYP2C9', 'KCNJ11', 'TCF7L2'],
    audience: ['2 型糖尿病患者', '血糖控制不稳定需调整方案者'],
    notes: ['采样前 30 分钟内避免进食、饮水、吸烟', '降糖药请按医嘱继续服用'],
  },
  {
    id: 'child',
    name: '儿童安全用药基因检测',
    category: 'child',
    summary: '常用抗生素、退热及哮喘药物安全评估',
    image: '/images/products/chronic.png',
    price: 699,
    originalPrice: 899,
    sold: '4300人已检',
    tags: ['无痛采样', '终身有效'],
    sampling: 'self',
    sampleType: '口腔拭子',
    turnaround: '7–10 个工作日',
    drugCount: 90,
    genes: ['CYP2C19', 'CYP2D6', 'G6PD', 'MT-RNR1', 'NUDT15'],
    audience: ['0–14 岁儿童', '有药物过敏或家族遗传病史的儿童'],
    notes: ['婴幼儿请在家长协助下采样', '采样前 30 分钟避免喂奶、进食'],
  },
]
