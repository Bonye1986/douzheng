export type Gender = 'male' | 'female'

export type Examinee = {
  id: string
  name: string
  relation: string
  gender: Gender
  age: number
  phone?: string
}

export const relations = ['本人', '配偶', '父母', '子女', '其他'] as const

export const genderLabel: Record<Gender, string> = { male: '男', female: '女' }

export const examineeMeta = (e: Examinee) => `${genderLabel[e.gender]} · ${e.age}岁`

export const initialExaminees: Examinee[] = [
  { id: 'self', name: '王建国', relation: '本人', gender: 'male', age: 58, phone: '138****6721' },
  { id: 'spouse', name: '李秀兰', relation: '配偶', gender: 'female', age: 56 },
  { id: 'child', name: '王小米', relation: '子女', gender: 'female', age: 8 },
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
  { id: 'h1', name: '杭州市第一人民医院 · 检验科', type: 'hospital', district: '上城区', detail: '浣纱路 261 号 · 门诊楼 2 层', time: '周一至周六 08:00–16:30', distance: 2.3, todayAvailable: true },
  { id: 'h3', name: '迪安诊断 · 西湖采样点', type: 'lab', district: '西湖区', detail: '金蓬街 329 号 · 1 层大厅', time: '每日 08:30–18:00', distance: 4.1, todayAvailable: true },
  { id: 'h4', name: '浙江省人民医院 · 精准医学中心', type: 'hospital', district: '拱墅区', detail: '上塘路 158 号 · 3 号楼 4 层', time: '周一至周五 08:00–16:00', distance: 5.2, todayAvailable: false },
  { id: 'h2', name: '浙大一院之江院区 · 采样中心', type: 'hospital', district: '西湖区', detail: '之江路 1369 号 · 门诊 1 层', time: '每日 07:30–17:00', distance: 6.8, todayAvailable: true },
  { id: 'h5', name: '艾迪康医学检验 · 滨江采样点', type: 'lab', district: '滨江区', detail: '江南大道 3850 号 · 创新大厦 1 层', time: '周一至周六 09:00–17:30', distance: 8.6, todayAvailable: true },
  { id: 'h6', name: '金域医学 · 余杭采样点', type: 'lab', district: '余杭区', detail: '文一西路 998 号 · 海创园 5 号楼', time: '周一至周五 09:00–17:00', distance: 14.9, todayAvailable: false },
]
