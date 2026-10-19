'use client'

import { useState } from 'react'
import { HomeScreen } from '@/components/mini/home-screen'
import { AiChatScreen, type ChatRequest } from '@/components/mini/ai-chat-screen'
import { TabBar, type TabKey } from '@/components/mini/tab-bar'
import { TabPlaceholderScreen } from '@/components/mini/tab-placeholder-screen'
import { ServicesScreen } from '@/components/mini/services-screen'
import { TestsScreen } from '@/components/mini/tests-screen'
import type { CartItem } from '@/components/mini/cart-screen'
import type { CheckoutLine } from '@/components/mini/checkout-screen'
import { MineScreen } from '@/components/mini/mine-screen'
import { FloatingAiButton } from '@/components/mini/floating-ai-button'
import { ExamineeManageScreen } from '@/components/mini/examinee-manage-screen'
import { MedicationReminderScreen } from '@/components/mini/medication-reminder-screen'
import { LoginRequiredDialog } from '@/components/mini/login-required-dialog'
import { KnowledgeScreen } from '@/components/mini/knowledge-screen'
import {
  reportChatQuestion,
  serviceCategories,
  type ServiceCategoryId,
} from '@/components/mini/services-data'
import { cn } from '@/lib/utils'

export function HomeFlow({
  initialTab = 'home',
  initialDetailId,
  initialCart,
  initialCartOpen,
  initialCheckout,
  initialKnowledge,
  initialServiceSection,
  loggedIn = true,
  onRequireLogin,
}: {
  /** 'list' opens 知识科普 list; an article id opens that article directly. */
  initialKnowledge?: string
  initialServiceSection?: 'quiz'
  loggedIn?: boolean
  onRequireLogin?: () => void
  initialTab?: TabKey
  initialDetailId?: string
  initialCart?: CartItem[]
  initialCartOpen?: boolean
  initialCheckout?: CheckoutLine[]
}) {
  const [tab, setTab] = useState<TabKey>(initialTab)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMounted, setChatMounted] = useState(false)
  const [request, setRequest] = useState<ChatRequest | null>(null)
  const [subPage, setSubPage] = useState<'examinee' | 'reminder' | null>(null)
  const [loginPrompt, setLoginPrompt] = useState<string | null>(null)
  const [knowledgeEntry, setKnowledgeEntry] = useState<{ key: number; articleId?: string } | null>(
    initialKnowledge ? { key: 0, articleId: initialKnowledge === 'list' ? undefined : initialKnowledge } : null,
  )
  // Remounting TestsScreen via key lets it re-read the requested detail id when entered from 服务.
  const [testEntry, setTestEntry] = useState<{ key: number; detailId?: string }>({
    key: 0,
    detailId: initialDetailId,
  })

  const openTests = (detailId?: string) => {
    setTestEntry({ key: Date.now(), detailId })
    setTab('test')
  }

  const openChat = (question?: string) => {
    if (question) setRequest({ question, id: Date.now() })
    setChatMounted(true)
    setChatOpen(true)
  }

  const handleCategory = (id: ServiceCategoryId) => {
    const category = serviceCategories.find((c) => c.id === id)
    if (category?.requiresLogin && !loggedIn) {
      setLoginPrompt(category.label)
      return
    }
    if (id === 'tests') openTests()
    else if (id === 'report') openChat(reportChatQuestion)
    else if (id === 'health') setSubPage('examinee')
    else if (id === 'remind') setSubPage('reminder')
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1" inert={chatOpen}>
        {tab === 'home' ? (
          <HomeScreen onOpenChat={openChat} />
        ) : tab === 'service' ? (
          <ServicesScreen
            onOpenChat={openChat}
            onCategory={handleCategory}
            onOpenTest={(id) => openTests(id)}
            onViewAllTests={() => openTests()}
            onOpenArticle={(id) => setKnowledgeEntry({ key: Date.now(), articleId: id })}
            onViewAllArticles={() => setKnowledgeEntry({ key: Date.now() })}
            initialSection={initialServiceSection}
          />
        ) : tab === 'test' ? (
          <TestsScreen
            key={testEntry.key}
            initialDetailId={testEntry.detailId}
            initialCart={initialCart}
            initialCartOpen={initialCartOpen}
            initialCheckout={initialCheckout}
          />
        ) : tab === 'me' ? (
          <MineScreen onOpenTests={() => openTests()} />
        ) : (
          <TabPlaceholderScreen tab={tab} />
        )}
      </div>
      <div inert={chatOpen}>
        <TabBar active={tab} onSelect={setTab} />
      </div>
      {!chatOpen && <FloatingAiButton onClick={() => openChat()} />}

      {chatMounted && (
        <div
          aria-hidden={!chatOpen}
          inert={!chatOpen}
          className={cn(
            'absolute inset-0 z-40 transition-transform duration-300 ease-out motion-reduce:transition-none',
            chatOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full',
          )}
        >
          <AiChatScreen request={request} active={chatOpen} onBack={() => setChatOpen(false)} />
        </div>
      )}

      {subPage === 'examinee' && <ExamineeManageScreen onBack={() => setSubPage(null)} />}
      {subPage === 'reminder' && <MedicationReminderScreen onBack={() => setSubPage(null)} />}
      {knowledgeEntry && (
        <KnowledgeScreen
          key={knowledgeEntry.key}
          initialArticleId={knowledgeEntry.articleId}
          onBack={() => setKnowledgeEntry(null)}
          onAskAi={(question) => openChat(question)}
        />
      )}

      {loginPrompt && (
        <LoginRequiredDialog
          feature={loginPrompt}
          onCancel={() => setLoginPrompt(null)}
          onLogin={() => {
            setLoginPrompt(null)
            onRequireLogin?.()
          }}
        />
      )}
    </div>
  )
}
