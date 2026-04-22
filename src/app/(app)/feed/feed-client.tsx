"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VideoCard } from "./video-card";

export type FeedVideo = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  playerName: string;
  isVerified: boolean;
};

export function FeedClient({ videos }: { videos: FeedVideo[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index ?? 0
            );
            setActiveIndex(index);
          }
        });
      },
      { threshold: [0.7], root: container }
    );

    const children = container.querySelectorAll("[data-video-card]");
    children.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [videos.length]);

  if (videos.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-green-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold">Ancora nessun video</h2>
        <p className="text-zinc-400 text-sm mt-2 max-w-xs">
          Il feed è vuoto. Sii il primo a caricare un video per farti notare.
        </p>
        <Link
          href="/upload"
          className="mt-8 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors"
        >
          Carica video
        </Link>
        <Link
          href="/dashboard"
          className="mt-4 text-zinc-400 text-sm hover:text-white transition-colors"
        >
          Torna alla dashboard
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollbarWidth: "none" }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {videos.map((video, index) => (
        <div key={video.id} data-video-card data-index={index}>
          <VideoCard
            id={video.id}
            title={video.title}
            description={video.description}
            videoUrl={video.videoUrl}
            playerName={video.playerName}
            isVerified={video.isVerified}
            isActive={index === activeIndex}
            isNeighbor={Math.abs(index - activeIndex) === 1}
          />
        </div>
      ))}

      <nav className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around">
        <Link
          href="/dashboard"
          className="text-zinc-400 hover:text-white transition-colors flex flex-col items-center gap-1 text-xs"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </Link>
        <Link
          href="/upload"
          className="w-12 h-12 rounded-xl bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition-colors"
          aria-label="Carica video"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
        <Link
          href="/dashboard"
          className="text-zinc-400 hover:text-white transition-colors flex flex-col items-center gap-1 text-xs"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          Profilo
        </Link>
      </nav>
    </div>
  );
}
