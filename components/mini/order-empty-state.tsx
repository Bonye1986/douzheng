import { ClipboardList, SearchX } from 'lucide-react'

type OrderEmptyStateProps =
  | { variant: 'none'; onGoShop?: () => void }
  | { variant: 'search'; keyword: string; onClearSearch: () => void }
  | { variant: 'filtered'; label: string }

export function OrderEmptyState(props: OrderEmptyStateProps) {
  const Icon = props.variant === 'search' ? SearchX : ClipboardList
  const title =
    props.variant === 'none'
      ? '还没有订单'
      : props.variant === 'search'
        ? '未找到相关订单'
        : `暂无${props.label}订单`
  const desc =
    props.variant === 'none'
      ? '选购检测项目后，订单会显示在这里，可随时查看采样、检测进度与报告。'
      : props.variant === 'search'
        ? `没有与「${props.keyword}」匹配的订单，换个关键词试试，支持订单号、检测项目、受检人。`
        : '当前筛选条件下没有订单，可切换其他状态或订单类型查看。'

  const action =
    props.variant === 'none' && props.onGoShop
      ? { label: '去选购检测', onClick: props.onGoShop }
      : props.variant === 'search'
        ? { label: '清除搜索', onClick: props.onClearSearch }
        : null

  return (
    <div className="flex flex-1 flex-col items-center px-8 pt-20 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-[#e3eeff]" aria-hidden="true">
        <Icon className="size-11 text-primary" strokeWidth={1.4} />
      </span>
      <h2 className="mt-5 text-[16px] font-semibold text-foreground">{title}</h2>
      <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{desc}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={
            props.variant === 'none'
              ? 'mt-6 h-10 rounded-full bg-primary px-8 text-[14px] font-medium text-primary-foreground active:opacity-90'
              : 'mt-6 h-9 rounded-full border border-primary px-6 text-[13px] font-medium text-primary active:bg-primary/5'
          }
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
