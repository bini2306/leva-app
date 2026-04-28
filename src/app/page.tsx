import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/60 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-teal-400 font-black text-xl tracking-tight">
            LEVA
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        {/* Glow sfondo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            PIATTAFORMA DI SCOUTING CALCISTICO
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            Il talento{" "}
            <span className="text-teal-400">non ha provincia</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed mb-10">
            Leva connette i giovani calciatori italiani agli scout professionisti
            attraverso video reali, verificati dagli allenatori con licenza
            FIGC.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base rounded-xl transition-colors"
            >
              Inizia gratis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-base rounded-xl transition-colors"
            >
              Ho già un account
            </Link>
          </div>
        </div>

        {/* Mock video cards decorative */}
        <div className="relative max-w-5xl mx-auto mt-20 hidden sm:flex justify-center gap-4 px-4">
          {[
            { badge: "VERIFICATO", pos: "-rotate-3 -translate-y-2" },
            { badge: "VERIFICATO", pos: "scale-105 z-10" },
            { badge: "IN ATTESA", pos: "rotate-3 -translate-y-2" },
          ].map((card, i) => (
            <div
              key={i}
              className={`relative w-40 h-64 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 ${card.pos} transition-transform`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white/60 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-3 left-3 right-3 flex justify-end">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    card.badge === "VERIFICATO"
                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                      : "bg-slate-700/60 text-slate-400 border border-slate-600/40"
                  }`}
                >
                  {card.badge}
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="w-16 h-2 rounded-full bg-slate-700 mb-1.5" />
                <div className="w-10 h-1.5 rounded-full bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRE UTENTI */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Una piattaforma, tre ruoli
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Ogni attore del mondo calcistico ha il suo spazio su Leva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col gap-5 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl">
                ⚽
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Giocatore</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Hai 14–18 anni e vuoi farti notare? Carica le tue giocate
                  migliori. Il tuo profilo viene certificato dal tuo allenatore
                  FIGC e diventa visibile agli scout di tutta Italia.
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-800">
                <span className="text-teal-400 font-bold text-sm">Gratis</span>
                <span className="text-slate-500 text-sm"> — sempre</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col gap-5 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Allenatore FIGC</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  La tua firma vale più di mille autocertificazioni. Con la tua
                  licenza FIGC puoi certificare i profili dei tuoi giocatori e
                  dare credibilità reale al loro percorso.
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-800">
                <span className="text-teal-400 font-bold text-sm">Gratis</span>
                <span className="text-slate-500 text-sm">
                  {" "}— richiede licenza FIGC
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 flex flex-col gap-5 hover:border-teal-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl">
                🔍
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Scout</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Scorri un feed di video reali, filtra per ruolo e zona
                  geografica, e individua i talenti prima degli altri. I
                  profili verificati si distinguono con un badge ufficiale.
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-800">
                <span className="text-teal-400 font-bold text-sm">Premium</span>
                <span className="text-slate-500 text-sm">
                  {" "}— abbonamento mensile
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="py-24 px-6 border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Come funziona
            </h2>
            <p className="text-slate-400 text-lg">
              Il processo è semplice. La credibilità no.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                n: "01",
                title: "Il giocatore carica i video",
                desc: "Partite, allenamenti, giocate specifiche. Il feed è verticale, immediato, senza filtri.",
              },
              {
                n: "02",
                title: "L'allenatore certifica il profilo",
                desc: "Il coach con licenza FIGC firma digitalmente il profilo. Nessuna auto-dichiarazione — solo garanzie reali.",
              },
              {
                n: "03",
                title: "Lo scout scopre il talento",
                desc: "Nel feed appare il badge di verifica. Lo scout contatta il giocatore direttamente dalla piattaforma.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="flex gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800"
              >
                <span className="text-3xl font-black text-teal-500/30 tabular-nums leading-none pt-1 flex-shrink-0 w-10">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENZIATORI */}
      <section className="py-24 px-6 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                value: "FIGC",
                label: "Certificazione ufficiale",
                desc: "Solo allenatori con licenza federale possono firmare i profili.",
              },
              {
                value: "100%",
                label: "Video autentici",
                desc: "Niente profili falsi, niente video di repertorio. Solo giocate reali.",
              },
              {
                value: "0€",
                label: "Per giocatori e coach",
                desc: "Chi produce il contenuto non paga. La monetizzazione è lato scout.",
              },
            ].map((stat) => (
              <div key={stat.value} className="flex flex-col gap-2">
                <span className="text-5xl font-black text-teal-400">
                  {stat.value}
                </span>
                <span className="text-white font-bold">{stat.label}</span>
                <span className="text-slate-400 text-sm">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="relative py-24 px-6 border-t border-slate-900 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(20,184,166,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Il tuo talento{" "}
            <span className="text-teal-400">merita visibilità</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Registrati ora. È gratis per i giocatori e per gli allenatori FIGC.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-lg rounded-xl transition-colors"
          >
            Crea il tuo profilo
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-teal-400 font-black tracking-tight">LEVA</span>
          <p className="text-slate-600 text-sm">
            © 2026 Leva. Tutti i diritti riservati.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link
              href="/login"
              className="hover:text-slate-300 transition-colors"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="hover:text-slate-300 transition-colors"
            >
              Registrati
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
