"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveVideoRecord } from "@/app/actions/videos";

const MAX_SIZE = 100 * 1024 * 1024;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "uploading" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Formato non supportato. Usa MP4, MOV o WebM.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError("Il video supera i 100MB");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (!title.trim()) {
      setError("Il titolo è obbligatorio");
      return;
    }

    setError(null);
    setUploading(true);
    setStage("uploading");
    setProgress(5);

    // Progress simulato — l'SDK Supabase v2 non espone onUploadProgress.
    // Cresce fino al 90% durante l'upload, poi scatta al 100% al completamento.
    const ticker = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.08) : p));
    }, 400);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        clearInterval(ticker);
        setError("Sessione scaduta, fai login");
        setUploading(false);
        setStage("idle");
        return;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("Video")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      clearInterval(ticker);

      if (uploadError) {
        setError(`Caricamento fallito: ${uploadError.message}`);
        setUploading(false);
        setStage("idle");
        setProgress(0);
        return;
      }

      setProgress(100);
      setStage("saving");

      const result = await saveVideoRecord({
        path,
        title: title.trim(),
        description: description.trim() || null,
      });

      if ("error" in result) {
        setError(result.error);
        setUploading(false);
        setStage("idle");
        setProgress(0);
        return;
      }

      setStage("done");
      router.push("/feed");
      router.refresh();
    } catch (err) {
      clearInterval(ticker);
      console.error("[upload]", err);
      setError("Errore imprevisto durante il caricamento");
      setUploading(false);
      setStage("idle");
      setProgress(0);
    }
  };

  const progressLabel =
    stage === "saving"
      ? "Salvataggio dettagli…"
      : stage === "done"
      ? "Fatto!"
      : "Caricamento video…";

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

      <form onSubmit={onSubmit} className="space-y-5">
        <label
          htmlFor="video"
          className="block aspect-[9/16] rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-700 overflow-hidden cursor-pointer relative"
        >
          {preview ? (
            <>
              <video
                src={preview}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    clearFile();
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                  aria-label="Rimuovi video"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p className="text-sm font-medium">Tocca per selezionare un video</p>
              <p className="text-xs text-zinc-600">MP4 · MOV · WebM · max 100MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            id="video"
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={onFileChange}
            disabled={uploading}
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
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            required
            maxLength={80}
            placeholder="Es: Doppietta contro il Milan U17"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            rows={3}
            maxLength={280}
            placeholder="Racconta il contesto della giocata…"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none disabled:opacity-50"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-zinc-400 text-sm text-center">{progressLabel}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors"
        >
          {uploading ? "Caricamento in corso…" : "Pubblica"}
        </button>
      </form>
    </div>
  );
}
