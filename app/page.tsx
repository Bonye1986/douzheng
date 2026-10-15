import { PhoneFrame } from '@/components/mini/phone-frame'
import { WelcomeScreen } from '@/components/mini/welcome-screen'
import { WechatAuthScreen } from '@/components/mini/wechat-auth-screen'
import { BrandMark } from '@/components/mini/auth-parts'
import { HomeFlow } from '@/components/mini/home-flow'
import { AiChatScreen } from '@/components/mini/ai-chat-screen'

const screens = [
  {
    id: '01',
    title: '启动登录页',
    desc: '唯一入口：微信手机号快捷登录，未勾选协议时拦截并提示',
    node: <WelcomeScreen />,
  },
  {
    id: '02',
    title: '微信手机号授权',
    desc: '调用 getPhoneNumber 时的系统授权弹窗，允许后完成登录，新用户自动注册',
    node: <WechatAuthScreen />,
  },
  {
    id: '03',
    title: '拒绝授权提示',
    desc: '用户点击拒绝后回到登录页，Toast 提示需授权手机号才能登录',
    node: <WelcomeScreen defaultAgreed notice="需授权手机号才能登录，请重新点击授权" />,
  },
  {
    id: '04',
    title: '首页',
    desc: '仅保留平台 Logo、对话输入框、预设高频问题；点击输入框跳转 AI 咨询页，点击预设问题直接带入提问；底部菜单为首页 / 服务 / 检测 / 我的，AI 入口全局悬浮（可在画板内交互）',
    node: <HomeFlow />,
  },
  {
    id: '09',
    title: '服务',
    desc: '轮播图、服务分类、推荐检查、知识科普、互动问答；用药咨询 / 报告解读与问答结果可一键带入 AI 咨询（可在画板内交互）',
    node: <HomeFlow initialTab="service" />,
  },
  {
    id: '10',
    title: '检测',
    desc: '扫码绑定采样盒与检测流程说明；我的检测按状态筛选，展示进度、样本号与报告摘要，已出报告可一键 AI 解读（可在画板内交互）',
    node: <HomeFlow initialTab="test" />,
  },
  {
    id: '05',
    title: 'AI咨询 · 默认态',
    desc: '通俗版 / 专业版切换，未选检测人时按通用知识回答；技能入口与工具栏可直接触发对话',
    node: <AiChatScreen />,
  },
  {
    id: '07',
    title: 'AI咨询 · 选择检测人',
    desc: '底部弹层选择检测人（可跳过），授权后关联基本信息与历史报告',
    node: <AiChatScreen initialSheetOpen />,
  },
  {
    id: '08',
    title: 'AI咨询 · 专业版对话',
    desc: '已关联检测人，专业版回答展示基因型、代谢类型与指南证据来源',
    node: <AiChatScreen initialMode="pro" initialTesteeId="zhanghua" initialQuestion="我能正常使用氯吡格雷吗？" />,
  },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e3f0ff_0%,#f4f8fe_45%)] px-6 py-10 lg:px-12">
      <header className="mx-auto flex max-w-[1720px] flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <BrandMark size="lg" />
          <div>
            <p className="text-[13px] font-medium text-primary">都正生物 · 药问基因用户端小程序</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">登录注册 · 首页 · AI咨询 UI 设计稿</h1>
          </div>
        </div>
        <dl className="flex gap-6 text-[13px] text-muted-foreground">
          <div>
            <dt>画板尺寸</dt>
            <dd className="font-medium text-foreground">375 × 812</dd>
          </div>
          <div>
            <dt>登录方式</dt>
            <dd className="font-medium text-foreground">微信手机号授权</dd>
          </div>
          <div>
            <dt>页面数</dt>
            <dd className="font-medium text-foreground">{screens.length} 个</dd>
          </div>
        </dl>
      </header>

      <section
        aria-label="页面画板"
        className="mx-auto mt-10 flex max-w-[1720px] flex-wrap justify-center gap-x-8 gap-y-12"
      >
        {screens.map((screen) => (
          <article key={screen.id} className="flex w-[387px] flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-bold text-primary">{screen.id}</span>
              <h2 className="text-[16px] font-bold text-foreground">{screen.title}</h2>
            </div>
            <PhoneFrame label={screen.title}>{screen.node}</PhoneFrame>
            <p className="text-pretty text-[13px] leading-5 text-muted-foreground">{screen.desc}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
