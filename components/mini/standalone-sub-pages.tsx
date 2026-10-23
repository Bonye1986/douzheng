'use client'

import { useState } from 'react'
import { ConsentReaderScreen } from '@/components/mini/consent-reader-screen'
import { ExamineeFormScreen } from '@/components/mini/examinee-form-screen'
import { LegalDocScreen, type LegalDocKind } from '@/components/mini/legal-doc-screen'
import { SiteListScreen } from '@/components/mini/site-list-screen'

const noop = () => {}

export function ConsentReaderArtboard() {
  return <ConsentReaderScreen onBack={noop} onAgree={noop} />
}

export function LegalDocArtboard({ kind }: { kind: LegalDocKind }) {
  return <LegalDocScreen kind={kind} onBack={noop} />
}

export function ExamineeFormArtboard() {
  return <ExamineeFormScreen hasSelf onBack={noop} onSave={noop} />
}

export function SiteListArtboard({ initialSelected = null }: { initialSelected?: string | null }) {
  const [selected, setSelected] = useState<string | null>(initialSelected)
  return <SiteListScreen selected={selected} onBack={noop} onSelect={setSelected} />
}
