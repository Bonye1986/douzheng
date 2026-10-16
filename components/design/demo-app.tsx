'use client'

import { useState } from 'react'
import { WelcomeScreen } from '@/components/mini/welcome-screen'
import { WechatAuthScreen } from '@/components/mini/wechat-auth-screen'
import { HomeFlow } from '@/components/mini/home-flow'

type Stage = 'welcome' | 'denied' | 'auth' | 'home'

export function DemoApp({ skipLogin = false }: { skipLogin?: boolean }) {
  const [stage, setStage] = useState<Stage>(skipLogin ? 'home' : 'welcome')

  if (stage === 'home') return <HomeFlow />
  if (stage === 'auth') return <WechatAuthScreen onAllow={() => setStage('home')} onDeny={() => setStage('denied')} />
  return (
    <WelcomeScreen
      key={stage}
      defaultAgreed={stage === 'denied'}
      notice={stage === 'denied' ? '需授权手机号才能登录，请重新点击授权' : undefined}
      noticeDuration={3000}
      onWechatLogin={() => setStage('auth')}
    />
  )
}
