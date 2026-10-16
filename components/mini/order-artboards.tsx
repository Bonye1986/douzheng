'use client'

import { OrderListScreen } from '@/components/mini/order-list-screen'
import { AfterSalesScreen } from '@/components/mini/after-sales-screen'
import { CancelOrderScreen, ResampleRefundScreen, ShippedRefundScreen } from '@/components/mini/refund-screen'
import { ResampleScreen } from '@/components/mini/resample-screen'

const noop = () => {}

export function OrderListArtboard({ initialGuideOpen = false }: { initialGuideOpen?: boolean }) {
  return <OrderListScreen initialGuideOpen={initialGuideOpen} onBack={noop} onHandleUnqualified={noop} onRefund={noop} />
}

export function CancelOrderArtboard() {
  return (
    <>
      <OrderListScreen onBack={noop} onHandleUnqualified={noop} onRefund={noop} />
      <CancelOrderScreen onBack={noop} />
    </>
  )
}

export function ShippedRefundArtboard() {
  return <ShippedRefundScreen onBack={noop} />
}

export function AfterSalesArtboard() {
  return <AfterSalesScreen onBack={noop} onHandleUnqualified={noop} onTerminateResample={noop} />
}

export function ResampleArtboard() {
  return <ResampleScreen onBack={noop} />
}

export function ResampleRefundArtboard() {
  return <ResampleRefundScreen onBack={noop} onContact={noop} />
}
