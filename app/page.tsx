import { PhoneFrame } from '@/components/mini/phone-frame'
import { WelcomeScreen } from '@/components/mini/welcome-screen'
import { WechatAuthScreen } from '@/components/mini/wechat-auth-screen'
import { BrandMark } from '@/components/mini/auth-parts'
import { HomeFlow } from '@/components/mini/home-flow'
import { AiChatScreen } from '@/components/mini/ai-chat-screen'
import { ConsentReaderArtboard, ExamineeFormArtboard, SiteListArtboard } from '@/components/mini/standalone-sub-pages'
import { MineScreen } from '@/components/mini/mine-screen'

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
    desc: '检测服务列表：顶部搜索栏（支持项目 / 药物 / 基因关键词）与购物车，分类筛选；点击服务进入详情，「+」快速加购（可在画板内交互）',
    node: <HomeFlow initialTab="test" />,
  },
  {
    id: '11',
    title: '检测 · 服务详情',
    desc: '商品大图、基本信息（价格、采样方式、出报告时间、覆盖药物）、详情介绍；底部操作：联系客服、购物车、加入购物车、立即购买',
    node: <HomeFlow initialTab="test" initialDetailId="cardio" />,
  },
  {
    id: '12',
    title: '检测 · 购物车',
    desc: '勾选 / 全选、份数加减（单项最多 10 份）、合计与优惠金额、去结算；「管理」切换批量删除；空购物车引导去逛逛，底部为你推荐可快速加购（可在画板内交互）',
    node: (
      <HomeFlow
        initialTab="test"
        initialCartOpen
        initialCart={[
          { id: 'cardio', qty: 1, checked: true },
          { id: 'child', qty: 2, checked: true },
          { id: 'diabetes', qty: 1, checked: false },
        ]}
      />
    ),
  },
  {
    id: '13',
    title: '检测 · 确认订单',
    desc: '选择受检人（报告归档至成员档案）、采样盒寄送地址 / 定点采样机构、检测项目清单、优惠券（自动选最优，可切换）、价格明细；须勾选知情同意书后提交，提交后进入支付结果与后续步骤（可在画板内交互）',
    node: (
      <HomeFlow
        initialTab="test"
        initialCheckout={[
          { id: 'cardio', qty: 1 },
          { id: 'child', qty: 2 },
        ]}
      />
    ),
  },
  {
    id: '14',
    title: '确认订单 · 添加受检人',
    desc: '与本人关系（本人仅可添加一次）、姓名、性别、出生日期、手机号、身份证号；必填项实时校验，保存后自动选中为受检人，报告归档至成员档案（可在画板内交互）',
    node: <ExamineeFormArtboard />,
  },
  {
    id: '15',
    title: '确认订单 · 定点采样机构',
    desc: '关键词搜索、类型筛选（医院 / 第三方检验机构 / 今日可采），按距离排序；展示地址、营业时间、支持的样本类型，可导航，选择后返回订单页（可在画板内交互）',
    node: <SiteListArtboard />,
  },
  {
    id: '17',
    title: '确认订单 · 知情同意书强制阅读',
    desc: '点击勾选框或书名进入；须阅读满 8 秒且滑动至底部，「我已阅读并同意」按钮才可点击，同意后返回订单页自动勾选；已勾选时再次点击可取消（可在画板内交互）',
    node: <ConsentReaderArtboard />,
  },
  {
    id: '16',
    title: '我的 · 授权管理',
    desc: '按受检人 × 检测项目展示科研样本授权状态（已授权 / 未授权 / 已撤回），支持签署、重新签署与撤回，操作前弹出知情同意书或撤回提示（可在画板内交互）',
    node: <MineScreen initialAuthOpen />,
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
