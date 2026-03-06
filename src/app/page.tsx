import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Top-right saved link */}
      <div className="absolute top-4 right-4 z-20">
        <Link
          href="/saved"
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors px-3 py-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Saved
        </Link>
      </div>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent-secondary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="text-6xl mb-6">🌙</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary mb-4 leading-tight">
          The Dead
          <br />
          <span className="text-accent-primary">Evening</span>
        </h1>
        <p className="text-lg text-text-secondary mb-2">
          Provo evenings, sorted.
        </p>
        <p className="text-sm text-text-muted mb-10 max-w-xs">
          Stop defaulting to a movie. Find something you&apos;ll actually
          remember tonight.
        </p>

        <Link
          href="/concierge"
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-bg-primary bg-accent-primary rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_40px_rgba(232,168,56,0.3)] active:scale-95"
        >
          Find Your Evening
          <svg
            className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>

        {/* How it works */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-xs text-text-muted">Pick your vibe</p>
          </div>
          <div>
            <div className="text-2xl mb-2">✨</div>
            <p className="text-xs text-text-muted">Get 3 ideas</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-xs text-text-muted">Go have fun</p>
          </div>
        </div>
      </div>
    </div>
  );
}
