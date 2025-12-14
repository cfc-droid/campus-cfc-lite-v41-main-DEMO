import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Campus CFC Trading – LITE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Campus CFC Trading V1.4 – Frontend estático listo para Cloudflare Pages."
        />
      </Head>

      <div className="card">
        <h1>Campus CFC Trading – LITE</h1>
        <p className="muted">
          Base limpia (JS puro) lista para despliegue en Cloudflare Pages.
        </p>
        <Link className="btn" href="/exams">
          Ir al índice de exámenes
        </Link>
      </div>

      <div className="card">
        <h3>Estado</h3>
        <ul>
          <li>✅ Next.js 14 configurado para <strong>export estático</strong></li>
          <li>🟩 Sin TypeScript, sin ESLint en CI</li>
          <li>🟦 Compatible con Cloudflare Pages</li>
        </ul>
      </div>
    </div>
  )
}
