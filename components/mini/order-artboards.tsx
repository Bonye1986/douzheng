'use client'

import { useState } from 'react'

import { OrderListScreen } from '@/components/mini/order-list-screen'
import { AfterSalesScreen } from '@/components/mini/after-sales-screen'
import { CancelOrderScreen, ResampleRefundScreen, ShippedRefundScreen } from '@/components/mini/refund-screen'
import { ResampleScreen } from '@/components/mini/resample-screen'

const noop = () => {}

type RefundKind = Parameters<React.ComponentProps<typeof OrderListScreen>['onRefund']>[0]

function OrderListWithRefund({ initialGuideOpen = false }: { initialGuideOpen?: boolean }) {
  const [refundKind, setRefundKind] = useState<RefundKind | null>(null)
  const [resampleOpen, setResampleOpen] = useState(false)
  const close = () => setRefundKind(null)

  return (
    <>
      <OrderListScreen
        initialGuideOpen={initialGuideOpen}
        onBack={noop}
        onHandleUnqualified={() => setResampleOpen(true)}
        onRefund={setRefundKind}
      />
      {refundKind === 'cancel' && <CancelOrderScreen onBack={close} />}
      {refundKind === 'shipped' && <ShippedRefundScreen onBack={close} />}
      {refundKind === 'resample' && <ResampleRefundScreen onBack={close} onContact={noop} />}
      {resampleOpen && <ResampleScreen onBack={() => setResampleOpen(false)} />}
    </>
  )
}

export function OrderListArtboard({ initialGuideOpen = false }: { initialGuideOpen?: boolean }) {
  return <OrderListWithRefund initialGuideOpen={initialGuideOpen} />
}

export function CancelOrderArtboard() {
  return (
    <>
      <OrderListWithRefund />
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
