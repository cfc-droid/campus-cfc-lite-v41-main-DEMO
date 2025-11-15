import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Module1() {
  const KEY = 'module1-answers'
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(KEY)
      if (saved) setStatus('✅ Progreso cargado desde tu dispositivo.')
    }
  }, [])

  const save = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        KEY,
        JSON.stringify({ sent: true, at: new Date().toISOString() })
      )
      setStatus('📤 Examen enviado con éxito — progreso guardado localmente.')
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Módulo 1 - Demo</title>
      </Head>

      <h1>Módulo 1 - Demo</h1>
      <p className="muted">{status || 'Versión LITE demo'}</p>

      <details>
        <summary>Capítulo 1 - Introducción (Demo)</summary>
        <p>💡 Contenido de demostración. Sustituí este archivo con el módulo definitivo exportado a HTML.</p>
      </details>

      <form className="card">
        <p>Seleccioná una opción:</p>
        <label><input type="radio" name="q1" /> Opción A</label><br />
        <label><input type="radio" name="q1" /> Opción B</label><br />
        <button type="button" onClick={save}>Enviar respuestas</button>
      </form>

      <div className="card">
        <Link href="/exams">⬅ Volver al índice</Link>
      </div>
    </div>
  )
}
