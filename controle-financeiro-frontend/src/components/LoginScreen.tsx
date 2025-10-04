import { useAuth } from "../auth/AuthProvider";

export default function LoginScreen() {
  const { login } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden text-zinc-100 bg-[#0b0715]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-20 animate-gradient opacity-[0.08]" />

      {/* Subtle grid overlay + finance pattern */}
      <svg className="absolute inset-0 -z-10 opacity-[0.04]" aria-hidden="true">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute inset-0 -z-10 bg-finance-pattern opacity-[0.035]" />

      {/* Orbits (neon blobs) */}
      <div className="orbit w-[520px] h-[520px] bg-[#5b21b6]/25 left-[-120px] top-[-120px]" />
      <div className="orbit w-[420px] h-[420px] bg-[#4c1d95]/22 right-[-100px] top-[20%]" style={{ animationDelay: '1.5s' }} />
      <div className="orbit w-[360px] h-[360px] bg-[#3b0764]/20 left-[20%] bottom-[-120px]" style={{ animationDelay: '3s' }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        {/* Hero illustration (desktop only) */}
        <img src="/login-hero.svg" alt="finance hero" className="hidden md:block hero-float absolute right-[8%] top-1/2 -translate-y-1/2 w-[420px] pointer-events-none select-none" />

        <div className="glass w-full max-w-md rounded-2xl px-6 py-10 sm:px-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] shadow-lg flex items-center justify-center">
              {/* Money bag icon */}
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-violet-200" aria-hidden>
                <path d="M9 2.3C8.4 2.6 8 3.3 8 4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2 0-.7-.4-1.4-1-1.7L14.5 1h-5L9 2.3z" fill="currentColor"/>
                <path d="M6 10c0-1.7 1.3-3 3-3h6c1.7 0 3 1.3 3 3v6.5c0 2.5-2.2 4.5-5 4.5h-2c-2.8 0-5-2-5-4.5V10z" fill="currentColor" opacity=".95"/>
                <path d="M12 11v7m0-7c-1.5 0-2.5.8-2.5 1.75S10.5 14.5 12 14.5s2.5.75 2.5 1.75S13.5 18 12 18" stroke="#0b0715" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-glow">Controle Financeiro</h1>
            <p className="mt-1 text-sm text-zinc-400">Acesse com sua conta Google</p>
          </div>

          <button
            onClick={login}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] px-4 py-3 font-medium shadow-lg ring-1 ring-violet-400/20 transition hover:brightness-110"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/20 blur-md transition group-hover:translate-x-0" />
            <span className="relative flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.84 1.156 7.961 3.039l5.657-5.657C33.642 6.053 29.082 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.297 16.045 18.771 12 24 12c3.059 0 5.84 1.156 7.961 3.039l5.657-5.657C33.642 6.053 29.082 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.861-1.977 13.409-5.197l-6.191-5.238C29.155 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.281-7.946l-6.513 5.02C9.5 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.237-2.278 4.166-4.194 5.566l.003-.002 6.191 5.238C35.064 40.139 40 36 42 28c.5-2 .5-4 .5-4s-.221-2.005-1.889-3.917z"/>
              </svg>
              Entrar com Google
            </span>
          </button>

          <div className="mt-6 text-center text-xs text-zinc-500">
            Seus dados financeiros sÃ£o privados e vinculados Ã  sua conta.
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="absolute bottom-3 right-4 z-20 text-[10px] tracking-wide text-zinc-400/70 select-none">
        by: <span className="text-zinc-300/80">uatts</span>
      </div>
    </div>
  );
}



