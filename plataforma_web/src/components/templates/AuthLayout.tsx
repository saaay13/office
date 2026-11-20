import type { ReactNode } from 'react'
import { BadgeCheck, LockKeyhole, ShieldCheck } from 'lucide-react'

type Props = {
  titulo: string
  descripcion: string
  etiqueta?: string
  children: ReactNode
}

export function AuthLayout({
  titulo,
  descripcion,
  etiqueta = 'ACCESO AL SISTEMA',
  children,
}: Props) {
  const anio = new Date().getFullYear()

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f7f8fd] p-4 sm:p-6 lg:p-8">
      <section className="grid w-full max-w-[1180px] grid-cols-1 overflow-hidden rounded-xl bg-white shadow-[0_14px_40px_rgba(15,23,42,0.14)] lg:min-h-[580px] lg:grid-cols-[56%_44%]">
        <aside className="relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#07588c] via-[#00365d] to-[#002440] p-7 text-white lg:min-h-full lg:p-9">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 700 700"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M340 -50 C260 130 270 350 430 430 C540 485 650 430 750 410"
              stroke="white"
              strokeOpacity=".3"
              strokeWidth="2"
              strokeDasharray="5 6"
            />
            <path
              d="M-50 430 C130 410 230 530 390 515 C530 500 570 410 750 445"
              stroke="white"
              strokeOpacity=".55"
              strokeWidth="1.6"
            />
            <circle cx="560" cy="120" r="120" stroke="white" strokeOpacity=".12" strokeWidth="1.5" />
            <circle cx="90" cy="610" r="150" stroke="white" strokeOpacity=".1" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-white/15">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>

            <div className="border-l border-white/20 pl-3">
              <p className="text-[8px] tracking-[1.5px] text-white/70">PLATAFORMA SEGURA</p>
              <p className="text-sm font-semibold">Portal de Acceso</p>
            </div>
          </div>

          <div className="relative z-10 mt-8 max-w-[420px]">
            <p className="mb-3 text-[9px] font-semibold tracking-[2px] text-white/80">
              PLATAFORMA INSTITUCIONAL
            </p>

            <h1 className="text-3xl leading-[1.08] font-bold tracking-tight sm:text-4xl">
              Sistema de Control
              <span className="block text-white/80">de Productividad</span>
            </h1>

            <p className="mt-4 max-w-[320px] text-[11px] leading-relaxed text-white/70">
              Gestión centralizada de la estructura organizacional, usuarios y accesos
              institucionales.
            </p>
          </div>

          <div className="relative z-10 mt-8 flex items-center gap-2 text-[10px] text-white/90">
            <BadgeCheck size={15} aria-hidden="true" />
            Portal Oficial de Servicios Internos
          </div>
        </aside>

        <div className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-12">
          <div className="mx-auto my-auto w-full max-w-[360px]">
            <div className="mb-7">
              <div className="mb-2 flex items-center gap-2 text-brand-700">
                <LockKeyhole size={13} aria-hidden="true" />
                <span className="text-[9px] font-bold tracking-[0.14em]">{etiqueta}</span>
              </div>

              <h2 className="text-[25px] leading-tight font-semibold tracking-tight text-ink">
                {titulo}
              </h2>

              <p className="mt-2 text-[11px] leading-relaxed text-muted">{descripcion}</p>
            </div>

            {children}
          </div>

          <footer className="mx-auto mt-8 w-full max-w-[360px] border-t border-line pt-4">
            <div className="flex items-center justify-between text-[9px] text-muted">
              <span>Sistema de Control © {anio}</span>

              <span className="flex items-center gap-1 font-semibold text-brand-700">
                <span className="size-1.5 rounded-full bg-brand-500" />
                Servicio activo
              </span>
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}
