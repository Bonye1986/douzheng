'use client'

import { SubPage } from '@/components/mini/sub-page'

export type LegalDocKind = 'terms' | 'privacy'

type Section = { heading: string; paragraphs: string[]; list?: string[] }

type LegalDoc = { title: string; updated: string; effective: string; intro: string; sections: Section[] }

const docs: Record<LegalDocKind, LegalDoc> = {
  terms: {
    title: '用户服务协议',
    updated: '2026年9月20日',
    effective: '2026年10月1日',
    intro:
      '欢迎使用「药问基因」小程序（以下简称“本平台”）。本平台由都正生物科技有限公司（以下简称“我们”）运营。请你在使用本平台前仔细阅读本协议，特别是以加粗方式提示的免除或限制责任条款。你点击同意或实际使用本平台服务，即视为你已阅读并同意本协议全部内容。',
    sections: [
      {
        heading: '一、服务内容',
        paragraphs: ['本平台向你提供以下服务：'],
        list: [
          '药物基因检测项目的浏览、预约下单与支付；',
          '采样盒寄送、样本回寄及检测进度查询；',
          '检测报告查询、下载与 AI 辅助解读；',
          '用药提醒、检测人与收货地址管理等辅助功能。',
        ],
      },
      {
        heading: '二、账号注册与使用',
        paragraphs: [
          '你可通过微信手机号快捷登录注册账号，未注册的手机号授权后将自动创建账号。你应保证所提供的手机号为本人合法持有，并妥善保管账号，因你个人原因导致的账号泄露、被盗用等损失由你自行承担。',
          '你为他人（如家属）添加检测人信息时，应事先取得其本人或其监护人的明确授权。',
        ],
      },
      {
        heading: '三、检测服务说明',
        paragraphs: [
          '检测服务由具备相应资质的医学检验实验室完成。检测结果受样本质量、采集方式等因素影响，如样本不合格，我们将通知你重新采样。',
          '检测报告及 AI 解读内容仅作为临床用药参考，不能替代执业医师的诊断与治疗建议。请勿依据报告自行调整、停用或更换药物，任何用药决策请遵医嘱。',
        ],
      },
      {
        heading: '四、费用与退款',
        paragraphs: [
          '检测服务价格以下单页面展示为准。订单支付后、采样盒寄出前可申请全额退款；样本已进入实验室检测流程后，原则上不予退款，具体以订单售后规则为准。',
        ],
      },
      {
        heading: '五、用户行为规范',
        paragraphs: ['你在使用本平台时不得从事以下行为：'],
        list: [
          '冒用他人身份或提供虚假的检测人信息；',
          '利用本平台从事任何违法违规活动；',
          '以任何方式干扰、破坏本平台的正常运行。',
        ],
      },
      {
        heading: '六、知识产权',
        paragraphs: [
          '本平台的界面设计、文字、图片、软件及报告模板等内容的知识产权归我们所有。未经书面许可，任何人不得复制、传播或用于商业用途。你的检测报告归你本人所有。',
        ],
      },
      {
        heading: '七、责任限制',
        paragraphs: [
          '因不可抗力、网络故障、第三方服务异常等非我们过错导致的服务中断或延迟，我们不承担责任，但将尽力减少对你的影响。',
        ],
      },
      {
        heading: '八、协议变更与终止',
        paragraphs: [
          '我们可能根据业务调整修订本协议，修订后将通过小程序公告或弹窗方式通知你。你可随时在「我的 - 账号设置」中申请注销账号以终止本协议。',
        ],
      },
      {
        heading: '九、法律适用与争议解决',
        paragraphs: [
          '本协议适用中华人民共和国法律。因本协议产生的争议，双方应友好协商；协商不成的，任一方可向我们所在地有管辖权的人民法院提起诉讼。',
        ],
      },
      {
        heading: '十、联系我们',
        paragraphs: ['如你对本协议有任何疑问，可通过「我的 - 联系客服」或客服热线 400-800-6626 与我们联系。'],
      },
    ],
  },
  privacy: {
    title: '隐私政策',
    updated: '2026年9月20日',
    effective: '2026年10月1日',
    intro:
      '都正生物科技有限公司（以下简称“我们”）深知个人信息，尤其是基因信息与健康信息对你的重要性。我们将按照《个人信息保护法》《人类遗传资源管理条例》等法律法规的要求，采取相应的安全保护措施保护你的个人信息。',
    sections: [
      {
        heading: '一、我们收集的信息',
        paragraphs: ['为向你提供服务，我们会收集以下信息：'],
        list: [
          '账号信息：微信授权手机号、昵称、头像；',
          '检测人信息：姓名、性别、出生日期、身份证号、联系电话；',
          '健康信息：用药史、疾病史、过敏史等你主动填写的内容；',
          '基因信息：样本检测产生的基因型数据及检测报告；',
          '订单信息：收货地址、支付记录、物流信息。',
        ],
      },
      {
        heading: '二、我们如何使用信息',
        paragraphs: [
          '我们仅在以下目的范围内使用你的信息：完成检测服务与报告出具、寄送采样盒、发送检测进度与用药提醒通知、提供 AI 报告解读与客服支持、保障账号与交易安全。',
          '未经你的单独同意，我们不会将你的基因信息用于科研或其他目的。',
        ],
      },
      {
        heading: '三、敏感个人信息的处理',
        paragraphs: [
          '基因信息、健康信息、身份证号属于敏感个人信息。我们会在收集前单独征得你的同意，并采用加密存储、访问权限分级、操作日志审计等措施进行保护。基因原始数据存储于境内服务器，不会向境外提供。',
        ],
      },
      {
        heading: '四、信息共享与委托处理',
        paragraphs: ['我们仅在必要范围内与以下合作方共享信息，并要求其承担同等保密义务：'],
        list: [
          '合作医学检验实验室：用于样本检测与报告出具；',
          '物流服务商：用于采样盒寄送与样本回寄；',
          '支付服务商（微信支付）：用于完成订单支付。',
        ],
      },
      {
        heading: '五、信息存储期限',
        paragraphs: [
          '我们仅在实现服务目的所必需的期限内保存你的信息。你注销账号后，我们将在 15 个工作日内删除或匿名化处理你的个人信息，法律法规另有规定的除外。',
        ],
      },
      {
        heading: '六、你的权利',
        paragraphs: ['你可以在本平台行使以下权利：'],
        list: [
          '查阅、复制、更正你的个人信息；',
          '在「授权管理」中撤回科研使用等单独同意；',
          '删除检测人、地址等信息，或申请注销账号；',
          '通过小程序右上角「设置」管理系统权限。',
        ],
      },
      {
        heading: '七、未成年人保护',
        paragraphs: [
          '若检测人为不满 14 周岁的未成年人，应由其监护人代为添加并同意本政策。我们将对未成年人的个人信息给予特别保护。',
        ],
      },
      {
        heading: '八、政策更新',
        paragraphs: ['本政策更新后，我们会以弹窗等显著方式通知你，涉及敏感信息处理规则变化的，将再次征得你的同意。'],
      },
      {
        heading: '九、联系我们',
        paragraphs: [
          '如你对本政策有任何疑问、意见或投诉，可通过「我的 - 联系客服」或发送邮件至 privacy@drugene.cn 与我们的个人信息保护负责人联系，我们将在 15 个工作日内答复。',
        ],
      },
    ],
  },
}

export function LegalDocScreen({ kind, onBack }: { kind: LegalDocKind; onBack: () => void }) {
  const doc = docs[kind]
  const titleId = `legal-${kind}-title`
  return (
    <SubPage title={doc.title} titleId={titleId} onBack={onBack}>
      <article className="flex-1 overflow-y-auto bg-white px-5 pb-10 pt-4 [scrollbar-width:none]">
        <p className="text-caption text-muted-foreground">
          更新日期：{doc.updated}
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          生效日期：{doc.effective}
        </p>
        <p className="mt-3 text-body leading-6 text-foreground">{doc.intro}</p>
        {doc.sections.map((section) => (
          <section key={section.heading} className="mt-5">
            <h2 className="text-title font-semibold text-foreground">{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p} className="mt-2 text-body leading-6 text-foreground/75">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-1.5 space-y-1">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-2 text-body leading-6 text-foreground/75">
                    <span className="mt-[11px] size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <p className="mt-8 text-right text-caption text-muted-foreground">都正生物科技有限公司</p>
      </article>
    </SubPage>
  )
}
