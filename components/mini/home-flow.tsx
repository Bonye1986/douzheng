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
import { KnowledgeScreen, type ArticleKind } from '@/components/mini/knowledge-screen'
import type { SurveyAnswers } from '@/components/mini/survey-screen'
import {
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
  initialQuiz,
  initialSurvey,
  initialSurveyAnswers,
  initialServiceSection,
  loggedIn = true,
  onRequireLogin,
}: {
  /** With initialSurvey, opens the 问卷 already submitted (结果页). */
  initialSurveyAnswers?: SurveyAnswers
  /** 'list' opens 知识科普 list; an article id opens that article directly. */
  initialKnowledge?: string
  /** 'list' opens 互动问答 list; an article id opens that article directly. */
  initialQuiz?: string
  /** With initialQuiz set to an article id, opens that article's 问卷. */
  initialSurvey?: boolean
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
  const initialArticleEntry = initialQuiz ?? initialKnowledge
  const [knowledgeEntry, setKnowledgeEntry] = useState<{
    key: number
    kind: ArticleKind
    articleId?: string
    survey?: boolean
  } | null>(
    initialArticleEntry
      ? {
          key: 0,
          kind: initialQuiz ? 'quiz' : 'knowledge',
          articleId: initialArticleEntry === 'list' ? undefined : initialArticleEntry,
          survey: initialSurvey,
        }
      : null,
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
    else if (id === 'knowledge') setKnowledgeEntry({ key: Date.now(), kind: 'knowledge' })
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
            onOpenArticle={(id) => setKnowledgeEntry({ key: Date.now(), kind: 'knowledge', articleId: id })}
            onViewAllArticles={() => setKnowledgeEntry({ key: Date.now(), kind: 'knowledge' })}
            onOpenQuizArticle={(id) => setKnowledgeEntry({ key: Date.now(), kind: 'quiz', articleId: id })}
            onViewAllQuiz={() => setKnowledgeEntry({ key: Date.now(), kind: 'quiz' })}
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
          <MineScreen
            onOpenTests={() => openTests()}
            loggedIn={loggedIn}
            onRequireLogin={setLoginPrompt}
            onOpenChat={openChat}
          />
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
          kind={knowledgeEntry.kind}
          initialSurveyOpen={knowledgeEntry.survey}
          initialSurveyAnswers={knowledgeEntry.key === 0 ? initialSurveyAnswers : undefined}
          initialArticleId={knowledgeEntry.articleId}
            onBack={() => setKnowledgeEntry(null)}
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
