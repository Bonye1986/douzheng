'use client'

import { useState } from 'react'

import { OrderListScreen } from '@/components/mini/order-list-screen'
import { AfterSalesScreen } from '@/components/mini/after-sales-screen'
import { CancelOrderScreen, ResampleRefundScreen, ShippedRefundScreen } from '@/components/mini/refund-screen'
import { ResampleScreen } from '@/components/mini/resample-screen'

const noop = () => {}

type RefundKind = Parameters<React.ComponentProps<typeof OrderListScreen>['onRefund']>[0]

function OrderListWithRefund({
  initialGuideOpen = false,
  initialDetailStatus,
  initialType,
}: {
  initialGuideOpen?: boolean
  initialDetailStatus?: string
  initialType?: 'all' | 'self' | 'site'
}) {
  const [refundKind, setRefundKind] = useState<RefundKind | null>(null)
  const [resampleOpen, setResampleOpen] = useState(false)
  const close = () => setRefundKind(null)

  return (
    <>
      <OrderListScreen
        initialGuideOpen={initialGuideOpen}
        initialDetailStatus={initialDetailStatus}
        initialType={initialType}
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

export function OrderDetailArtboard() {
  return <OrderListWithRefund initialType="self" initialDetailStatus="检测中" />
}

export function AfterSalesDetailArtboard({ caseId = 'DZ20260918002' }: { caseId?: string }) {
  const [resampleOpen, setResampleOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  return (
    <>
      <AfterSalesScreen
        initialDetailId={caseId}
        onBack={noop}
        onHandleUnqualified={() => setResampleOpen(true)}
        onTerminateResample={() => setRefundOpen(true)}
      />
      {refundOpen && <ResampleRefundScreen onBack={() => setRefundOpen(false)} onContact={noop} />}
      {resampleOpen && <ResampleScreen onBack={() => setResampleOpen(false)} />}
    </>
  )
}

export function OrderListEmptyArtboard() {
  return <OrderListScreen empty onBack={noop} onGoShop={noop} onRefund={noop} />
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
  const [resampleOpen, setResampleOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  return (
    <>
      <AfterSalesScreen
        onBack={noop}
        onHandleUnqualified={() => setResampleOpen(true)}
        onTerminateResample={() => setRefundOpen(true)}
      />
      {refundOpen && <ResampleRefundScreen onBack={() => setRefundOpen(false)} onContact={noop} />}
      {resampleOpen && <ResampleScreen onBack={() => setResampleOpen(false)} />}
    </>
  )
}

export function ResampleArtboard() {
  return <ResampleScreen onBack={noop} />
}

export function ResampleRefundArtboard() {
  return <ResampleRefundScreen onBack={noop} onContact={noop} />
}
