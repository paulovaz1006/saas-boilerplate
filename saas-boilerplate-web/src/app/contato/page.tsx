'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

export default function PublicContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      await api('/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) });
      setSuccess('Mensagem enviada com sucesso! Obrigado por entrar em contato.'); setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível enviar sua mensagem.'); }
    finally { setBusy(false); }
  }

  return <main className="container public-contact-page"><header className="nav"><Link className="brand" href="/">saasbase<span className="brand-dot">.</span></Link><nav className="links"><Link href="/#planos">Planos</Link><Link href="/login">Entrar</Link></nav></header>
    <section className="public-contact-intro"><p className="eyebrow">ESTAMOS AQUI PARA AJUDAR</p><h1>Entre em contato.</h1><p className="page-description">Tem uma dúvida, sugestão ou quer conversar sobre um plano? Envie uma mensagem para nossa equipe.</p></section>
    <div className="public-contact-card content-card"><div className="public-contact-aside"><div className="summary-icon">✉</div><h2>Vamos conversar?</h2><p>Conte um pouco sobre o que você precisa. Sua mensagem será encaminhada para nossa equipe.</p><p className="small-text">Já tem uma conta? <Link className="text-link" href="/login">Entre no painel</Link> para enviar e consultar suas solicitações.</p></div><form onSubmit={submit}>
      {error && <div className="notice notice-error" role="alert">{error}</div>}{success && <div className="notice notice-success" role="status">{success}</div>}
      <div className="form-row"><label className="field">Nome<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" /></label><label className="field">E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" /></label></div>
      <label className="field">Assunto<input value={subject} onChange={(e) => setSubject(e.target.value)} required minLength={3} maxLength={150} placeholder="Como podemos ajudar?" /></label>
      <label className="field">Mensagem<textarea value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} maxLength={5000} rows={6} placeholder="Escreva sua mensagem aqui..." /></label>
      <button className="button" disabled={busy}>{busy ? 'Enviando...' : 'Enviar mensagem'}</button>
    </form></div>
    <footer className="footer public-contact-footer"><Link href="/">← Voltar para a página inicial</Link><span>© {new Date().getFullYear()} SaaSBase</span></footer>
  </main>;
}
