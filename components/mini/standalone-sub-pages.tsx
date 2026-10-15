'use client'

import { useState } from 'react'
import { ConsentReaderScreen } from '@/components/mini/consent-reader-screen'
import { ExamineeFormScreen } from '@/components/mini/examinee-form-screen'
import { SiteListScreen } from '@/components/mini/site-list-screen'

const noop = () => {}

export function ConsentReaderArtboard() {
  return <ConsentReaderScreen onBack={noop} onAgree={noop} />
}

export function ExamineeFormArtboard() {
  return <ExamineeFormScreen hasSelf onBack={noop} onSave={noop} />
}

export function SiteListArtboard({ initialSelected = null }: { initialSelected?: string | null }) {
  const [selected, setSelected] = useState<string | null>(initialSelected)
  return <SiteListScreen selected={selected} onBack={noop} onSelect={setSelected} />
}
