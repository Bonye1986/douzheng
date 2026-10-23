import { fallbackAnswer, presetQuestions, type Answer } from '@/components/mini/home-data'
import { genderLabel, type Examinee } from '@/components/mini/checkout-data'
import { examineeReportCount } from '@/components/mini/examinee-store'

export type Mode = 'plain' | 'pro'

export type Confidence = 'high' | 'medium' | 'low'

export type SourceKind = 'report' | 'guideline' | 'label' | 'database'

export type Source = {
  title: string
  org: string
  kind: SourceKind
  level?: string
  confidence: Confidence
}

export type AiAnswer = Answer & { sources: Source[] }

export type Testee = {
  id: string
  name: string
  relation?: string
  meta: string
  reports: number
}

/** 由「受检人管理」中的受检人派生，保证 AI 咨询与受检人管理数据一致 */
export function toTestee(e: Examinee): Testee {
  return {
    id: e.id,
    name: e.name,
    relation: e.relation === '其他' ? undefined : e.relation,
    meta: `${genderLabel[e.gender]} · ${e.birth ? `${e.birth.slice(0, 4)}年` : `${e.age}岁`}`,
    reports: examineeReportCount[e.id] ?? 0,
  }
}

export function testeeLabel(t: Testee) {
  return t.relation ? `${t.name}（${t.relation}）` : t.name
}

export const skills = [
  { key: 'report', label: '报告解读', question: '帮我解读一下检测报告' },
  { key: 'recommend', label: '推荐检测', question: '推荐适合我的检测服务' },
  { key: 'myReports', label: '我的报告', question: '查看我的报告' },
  { key: 'myOrders', label: '我的订单', question: '我的订单进度' },
] as const

export const quickPrompts = ['我能正常使用氯吡格雷吗？', '高血压用药注意事项', '华法林剂量为什么因人而异？']

const reportSource: Source = {
  title: '王建国《心血管用药基因检测报告》',
  org: '都正生物 · 2026-06-12',
  kind: 'report',
  confidence: 'high',
}

const sourceLib = {
  cpicClopidogrel: { title: 'CPIC CYP2C19 与氯吡格雷用药指南', org: 'CPIC · 2022', kind: 'guideline', level: '1A', confidence: 'high' },
  cpicStatin: { title: 'CPIC SLCO1B1 / ABCG2 / CYP2C9 与他汀用药指南', org: 'CPIC · 2022', kind: 'guideline', level: '1A', confidence: 'high' },
  cpicWarfarin: { title: 'CPIC CYP2C9 / VKORC1 与华法林剂量指南', org: 'CPIC · 2017', kind: 'guideline', level: '1A', confidence: 'high' },
  nhcGuide: { title: '药物代谢酶和药物作用靶点基因检测技术指南（试行）', org: '国家卫生计生委 · 2015', kind: 'guideline', confidence: 'high' },
  pharmgkb: { title: 'PharmGKB 临床注释数据库', org: 'PharmGKB', kind: 'database', confidence: 'medium' },
  dpwg: { title: 'DPWG 药物基因组学推荐', org: 'KNMP DPWG', kind: 'guideline', confidence: 'high' },
  clopidogrelLabel: { title: '硫酸氢氯吡格雷片说明书', org: '药品说明书', kind: 'label', confidence: 'medium' },
  drugLabel: { title: '相关药品说明书', org: '药品说明书', kind: 'label', confidence: 'medium' },
} satisfies Record<string, Source>

type AnswerSet = {
  plain: Answer
  pro: Answer
  needsTestee?: Answer
  sources: Source[]
  usesReport?: boolean
}

const answers: Record<string, AnswerSet> = {
  帮我解读一下检测报告: {
    usesReport: true,
    sources: [sourceLib.cpicClopidogrel, sourceLib.cpicStatin, sourceLib.cpicWarfarin],
    needsTestee: {
      intro: '当前没有关联受检人，我无法读取您的报告。',
      points: ['点击上方“未选择受检人”，选择已有报告的受检人。', '或通过输入框左侧的附件按钮上传外部机构的检测报告。'],
    },
    plain: {
      intro: '已读取王建国最近一份《心血管用药基因检测报告》，简单来说：',
      points: [
        '大部分常用心血管药物可以正常使用。',
        '氯吡格雷在您体内“起效偏弱”，医生可能会考虑换药或调整剂量。',
        '他汀类药物发生肌肉不适的风险与普通人相近。',
      ],
      tip: '建议复诊时把报告带给医生，由医生结合病情判断。',
    },
    pro: {
      intro: '已读取王建国《心血管用药基因检测报告》（2026-06-12），主要结果：',
      points: [
        'CYP2C19 *1/*2，中间代谢型（IM），氯吡格雷活性代谢物生成减少。',
        'SLCO1B1 c.521TT，正常功能，辛伐他汀肌病风险无升高。',
        'CYP2C9 *1/*1、VKORC1 -1639AA，华法林敏感，起始剂量宜偏低。',
      ],
    },
  },
  我适合做哪种基因检测: {
    sources: [sourceLib.nhcGuide, sourceLib.pharmgkb],
    plain: {
      intro: '可以根据您的用药情况来选择：',
      points: [
        '长期吃多种慢病药（降压、降脂、抗凝），推荐“全药物基因检测套餐”。',
        '准备使用卡马西平、别嘌醇等药物，推荐“HLA基因分型检测”。',
        '只关心某一种药，可以选择单药物检测。',
      ],
      tip: '告诉我您正在服用的药物，我可以推荐得更准确。',
    },
    pro: {
      intro: '按临床用药场景推荐检测项目：',
      points: [
        '多药联用 / 慢病管理：全药物基因检测套餐（覆盖 CYP2C19、CYP2C9、CYP2D6、SLCO1B1 等）。',
        '严重皮肤不良反应预防：HLA-B*15:02、HLA-B*58:01 分型。',
        '抗肿瘤用药：DPYD、UGT1A1 等专项检测。',
      ],
    },
  },
  '我能正常使用氯吡格雷吗？': {
    usesReport: true,
    sources: [sourceLib.cpicClopidogrel, sourceLib.clopidogrelLabel],
    needsTestee: {
      intro: '氯吡格雷是否有效与 CYP2C19 基因密切相关，但我目前没有您的检测结果。',
      points: ['如已做过检测，请选择受检人以便读取报告。', '如未检测，建议用药前进行 CYP2C19 基因检测。'],
    },
    plain: {
      intro: '根据王建国的检测报告，氯吡格雷在您体内的“转化效率偏低”。',
      points: [
        '药效可能比一般人弱，预防血栓的效果会打折扣。',
        '请不要自行停药或换药，复诊时把报告给医生看。',
        '医生可能会考虑替格瑞洛等不依赖该基因的药物。',
      ],
      tip: '如出现胸痛、肢体麻木等症状，请立即就医。',
    },
    pro: {
      intro: '王建国 CYP2C19 基因型为 *1/*2，判定为中间代谢型（IM）。',
      points: [
        '氯吡格雷活性代谢物暴露量降低，血小板抑制率下降。',
        'ACS / PCI 患者建议考虑替格瑞洛、普拉格雷等替代药物（无禁忌时）。',
        '非心血管高危适应证可酌情维持标准剂量并加强监测。',
      ],
    },
  },
}

export const confidenceMeta: Record<Confidence, { label: string }> = {
  high: { label: '可信度高' },
  medium: { label: '可信度中' },
  low: { label: '可信度低' },
}

export function getAnswer(question: string, mode: Mode, hasTestee: boolean): AiAnswer {
  const key = question.replace(/[？?]$/, '')
  const set = answers[question] ?? answers[key]
  if (set) {
    if (set.usesReport && !hasTestee) {
      return { ...(set.needsTestee ?? set[mode]), sources: set.sources }
    }
    if (set.usesReport) {
      return { ...set[mode], sources: [reportSource, ...set.sources] }
    }
    return { ...set[mode], sources: set.sources }
  }
  const preset = presetQuestions.find((p) => p.question === question)?.answer
  if (preset) {
    return { ...preset, sources: [sourceLib.dpwg, sourceLib.pharmgkb, sourceLib.drugLabel] }
  }
  return { ...fallbackAnswer, sources: [] }
}

export function answerToText(answer: AiAnswer) {
  const lines = [answer.intro, ...answer.points.map((p, i) => `${i + 1}. ${p}`)]
  if (answer.tip) lines.push(answer.tip)
  if (answer.sources.length > 0) {
    lines.push('引用来源：', ...answer.sources.map((s, i) => `[${i + 1}] ${s.title}（${s.org}）`))
  }
  return lines.join('\n')
}
