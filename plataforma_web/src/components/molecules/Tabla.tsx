import type { ReactNode } from 'react'

export type ColumnaTabla<T> = {
  clave: string
  nombre: string
  celda: (fila: T) => ReactNode
  alineacion?: 'derecha'
}

type Props<T> = {
  columnas: ColumnaTabla<T>[]
  datos: T[]
  obtenerClave: (fila: T) => string | number
  mensajeVacio?: string
}

function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="bg-white px-4 py-12 text-center">
      <div className="mx-auto flex max-w-xs flex-col items-center gap-2 text-muted">
        <span className="flex size-10 items-center justify-center rounded-full bg-app">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
          </svg>
        </span>
        <p className="text-[11px] font-medium">{mensaje}</p>
      </div>
    </div>
  )
}

export function Tabla<T>({
  columnas,
  datos,
  obtenerClave,
  mensajeVacio = 'No se encontraron registros.',
}: Props<T>) {
  const [primera, ...resto] = columnas
  const acciones = resto.filter((columna) => columna.clave === 'acciones')
  const secundarias = resto.filter((columna) => columna.clave !== 'acciones')

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-line bg-white shadow-sm md:block">
        <div className="app-scroll overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left">
            <thead className="bg-[#f1f5fb] text-[10px] font-bold tracking-[0.08em] text-muted uppercase">
              <tr>
                {columnas.map((columna, indice) => (
                  <th
                    key={columna.clave}
                    className={`border-b border-line px-4 py-3 whitespace-nowrap ${
                      columna.alineacion === 'derecha' ? 'text-right' : ''
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {columna.nombre}
                      {indice === 0 && (
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold tracking-normal text-brand-700">
                          {datos.length}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {datos.map((fila, indiceFila) => (
                <tr
                  key={obtenerClave(fila)}
                  className={`border-b border-line/80 transition-colors last:border-b-0 hover:bg-brand-50/50 ${
                    indiceFila % 2 === 1 ? 'bg-[#fafcff]' : 'bg-white'
                  }`}
                >
                  {columnas.map((columna, indiceColumna) => (
                    <td
                      key={columna.clave}
                      className={`px-4 py-3 align-middle text-xs ${
                        indiceColumna === 0
                          ? 'font-semibold text-ink'
                          : `text-muted ${columna.alineacion === 'derecha' ? 'whitespace-nowrap text-right' : ''}`
                      }`}
                    >
                      {columna.celda(fila)}
                    </td>
                  ))}
                </tr>
              ))}

              {datos.length === 0 && (
                <tr>
                  <td colSpan={columnas.length}>
                    <EstadoVacio mensaje={mensajeVacio} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2.5 md:hidden">
        {datos.map((fila) => (
          <article
            key={obtenerClave(fila)}
            className="rounded-xl border border-line bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-xs">{primera.celda(fila)}</div>
              {primera.alineacion === 'derecha' && null}
            </div>

            {secundarias.length > 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-line/70 pt-3">
                {secundarias.map((columna) => (
                  <div key={columna.clave} className="min-w-0">
                    <dt className="text-[9px] font-bold tracking-[0.08em] text-muted-soft uppercase">
                      {columna.nombre}
                    </dt>
                    <dd className="mt-0.5 text-[11px] break-words text-muted">
                      {columna.celda(fila)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {acciones.length > 0 && (
              <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-line/70 pt-3">
                {acciones.map((columna) => (
                  <div key={columna.clave}>{columna.celda(fila)}</div>
                ))}
              </div>
            )}
          </article>
        ))}

        {datos.length === 0 && (
          <div className="rounded-xl border border-line bg-white shadow-sm">
            <EstadoVacio mensaje={mensajeVacio} />
          </div>
        )}
      </div>
    </>
  )
}
