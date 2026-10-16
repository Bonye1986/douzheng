export type Gender = 'male' | 'female'

export type Examinee = {
  id: string
  name: string
  relation: string
  gender: Gender
  age: number
  phone?: string
  birth?: string
  idCard?: string
}

export const relations = ['本人', '配偶', '父母', '子女', '其他'] as const

export const genderLabel: Record<Gender, string> = { male: '男', female: '女' }

export const examineeMeta = (e: Examinee) => `${genderLabel[e.gender]} · ${e.age}岁`

export const initialExaminees: Examinee[] = [
  {
    id: 'self',
    name: '王建国',
    relation: '本人',
    gender: 'male',
    age: 58,
    phone: '138****6721',
    birth: '1968-03-12',
    idCard: '3101**********1234',
  },
  { id: 'spouse', name: '李秀兰', relation: '配偶', gender: 'female', age: 56, birth: '1970-07-21' },
  { id: 'child', name: '王小米', relation: '子女', gender: 'female', age: 8, birth: '2018-05-06' },
]

export type ResearchStatus = 'signed' | 'withdrawn' | 'unsigned'

export type ResearchAuth = {
  id: string
  memberId: string
  serviceId: string
  orderNo: string
  status: ResearchStatus
  updatedAt: string
}

export const researchStatusLabel: Record<ResearchStatus, string> = {
  signed: '已授权',
  withdrawn: '已撤回',
  unsigned: '待签署',
}

/** 科研授权记录 —— 以「订单 × 检测项目 × 受检人」为单位，下单时勾选生成，签署 / 撤销均需 e签宝 人脸核验 */
export const initialResearchAuths: ResearchAuth[] = [
  { id: 'ra1', memberId: 'self', serviceId: 'cardio', orderNo: 'GX20261012008', status: 'signed', updatedAt: '2026-10-12 14:32' },
  { id: 'ra2', memberId: 'spouse', serviceId: 'cardio', orderNo: 'GX20261012008', status: 'unsigned', updatedAt: '2026-10-12 14:32' },
  { id: 'ra3', memberId: 'self', serviceId: 'child', orderNo: 'GX20260928016', status: 'withdrawn', updatedAt: '2026-10-03 09:15' },
  { id: 'ra4', memberId: 'child', serviceId: 'child', orderNo: 'GX20260928016', status: 'signed', updatedAt: '2026-09-28 20:06' },
]

/** 检测知情同意书 —— 每个订单下单前必须勾选同意，签署后不可撤回 */
export type TestConsent = {
  orderNo: string
  serviceIds: string[]
  memberIds: string[]
  signedAt: string
}

export const testConsents: TestConsent[] = [
  { orderNo: 'GX20261012008', serviceIds: ['cardio'], memberIds: ['self', 'spouse'], signedAt: '2026-10-12 14:30' },
  { orderNo: 'GX20260928016', serviceIds: ['child'], memberIds: ['self', 'child'], signedAt: '2026-09-28 20:04' },
]

export type SiteType = 'hospital' | 'lab'

export const siteTypeLabel: Record<SiteType, string> = { hospital: '医院', lab: '第三方检验机构' }

export type Site = {
  id: string
  name: string
  type: SiteType
  district: string
  detail: string
  time: string
  distance: number
  todayAvailable: boolean
}

/** 定点采样机构 —— 由后台维护，前端按定位获取并按距离排序 */
export const sites: Site[] = [
  { id: 'h1', name: '湖南省人民医院 · 检验科', type: 'hospital', district: '芙蓉区', detail: '解放西路 61 号 · 门诊楼 2 层', time: '周一至周六 08:00–16:30', distance: 1.8, todayAvailable: true },
  { id: 'h2', name: '中南大学湘雅二医院 · 采样中心', type: 'hospital', district: '芙蓉区', detail: '人民中路 139 号 · 门诊 1 层', time: '每日 07:30–17:00', distance: 3.2, todayAvailable: true },
  { id: 'h3', name: '中南大学湘雅医院 · 精准医学中心', type: 'hospital', district: '开福区', detail: '湘雅路 87 号 · 新医疗区 4 层', time: '周一至周五 08:00–16:00', distance: 4.6, todayAvailable: false },
  { id: 'h4', name: '长沙市第一医院 · 检验科', type: 'hospital', district: '开福区', detail: '营盘路 311 号 · 门诊楼 3 层', time: '周一至周六 08:00–17:00', distance: 5.1, todayAvailable: true },
  { id: 'h5', name: '中南大学湘雅三医院 · 采样中心', type: 'hospital', district: '岳麓区', detail: '桐梓坡路 138 号 · 门诊 1 层', time: '每日 08:00–16:30', distance: 8.4, todayAvailable: true },
  { id: 'h6', name: '金域医学 · 长沙采样点', type: 'lab', district: '岳麓区', detail: '麓谷大道 627 号 · 长海科技园 1 层', time: '周一至周五 09:00–17:00', distance: 13.7, todayAvailable: false },
]
