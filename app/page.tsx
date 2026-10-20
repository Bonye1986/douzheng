import { DesignBoard, type BoardSection } from '@/components/design/design-board'
import { WelcomeScreen } from '@/components/mini/welcome-screen'
import { WechatAuthScreen } from '@/components/mini/wechat-auth-screen'
import { BrandMark } from '@/components/mini/auth-parts'
import { HomeFlow } from '@/components/mini/home-flow'
import { AiChatScreen } from '@/components/mini/ai-chat-screen'
import { ConsentReaderArtboard, ExamineeFormArtboard, SiteListArtboard } from '@/components/mini/standalone-sub-pages'
import { MineScreen } from '@/components/mini/mine-screen'
import {
  AfterSalesArtboard,
  AfterSalesDetailArtboard,
  CancelOrderArtboard,
  OrderActionArtboard,
  OrderDetailArtboard,
  OrderListArtboard,
  OrderListEmptyArtboard,
  ResampleRefundArtboard,
  ShippedRefundArtboard,
} from '@/components/mini/order-artboards'

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
    desc: '轮播图、服务分类、推荐检测、知识科普、互动问答；用药咨询 / 报告解读与问答结果可一键带入 AI 咨询（可在画板内交互）',
    node: <HomeFlow initialTab="service" />,
  },
  {
    id: '09-knowledge',
    title: '服务 · 知识科普',
    desc: '科普文章列表：按分类筛选（基因与用药、检测常识等），展示封面、标题（最多 2 行）、简介（最多 2 行）与阅读量；点击文章进入详情（可在画板内交互）',
    node: <HomeFlow initialTab="service" initialKnowledge="list" />,
  },
  {
    id: '09-article',
    title: '知识科普 · 文章详情',
    desc: '文章标题、阅读信息、正文与要点提示，文末附科普免责声明；返回回到来源页面',
    node: <HomeFlow initialTab="service" initialKnowledge="a1" />,
  },
  {
    id: '09-quiz',
    title: '服务 · 互动问答',
    desc: '问答文章列表：按分类筛选，展示封面、标题、阅读信息与「含问卷 / 已参与」标签；点击进入问答文章详情（可在画板内交互）',
    node: <HomeFlow initialTab="service" initialQuiz="list" />,
  },
  {
    id: '09-quiz-article',
    title: '互动问答 · 文章详情',
    desc: '与科普文章详情一致的正文排版，底部固定问卷入口（问卷名称、题数、参与人数与「参与问卷」按钮）',
    node: <HomeFlow initialTab="service" initialQuiz="q1" />,
  },
  {
    id: '09-survey',
    title: '互动问答 · 问卷调查',
    desc: '问卷说明与答题进度，支持单选、多选与选填文本题；必答题完成后可提交，提交后展示「大家的选择」统计结果',
    node: <HomeFlow initialTab="service" initialQuiz="q1" initialSurvey />,
  },
  {
    id: '09-survey-result',
    title: '互动问答 · 问卷结果',
    desc: '提交后的结果页：提交成功提示，各题「大家的选择」百分比统计，并高亮我的选项',
    node: (
      <HomeFlow
        initialTab="service"
        initialQuiz="q1"
        initialSurvey
        initialSurveyAnswers={{
          'q1-1': 'b',
          'q1-2': 'a',
          'q1-3': ['a', 'c'],
          'q1-4': '降压药可以和保健品一起吃吗？',
        }}
      />
    ),
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
    desc: '勾选 / 全选、仅展示检测项目不显示数量（最终份数按检测人数确定）、合计、去结算；「管理」切换批量删除；空购物车引导去逛逛，底部为你推荐可快速加购（可在画板内交互）',
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
    desc: '选择受检人（报告归档至成员档案）、采样盒寄送地址 / 定点采样机构、检测项目清单、优惠券（自动选最优，可切换）、价格明细；须勾选知情同意书后提交；点击提交订单唤起微信支付，支付完成后跳转订单结果页（可在画板内交互）',
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
    desc: '用户信息（头像 / 昵称 / 手机号）、我的订单（状态快捷入口与数量角标，进入订单列表 / 退款售后）、待处理（改价待支付 / 样本不合格待选择）、我的报告与 AI 解读、我的优惠券 / 领券中心、检测人管理 / 地址管理 / 授权与同意书 / 用药提醒 / 使用指南 / 关于我们 / 联系客服 / 账号设置（可在画板内交互）',
    node: <HomeFlow initialTab="me" />,
  },
  {
    id: '18-guest',
    title: '我的 · 未登录',
    desc: '未登录时展示默认头像与「登录 / 注册」按钮，订单角标、报告与优惠券数量隐藏；点击订单、报告、优惠券、领券中心及检测人管理 / 地址管理 / 授权与同意书 / 用药提醒 / 账号设置弹出登录提示；使用指南、关于我们、联系客服无需登录（可在画板内交互）',
    node: <HomeFlow initialTab="me" loggedIn={false} />,
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
    desc: '报告信息（项目 / 受检人 / 出具日期 / 编号）、检测结论（需调整 / 谨慎使用 / 正常使用占比）；用药建议按等级筛选，点击药物展开具体建议；基因检测结果展示基因、位点、基因型与表型；底部可将报告以 PDF 格式转发给微信好友、保存到手机或复制下载链接（可在画板内交互）',
    node: <MineScreen initialReportOpen initialReportDetailId="BG20261008001" />,
  },
  {
    id: '22',
    title: '我的 · 我的优惠券',
    desc: '按可使用 / 已使用 / 已过期分类展示优惠券（面额、门槛、适用范围、有效期），即将过期标签提醒；可使用券点击去使用，顶部入口跳转领券中心；底部展示使用说明（可在画板内交互）',
    node: <MineScreen initialCoupon="mine" />,
  },
  {
    id: '23',
    title: '我的 · 领券中心',
    desc: '展示可领取的优惠券（新人券、套餐券、项目专享券），显示剩余比例；点击立即领取后变为已领取并提示，库存为 0 显示已抢光；领取的券进入我的优惠券（可在画板内交互）',
    node: <MineScreen initialCoupon="center" />,
  },
  {
    id: '24',
    title: '我的 · 检测人管理',
    desc: '展示已添加的检测人（关系、性别年龄、出生日期、手机号、报告数；仅本人展示实名状态），最多 10 位；每张卡片可编辑、删除，底部添加检测人（可在画板内交互）',
    node: <MineScreen initialExamineeView="list" />,
  },
  {
    id: '25',
    title: '检测人管理 · 添加检测人',
    desc: '填写与本人关系、姓名、性别、出生日期（必填）及手机号、身份证号（选填）；「本人」仅可添加一位，校验通过后保存并返回列表',
    node: <MineScreen initialExamineeView="add" />,
  },
  {
    id: '26',
    title: '检测人管理 · 编辑检测人',
    desc: '回填已有信息，可修改后保存；本人的关系不可修改，已脱敏的手机号 / 身份证号不修改时原样保留',
    node: <MineScreen initialExamineeView="edit" />,
  },
  {
    id: '27',
    title: '检测人管理 · 删除检测人',
    desc: '删除前二次确认，说明历史报告仍保留；「本人」或有进行中订单的检测人不可删除，弹窗提示原因',
    node: <MineScreen initialExamineeView="delete" />,
  },
  {
    id: '28',
    title: '检测人管理 · 空状态',
    desc: '尚未添加任何检测人时展示引导插图与说明，点击添加检测人进入添加表单',
    node: <MineScreen initialExamineeView="empty" />,
  },
  {
    id: '29',
    title: '我的 · 地址管理',
    desc: '展示已保存的收货地址（收货人、手机号、标签、省市区与详细地址），默认地址置顶，最多 20 个；每张卡片可设为默认、编辑、删除，底部新增收货地址（可在画板内交互）',
    node: <MineScreen initialAddressView="list" />,
  },
  {
    id: '30',
    title: '地址管理 · 新增地址',
    desc: '填写收货人、手机号、所在地区（省 / 市 / 区三级选择）与详细地址，可选标签与设为默认；首个地址自动设为默认，校验通过后保存',
    node: <MineScreen initialAddressView="add" />,
  },
  {
    id: '31',
    title: '地址管理 · 编辑地址',
    desc: '回填已有地址信息，可修改后保存；脱敏手机号不修改时原样保留，当前默认地址不可取消默认',
    node: <MineScreen initialAddressView="edit" />,
  },
  {
    id: '32',
    title: '地址管理 · 删除地址',
    desc: '删除前二次确认并展示地址摘要；删除默认地址时自动顺延下一个为默认；有待发货采样盒订单使用的地址不可删除',
    node: <MineScreen initialAddressView="delete" />,
  },
  {
    id: '33',
    title: '地址管理 · 空状态',
    desc: '尚未保存任何地址时展示引导插图与说明，点击新增收货地址进入表单',
    node: <MineScreen initialAddressView="empty" />,
  },
  {
    id: '35',
    title: '我的 · 用药提醒',
    desc: '顶部概览下一次提醒时间、今日提醒次数与进行中数量；提醒卡片展示药品、用药人、剂量、服用要求、频率与时间点，可开关暂停微信、编辑、删除，最多 20 条（可在画板内交互）',
    node: <MineScreen initialReminderView="list" />,
  },
  {
    id: '36',
    title: '用药提醒 · 添加提醒',
    desc: '选择用药人，填写药品名称、单次剂量与单位、服用要求；设置频率（每天 / 隔天 / 每周指定日）、最多 6 个服用时间、开始日期与疗程；配置短信接收手机号与发送时间并实时预览短信内容',
    node: <MineScreen initialReminderView="add" />,
  },
  {
    id: '37',
    title: '用药提醒 · 编辑提醒',
    desc: '回填已有提醒信息，修改后保存立即按新计划发送短信；脱敏手机号不修改时原样保留，保留开关状态',
    node: <MineScreen initialReminderView="edit" />,
  },
  {
    id: '38',
    title: '用药提醒 · 删除提醒',
    desc: '删除前二次确认并展示药品、用药人与时间摘要，提示删除后不再发送短信且不可恢复，仅想暂停可关闭开关',
    node: <MineScreen initialReminderView="delete" />,
  },
  {
    id: '39',
    title: '用药提醒 · 空状态',
    desc: '尚未设置任何提醒时展示引导插图与说明，点击添加用药提醒进入表单',
    node: <MineScreen initialReminderView="empty" />,
  },
  {
    id: '40',
    title: '我的 · 使用指南',
    desc: '顶部搜索与分类页签（全部 / 下单购买 / 采样寄回 / 查看报告 / 授权隐私），「新手必读」封面推荐 + 文章列表（标题、摘要、分类、阅读时长、阅读量），无结果空状态与联系客服入口（可在画板内交互）',
    node: <MineScreen initialGuideView="list" />,
  },
  {
    id: '41',
    title: '使用指南 · 文章详情',
    desc: '标题、分类、更新时间与阅读信息，封面图，正文段落 / 小标题 / 编号步骤 / 注意事项提示框；底部有帮助反馈、相关指南，联系客服与问问 AI 固定操作栏（可在画板内交互）',
    node: <MineScreen initialGuideView="detail" />,
  },
  {
    id: '42',
    title: '我的 · 关于我们',
    desc: '品牌头部（Logo、口号、版本号），平台数据概览，公司简介、核心优势、资质认证、发展历程，联系我们（拨打 / 复制），协议与资质入口、检查更新，底部公司主体与备案信息（可在画板内交互）',
    node: <MineScreen initialAboutOpen />,
  },
  {
    id: '43',
    title: '我的 · 联系客服',
    desc: '小程序客服会话：人工客服接入提示、消息气泡、订单推荐卡片一键发送、常见问题快捷提问、输入栏与更多功能面板（图片 / 订单 / 报告）（可在画板内交互）',
    node: <MineScreen initialServiceOpen />,
  },
  {
    id: '44',
    title: '我的 · 账号设置',
    desc: '个人资料（头像 / 昵称 / 绑定手机号），短信通知开关（用药提醒 / 报告出具 / 订单与样本进度 / 优惠活动），隐私与协议、系统权限、清除缓存，注销账号与退出登录（可在画板内交互）',
    node: <MineScreen initialAccountView="main" />,
  },
  {
    id: '45',
    title: '账号设置 · 更换手机号',
    desc: '两步流程：短信验证原手机号 → 输入新手机号并验证，含 60 秒重发倒计时与重复号码校验（可在画板内交互）',
    node: <MineScreen initialAccountView="phone" />,
  },
  {
    id: '46',
    title: '账号设置 · 注销���号',
    desc: '注销风险提示、数据清除说明、进行中订单检查、短信验证与须知勾选，二次确认后进入 7 天冷静期（可在画板内交互）',
    node: <MineScreen initialAccountView="deactivate" />,
  },
  {
    id: '16',
    title: '授权与同意书 · 检测知情同意书',
    desc: '分「检测知情同意书 / 科研知情同意书」两个页签：检测知情同意书按订单存档，下单必签、不可撤回；科研知情同意书按订单 × 项目 × 受检人展示（待签署 / 已授权 / 已撤回）（可在画板内交互）',
    node: <MineScreen initialAuthOpen />,
  },
  {
    id: '16-empty',
    title: '授权与同意书 · 检测知情同意书 · 空状态',
    desc: '尚未下单检测时，检测知情同意书页签展示空状态插图与说明：下单时阅读并同意后签署记录将按订单存档（可在画板内交互）',
    node: <MineScreen initialAuthOpen initialAuthEmpty />,
  },
  {
    id: '34',
    title: '授权与同意书 · 科研知情同意书',
    desc: '科研知情同意书签署 / 撤销流程：阅读文书 → e签宝 人脸核验 → 签署完成；已授权可签署《科研知情同意撤销书》撤回授权（可在画板内交互）',
    node: <MineScreen initialAuthOpen initialAuthTab="research" />,
  },
  {
    id: '34-empty',
    title: '授权与同意书 · 科研知情同意书 · 空状态',
    desc: '未勾选任何科研授权时，科研知情同意书页签展示空状态插图与说明：科研授权为自愿，不影响检测与报告（可在画板内交互）',
    node: <MineScreen initialAuthOpen initialAuthTab="research" initialAuthEmpty />,
  },
  {
    id: '19',
    title: '售后 · 样本不合格处理',
    desc: '后台点击重采样后短信通知用户，用户自选：免费重采样（原订单关闭，生成新的已付款订单并标记「重采样」）或终止订单并退款（需联系客服，扣除已产生的各类费用后退款）（可在画板内交互）',
    node: <MineScreen initialResampleOpen />,
  },
  {
    id: '47',
    title: '我的 · 订单列表',
    desc: '按采样类型（全部 / 自采样 / 定点采样）切换对应状态集合：自采样（待付款、待发货、待收货、待采样、待寄样、待收样、待检测、检测中、已完成、已关闭）/ 定点采样（待付款、待核销、待采样、待寄样、待收样、待检测、检测中、已完成、已关闭），每个状态 5 条；订单卡片按状态展示操作（可在画板内交互）',
    node: <OrderListArtboard />,
  },
  {
    id: '48',
    title: '订单列表 · 采样指引视频',
    desc: '点击「采样指引」弹窗播放后台上传的采样操作视频，时长读取自视频文件，可关闭弹窗（可在画板内交互）',
    node: <OrderListArtboard initialGuideOpen />,
  },
  {
    id: '53',
    title: '订单列表 · 空状态',
    desc: '尚无任何订单时展示引导插图与说明，点击去选购检测进入检测列表；有订单但当前状态 / 类型下无数据、或搜索无结果时，列表区展示对应空状态（搜索无结果可一键清除搜索）',
    node: <OrderListEmptyArtboard />,
  },
  {
    id: '49',
    title: '售后 · 取消订单',
    desc: '已支付、尚未发货的订单取消后生成的售后记录：展示退款成功状态、处理进度（取消订单 → 订单关闭 → 退款到账）、全额退款明细与售后信息（可在画板内交互）',
    node: <CancelOrderArtboard />,
  },
  {
    id: '50',
    title: '售后 · 发货后申请退款',
    desc: '采样盒已发货后申请退款，二选一：①自费寄回采样盒，全额退款；②扣除采样盒费用后退款（可在画板内交互）',
    node: <ShippedRefundArtboard />,
  },
  {
    id: '51',
    title: '我的 · 退款 / 售后',
    desc: '售后记录列表：取消退款、发货后退款、样本不合格处理，展示处理状态与退款金额，待处理项可直接去处理（可在画板内交互）',
    node: <AfterSalesArtboard />,
  },
  {
    id: '51-detail',
    title: '售后 · 售后详情',
    desc: '展示售后状态、处理进度时间轴、退款信息（扣除费用与退款金额）、关联订单与售后编号 / 类型 / 原因 / 申请时间，待处理或重采样订单底部可继续操作（可在画板内交互）',
    node: <AfterSalesDetailArtboard />,
  },
  {
    id: '47-detail',
    title: '订单列表 · 订单详情',
    desc: '展示订单状态与检测进度、检测项目、受检人、实付金额与订单信息（订单编号、样本编码、下单时间等），底部按状态展示操作按钮（可在画板内交互）',
    node: <OrderDetailArtboard />,
  },
  {
    id: '47-cancel',
    title: '订单列表 · 取消订单',
    desc: '待付款订单点击「取消订单」弹出二次确认，确认后订单关闭；已支付未发货订单取消后金额原路退回（可在画板内交互）',
    node: <OrderActionArtboard kind="cancel" />,
  },
  {
    id: '47-pay',
    title: '订单列表 · 去支付',
    desc: '待付款订单点击「去支付」拉起微信支付，展示应付金额；支付成功后自采样订单变为待发货，定点采样订单变为待核销，多人订单按受检人拆分（可在画板内交互）',
    node: <OrderActionArtboard kind="pay" />,
  },
  {
    id: '47-code',
    title: '订单列表 · 查看核销码',
    desc: '定点采样待核销订单点击「核销码」，展示订单编号、检测项目、受检人、采样机构与核销二维码，到店出示完成核销（可在画板内交互）',
    node: <OrderActionArtboard kind="code" />,
  },
  {
    id: '47-refund',
    title: '订单列表 · 申请退款',
    desc: '已寄样 / 检测中订单点击「申请退款」，展示订单信息、已产生费用与预计退款金额，选择原因后提交，订单关闭并原路退回剩余金额（可在画板内交互）',
    node: <OrderActionArtboard kind="refund" />,
  },
  {
    id: '47-logistics',
    title: '订单列表 · 查看物流',
    desc: '待收货订单查看采样盒寄出物流，待收样订单查看样本回寄物流：快递公司、运单号与物流轨迹时间轴（可在画板内交互）',
    node: <OrderActionArtboard kind="logistics" />,
  },
  {
    id: '47-send',
    title: '订单列表 · 寄样',
    desc: '自采样待采样 / 待寄样订单点击「寄样」，预约顺丰上门取件：确认寄件地址与上门时间，提交后订单变为待收样（可在画板内交互）',
    node: <OrderActionArtboard kind="send" />,
  },
  {
    id: '47-report',
    title: '订单列表 · 查看报告',
    desc: '已完成订单点击「查看报告」直接打开该订单的检测报告详情，可查看结论、用药建议与基因检测结果并分享 PDF（可在画板内交互）',
    node: <OrderActionArtboard kind="report" />,
  },
  {
    id: '52',
    title: '售后 · 终止订单并退款',
    desc: '样本不合格后选择终止订单：展示已产生费用明细与预计退款金额，需联系客服确认，扣除已产生的各类费用后退款',
    node: <ResampleRefundArtboard />,
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
    node: <AiChatScreen initialMode="pro" initialTesteeId="self" initialQuestion="我能正常使用氯吡格雷吗？" />,
  },
  {
    id: '06',
    title: 'AI咨询 · 历史对话抽屉',
    desc: '左侧滑出抽屉，可搜索、新建、切换会话，「…」菜单内修改名称或删除会话（删除需二次确认）（可在画板内交互）',
    node: <AiChatScreen initialQuestion="我能正常使用氯吡格雷吗？" initialDrawerOpen />,
  },
]

const sectionPlan: { key: string; title: string; summary: string; ids: string[] }[] = [
  { key: 'login', title: '登录注册', summary: '微信手机号授权登录，拒绝授权的拦截与提示', ids: ['01', '02', '03'] },
  {
    key: 'home',
    title: '首页与AI咨询',
    summary: 'AI 对话入口与预设问题，通俗 / 专业版切换，关联检测人后的个性化用药解答',
    ids: ['04', '05', '06', '07', '08'],
  },
  { key: 'service', title: '服务', summary: '轮播、服务分类、推荐检测、知识科普、互动问答与问卷调查，一键带入 AI 咨询', ids: ['09', '09-knowledge', '09-article', '09-quiz', '09-quiz-article', '09-survey', '09-survey-result'] },
  {
    key: 'order',
    title: '检测下单',
    summary: '检测列表、服务详情、购物车、确认订单（受检人、采样机构、知情同意书）与微信支付',
    ids: ['10', '11', '12', '13', '14', '15', '17'],
  },
  {
    key: 'orders',
    title: '我的订单与售后',
    summary: '订单列表与订单详情、采样指引视频，发货前取消、发货后退款、售后列表与售后详情、样本不合格重采样或终止退款',
    ids: [
      '47',
      '47-detail',
      '47-cancel',
      '47-pay',
      '47-code',
      '47-refund',
      '47-logistics',
      '47-send',
      '47-report',
      '48',
      '53',
      '49',
      '50',
      '51',
      '51-detail',
      '19',
      '52',
    ],
  },
  {
    key: 'mine',
    title: '我的',
    summary: '个人中心、我的报告与报告详情、我的优惠券与领券中心',
    ids: ['18', '18-guest', '20', '21', '22', '23'],
  },
  {
    key: 'consent',
    title: '授权与同意书',
    summary: '检测知情同意书存档，科研知情同意书签署 / 撤销（e签宝人脸核验）',
    ids: ['16', '16-empty', '34', '34-empty'],
  },
  {
    key: 'examinee',
    title: '检测人管理',
    summary: '检测人列表、添加 / 编辑 / 删除检测人与空状态',
    ids: ['24', '25', '26', '27', '28'],
  },
  {
    key: 'address',
    title: '地址管理',
    summary: '收货地址列表、新增 / 编辑 / 删除地址、设为默认与空状态',
    ids: ['29', '30', '31', '32', '33'],
  },
  {
    key: 'reminder',
    title: '用药提醒',
    summary: '提醒列表、添加 / 编辑 / 删除提醒、暂停开关与空状态，到点短信通知用户',
    ids: ['35', '36', '37', '38', '39'],
  },
  {
    key: 'help',
    title: '帮助与客服',
    summary: '使用指南（搜索 + 分类、文章详情）与小程序客服会话',
    ids: ['40', '41', '43'],
  },
  {
    key: 'account',
    title: '设置与关于',
    summary: '账号设置、更换手机号、注销账号，以及品牌介绍、资质与协议版本信息',
    ids: ['44', '45', '46', '42'],
  },
]

let pageNo = 0
const sections: BoardSection[] = sectionPlan.map(({ ids, ...section }) => ({
  ...section,
  screens: ids.flatMap((noteKey) => {
    const screen = screens.find((s) => s.id === noteKey)
    if (!screen) return []
    pageNo += 1
    return [{ ...screen, noteKey, id: String(pageNo).padStart(2, '0') }]
  }),
}))
const pageCount = pageNo

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e6f1fe_0%,#f4f8fe_45%)] px-6 py-10 lg:px-12">
      <DesignBoard
        sections={sections}
        header={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-10">
        <div className="flex items-center gap-4">
          <BrandMark size="lg" />
          <div>
            <p className="text-note font-medium text-primary">都正生物 · 药问基因用户端小程序</p>
            <h1 className="mt-1 text-headline font-bold text-foreground md:text-display">UI设计</h1>
          </div>
        </div>
        <dl className="flex gap-6 text-note text-muted-foreground">
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
            <dd className="font-medium text-foreground">{pageCount} 个</dd>
          </div>
        </dl>
          </div>
        }
      />
    </main>
  )
}
