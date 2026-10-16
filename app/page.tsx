import { DesignBoard, type BoardSection } from '@/components/design/design-board'
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
    id: '18',
    title: '我的',
    desc: '用户信息（头像 / 昵称 / 手机号）、我的订单（全部 / 自采样 / 定点采样 × 待付款 / 待采样 / 检测中 / 已完成 / 退款售后五阶段，切换类型时售后对应自采或定点重采样）、待处理（改价待支付 / 样本不合格待选择）、我的报告与 AI 解读、我的优惠券 / 领券中心、检测人管理 / 地址管理 / 授权与同意书 / 用药提醒 / 使用指南 / 关于我们 / 联系客服 / 账号设置（可在画板内交互）',
    node: <HomeFlow initialTab="me" />,
  },
  {
    id: '20',
    title: '我的 · 我的报告',
    desc: '按受检人筛选；已出具报告展示需调整 / 谨慎使用 / 正常使用药物数量，可查看报告、AI 解读、分享报告；检测中报告展示进度（已收样 → 检测中 → 出具报告），重采样订单带标记（可在画板内交互）',
    node: <MineScreen initialReportOpen />,
  },
  {
    id: '21',
    title: '我的 · 报告详情',
    desc: '报告信息（项目 / 受检人 / 出具日期 / 编号）、检测结论（需调整 / 谨慎使用 / 正常使用占比）；用药建议按等级筛选，点击药物展开具体建议；基因检测结果展示基因、位点、基因型与表型；底部可分享报告或 AI 解读报告（可在画板内交互）',
    node: <MineScreen initialReportOpen initialReportDetailId="BG20261008001" />,
  },
  {
    id: '16',
    title: '我的 · 授权与同意书',
    desc: '按受检人 × 检测项目展示科研样本授权状态（已授权 / 未授权 / 已撤回），支持签署、重新签署与撤回，操作前弹出知情同意书或撤回提示（可在画板内交互）',
    node: <MineScreen initialAuthOpen />,
  },
  {
    id: '19',
    title: '我的 · 样本不合格处理',
    desc: '后台发起重采后短信通知用户，用户自选：申请退款（提交原因，后台审核全额 / 部分退款）或免费重采样（原订单关闭，生成新的已付款订单并标记「重采样」，重新走订单流程）（可在画板内交互）',
    node: <MineScreen initialResampleOpen />,
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

const sectionPlan: { key: string; title: string; summary: string; ids: string[] }[] = [
  { key: 'login', title: '登录注册', summary: '微信手机号授权登录，拒绝授权的拦截与提示', ids: ['01', '02', '03'] },
  { key: 'home', title: '首页与服务', summary: 'AI 对话入口、预设问题，服务内容与一键带入咨询', ids: ['04', '09'] },
  {
    key: 'order',
    title: '检测下单',
    summary: '检测列表、服务详情、购物车与确认订单（受检人、采样机构、知情同意书）',
    ids: ['10', '11', '12', '13', '14', '15', '17'],
  },
  {
    key: 'mine',
    title: '我的',
    summary: '订单、报告与报告详情、授权与同意书、样本不合格处理',
    ids: ['18', '20', '21', '16', '19'],
  },
  { key: 'ai', title: 'AI咨询', summary: '通俗 / 专业版切换、关联检测人后的个性化用药解答', ids: ['05', '07', '08'] },
]

const sections: BoardSection[] = sectionPlan.map(({ ids, ...section }) => ({
  ...section,
  screens: ids.map((id) => screens.find((screen) => screen.id === id)).filter((s): s is (typeof screens)[number] => !!s),
}))

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e3f0ff_0%,#f4f8fe_45%)] px-6 py-10 lg:px-12">
      <DesignBoard
        sections={sections}
        header={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-10">
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
          </div>
        }
      />
    </main>
  )
}
