'use client'

import { useState } from 'react'
import { HomeScreen } from '@/components/mini/home-screen'
import { AiChatScreen } from '@/components/mini/ai-chat-screen'

type View = { name: 'home' } | { name: 'ai'; question?: string; key: number }

export function HomeFlow() {
  const [view, setView] = useState<View>({ name: 'home' })

  if (view.name === 'ai') {
    return (
      <AiChatScreen
        key={view.key}
        initialQuestion={view.question}
        onBack={() => setView({ name: 'home' })}
      />
    )
  }

  return <HomeScreen onOpenChat={(question) => setView({ name: 'ai', question, key: Date.now() })} />
}
