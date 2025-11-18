import Head from 'next/head'
import Link from 'next/link'

const modules = Array.from({ length: 20 }, (_, i) => i + 1)

export default function Exams() {
  return (
    <div className="container">
      <Head>
        <title>Índice de Exámenes — Campus CFC LITE</title>
      </Head>

      <div className="card">
        <h1>Índice de Exámenes (20 módulos)</h1>
        <p className="muted">
          Simulación LITE — progreso guardado localmente (localStorage).
        </p>
      </div>

      <div className="card">
        <ol>
          {modules.map((n) => (
            <li key={n} style={{ marginBottom: 8 }}>
              <Link href={`/exams/module${n}`}>Módulo {n}</Link>{' '}
              <span className="muted">
                — {n === 1 ? 'demo' : 'pendiente'}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="card">
        <Link href="/" className="btn">
          ⬅ Volver
        </Link>
      </div>
    </div>
  )
}
