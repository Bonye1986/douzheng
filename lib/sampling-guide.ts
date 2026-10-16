export type SamplingGuideVideo = {
  title: string
  videoUrl: string
  posterUrl: string
  updatedAt: string
  tips: string[]
}

// Mirrors the record managed in the admin console; replace videoUrl with the uploaded file's URL.
export const samplingGuideVideo: SamplingGuideVideo = {
  title: '口腔拭子自采样操作指引',
  videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  posterUrl: '/images/sampling-guide-poster.png',
  updatedAt: '2026-10-12',
  tips: [
    '采样前 30 分钟内请勿进食、饮水、吸烟或嚼口香糖',
    '用拭子在口腔两侧颊黏膜各刮擦 20 次以上',
    '将拭子放入采样管并旋紧管盖，贴好条码',
    '按说明装入回寄袋，预约快递寄回实验室',
  ],
}
