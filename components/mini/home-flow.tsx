'use client'

import { useState } from 'react'
import { HomeScreen } from '@/components/mini/home-screen'
import { AiChatScreen } from '@/components/mini/ai-chat-screen'
import { TabBar, type TabKey } from '@/components/mini/tab-bar'
import { TabPlaceholderScreen } from '@/components/mini/tab-placeholder-screen'
import { FloatingAiButton } from '@/components/mini/floating-ai-button'

type Chat = { question?: string; key: number } | null

export function HomeFlow({ initialTab = 'home' }: { initialTab?: TabKey }) {
  const [tab, setTab] = useState<TabKey>(initialTab)
  const [chat, setChat] = useState<Chat>(null)

  const openChat = (question?: string) => setChat({ question, key: Date.now() })

  if (chat) {
    return <AiChatScreen key={chat.key} initialQuestion={chat.question} onBack={() => setChat(null)} />
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {tab === 'home' ? <HomeScreen onOpenChat={openChat} /> : <TabPlaceholderScreen tab={tab} />}
      </div>
      <TabBar active={tab} onSelect={setTab} />
      <FloatingAiButton onClick={() => openChat()} />
    </div>
  )
}
