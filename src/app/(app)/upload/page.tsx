"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { uploadVideo, type UploadState } from "@/app/actions/videos";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full py-3.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors"
    >
      {pending ? "Caricamento in corso…" : "Pubblica"}
    </button>
  );
}

export default function UploadPage() {
  const [state, action] = useActionState<UploadState, FormData>(
    uploadVideo,
    null
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const error = state && "error" in state ? state.error : null;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/feed"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Annulla
        </Link>
        <h1 className="text-white font-bold text-lg">Nuovo video</h1>
        <span className="w-16" />
      </div>

      <form action={action} className="space-y-5">
        <label
          htmlFor="video"
          className="block aspect-[9/16] rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-700 overflow-hidden cursor-pointer relative"
        >
          {preview ? (
            <video
              src={preview}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p className="text-sm font-medium">Tocca per selezionare un video</p>
              <p className="text-xs text-zinc-600">MP4 · max 100MB</p>
            </div>
          )}
          <input
            id="video"
            name="video"
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={onFileChange}
            required
            className="sr-only"
          />
        </label>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-400 mb-1.5"
          >
            Titolo
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={80}
            placeholder="Es: Doppietta contro il Milan U17"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-400 mb-1.5"
          >
            Descrizione{" "}
            <span className="text-zinc-600 font-normal">(facoltativa)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={280}
            placeholder="Racconta il contesto della giocata…"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <SubmitButton disabled={!file} />
      </form>
    </div>
  );
}
