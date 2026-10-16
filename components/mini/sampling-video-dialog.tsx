'use client'

import { useState } from 'react'
import { PlayCircle, VideoOff, X } from 'lucide-react'
import { samplingGuideVideo } from '@/lib/sampling-guide'

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return ''
  const s = Math.round(seconds)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function SamplingVideoDialog({ onClose }: { onClose: () => void }) {
  const [failed, setFailed] = useState(false)
  const [duration, setDuration] = useState('')
  const video = samplingGuideVideo

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sampling-video-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 px-4 motion-safe:animate-in motion-safe:fade-in"
    >
      <button type="button" aria-label="关闭" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="relative w-full overflow-hidden rounded-2xl bg-white motion-safe:animate-in motion-safe:zoom-in-95">
        <div className="flex items-center gap-2 px-4 py-3">
          <PlayCircle className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <h2 id="sampling-video-title" className="flex-1 truncate text-[15px] font-semibold text-foreground">
            {video.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭视频"
            className="-mr-1.5 flex size-8 items-center justify-center rounded-full text-muted-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="aspect-video bg-black">
          {failed ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[12px] text-white/70">
              <VideoOff className="size-6" aria-hidden="true" />
              视频加载失败，请检查网络后重试
              <button
                type="button"
                onClick={() => setFailed(false)}
                className="mt-1 rounded-full border border-white/40 px-3 py-1 text-white"
              >
                重新加载
              </button>
            </div>
          ) : (
            <video
              src={video.videoUrl}
              poster={video.posterUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              onError={() => setFailed(true)}
              onLoadedMetadata={(e) => setDuration(formatDuration(e.currentTarget.duration))}
              className="size-full object-contain"
            >
              您的设备不支持视频播放
            </video>
          )}
        </div>

        <div className="px-4 pb-4 pt-3">
          <p className="text-[11px] text-muted-foreground">
            {duration && `时长 ${duration} · `}更新于 {video.updatedAt}
          </p>
          <h3 className="mt-3 text-[13px] font-medium text-foreground">操作要点</h3>
          <ol className="mt-1.5 space-y-1.5">
            {video.tips.map((tip, i) => (
              <li key={tip} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium tabular-nums text-primary">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 h-10 w-full rounded-full bg-primary text-[14px] font-medium text-primary-foreground"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}
