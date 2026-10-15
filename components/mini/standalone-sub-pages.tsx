'use client'

import { useState } from 'react'
import { ExamineeFormScreen } from '@/components/mini/examinee-form-screen'
import { SiteListScreen } from '@/components/mini/site-list-screen'

const noop = () => {}

export function ExamineeFormArtboard() {
  return <ExamineeFormScreen hasSelf onBack={noop} onSave={noop} />
}

export function SiteListArtboard({ initialSelected = null }: { initialSelected?: string | null }) {
  const [selected, setSelected] = useState<string | null>(initialSelected)
  return <SiteListScreen selected={selected} onBack={noop} onSelect={setSelected} />
}
