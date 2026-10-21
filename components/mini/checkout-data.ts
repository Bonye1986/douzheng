export type Gender = 'male' | 'female'

export type Examinee = {
  id: string
  name: string
  relation: string
  gender: Gender
  age: number
  phone?: string
  birth?: string
  /** 受检人身份证号（脱敏存储） */
  idNo?: string
  /** 本人实名认证后的身份证号，存在即表示已认证 */
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
    idNo: '3101**********1234',
    idCard: '3101**********1234',
  },
  { id: 'spouse', name: '李秀兰', relation: '配偶', gender: 'female', age: 56, birth: '1970-07-21', idNo: '4301**********2846' },
  { id: 'child', name: '王小米', relation: '子女', gender: 'female', age: 8, birth: '2018-05-06', idNo: '4301**********0623' },
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

export type SiteType = 'clinic' | 'pharmacy'

export const siteTypeLabel: Record<SiteType, string> = { clinic: '诊所', pharmacy: '药店' }

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
  { id: 'h1', name: '老百姓大药房 · 解放西路店', type: 'pharmacy', district: '芙蓉区', detail: '解放西路 58 号 · 临街门面', time: '每日 08:00–22:00', distance: 0.9, todayAvailable: true },
  { id: 'h2', name: '仁和诊所 · 五一广场', type: 'clinic', district: '芙蓉区', detail: '黄兴中路 102 号 · 2 楼', time: '周一至周六 08:30–18:00', distance: 1.8, todayAvailable: true },
  { id: 'h3', name: '益丰大药房 · 人民中路店', type: 'pharmacy', district: '芙蓉区', detail: '人民中路 145 号 · 1 层', time: '每日 08:00–21:30', distance: 3.2, todayAvailable: true },
  { id: 'h4', name: '康源综合门诊部', type: 'clinic', district: '开福区', detail: '营盘路 296 号 · 1 层', time: '周一至周五 08:00–17:30', distance: 4.6, todayAvailable: false },
  { id: 'h5', name: '大参林药房 · 湘雅路店', type: 'pharmacy', district: '开福区', detail: '湘雅路 91 号 · 临街门面', time: '每日 08:30–21:00', distance: 5.1, todayAvailable: true },
  { id: 'h6', name: '麓谷社区诊所', type: 'clinic', district: '岳麓区', detail: '麓谷大道 618 号 · 长海科技园 1 层', time: '周一至周六 09:00–18:00', distance: 8.4, todayAvailable: false },
]
