export type Answer = {
  intro: string
  points: string[]
  tip?: string
}

export type PresetQuestion = {
  id: string
  category: string
  question: string
  answer: Answer
}

export const presetQuestions: PresetQuestion[] = [
  {
    id: 'hypertension',
    category: '慢病用药',
    question: '高血压用药注意事项',
    answer: {
      intro: '高血压通常需要长期规律用药，以下几点需要特别留意：',
      points: [
        '按时按量服药，血压正常后也不要自行停药或减量，以免血压反跳。',
        '每天固定时间测量血压并记录，复诊时带给医生参考。',
        '服用 ACEI 类（如依那普利）可能出现干咳，服用利尿剂需关注血钾变化。',
        '部分降压药（如美托洛尔）的代谢受 CYP2D6 基因影响，个体反应差异较大。',
      ],
      tip: '如果用药后血压控制不理想或副作用明显，可以考虑做高血压用药基因检测，辅助医生调整方案。',
    },
  },
  {
    id: 'clopidogrel',
    category: '心血管',
    question: '氯吡格雷基因检测有什么用？',
    answer: {
      intro: '氯吡格雷需要经 CYP2C19 酶转化后才能发挥抗血小板作用。',
      points: [
        'CYP2C19 慢代谢人群，药物活性不足，血栓风险可能升高。',
        '检测可以帮助医生判断是否需要更换为替格瑞洛等其他药物。',
        '东亚人群中慢代谢型比例相对较高，更建议用药前检测。',
      ],
      tip: '检测只需一次口腔拭子采样，结果终身有效。',
    },
  },
  {
    id: 'warfarin',
    category: '抗凝用药',
    question: '华法林剂量为什么因人而异？',
    answer: {
      intro: '华法林的有效剂量个体差异可达 10 倍以上，主要与两个基因有关：',
      points: [
        'CYP2C9：影响华法林在体内的代谢速度。',
        'VKORC1：影响身体对华法林的敏感程度。',
        '饮食中维生素 K 的摄入、合用药物也会影响 INR 值。',
      ],
      tip: '结合基因检测结果估算起始剂量，可以更快达到目标 INR，减少出血风险。',
    },
  },
  {
    id: 'statin',
    category: '慢病用药',
    question: '服用他汀类药物需要注意什么？',
    answer: {
      intro: '他汀类药物是常用的降血脂药，服用时建议注意：',
      points: [
        '多数他汀建议晚间服用，阿托伐他汀、瑞舒伐他汀可在任意固定时间服用。',
        '出现不明原因的肌肉酸痛、乏力时，及时就医检查肌酸激酶。',
        'SLCO1B1 基因变异人群发生肌肉相关副作用的风险更高。',
      ],
    },
  },
  {
    id: 'report',
    category: '报告解读',
    question: '基因检测报告怎么看？',
    answer: {
      intro: '药物基因检测报告一般分为三个部分：',
      points: [
        '基因型结果：列出检测位点及您的基因型。',
        '代谢类型：如快代谢、正常代谢、慢代谢等。',
        '用药建议：按药物列出“正常使用 / 谨慎使用 / 建议调整”等提示。',
      ],
      tip: '报告仅供医生参考，请勿根据报告自行调整用药。',
    },
  },
  {
    id: 'child',
    category: '儿童用药',
    question: '孩子用药前需要做基因检测吗？',
    answer: {
      intro: '儿童对药物的反应与成人不同，以下情况可以考虑检测：',
      points: [
        '需要长期服用抗癫痫药（如卡马西平）的孩子，建议先检测 HLA-B*15:02。',
        '有药物严重过敏家族史的家庭。',
        '常规剂量用药后效果不佳或反应明显的情况。',
      ],
    },
  },
]

export const fallbackAnswer: Answer = {
  intro: '感谢您的提问，我已经收到了。',
  points: [
    '为了给出更准确的参考，可以补充您正在服用的药物名称和剂量。',
    '如果已经做过基因检测，可以在“检测报告”中关联报告后再提问。',
  ],
  tip: '如有不适，请及时就医，遵从医生的诊疗建议。',
}
