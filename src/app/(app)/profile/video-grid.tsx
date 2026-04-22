"use client";

export type GridVideo = {
  id: string;
  title: string;
  videoUrl: string;
  views: number;
};

export function VideoGrid({ videos }: { videos: GridVideo[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900 rounded-xl">
        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-zinc-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm">Ancora nessun video caricato</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {videos.map((v) => (
        <div
          key={v.id}
          className="relative aspect-[9/16] rounded-lg overflow-hidden bg-zinc-900 group"
        >
          <video
            src={`${v.videoUrl}#t=0.1`}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              if (video.currentTime < 0.1) video.currentTime = 0.1;
            }}
            onMouseEnter={(e) => {
              const video = e.currentTarget;
              video.play().catch(() => {});
            }}
            onMouseLeave={(e) => {
              const video = e.currentTarget;
              video.pause();
              video.currentTime = 0.1;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1 text-white text-[11px] font-medium">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>{formatViews(v.views)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatViews(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}
