function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="bg-primary-600 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">
              Plataforma de Control de Productividad
            </h1>
            <p className="text-sm text-primary-100">Gobernación</p>
          </div>
          <span className="rounded-full bg-secondary-500 px-3 py-1 text-xs font-medium">
            MVP
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-primary-700">
            Frontend listo
          </h2>
          <p className="mt-2 text-muted-foreground">
            React + TypeScript + Vite + Tailwind 4.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hoja de estilos del proyecto:{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">src/styles.css</code>
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
