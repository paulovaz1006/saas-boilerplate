'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type ContactRecord = { id: string; subject: string; message: string; source: string; status: string; createdAt: string };

export default function DashboardContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ContactRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadHistory() {
    try { const records = await api<ContactRecord[]>('/contact/me'); setHistory(records); } catch { /* A falha no histórico não impede o envio de uma nova mensagem. */ }
  }
  useEffect(() => { api<{name:string;email:string}>('/users/me').then((user) => { setName(user.name || ''); setEmail(user.email); }); loadHistory(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      await api('/contact/me', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) });
      setSuccess('Mensagem enviada! Nossa equipe recebeu sua solicitação.'); setSubject(''); setMessage(''); await loadHistory();
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível enviar sua mensagem.'); }
    finally { setBusy(false); }
  }

  return <>
    <section className="page-heading"><p className="eyebrow">AJUDA E SUPORTE</p><h1>Contato</h1><p className="page-description">Envie uma mensagem para nossa equipe. Suas solicitações ficam registradas nesta página.</p></section>
    {error && <div className="notice notice-error" role="alert">{error}</div>}{success && <div className="notice notice-success" role="status">{success}</div>}
    <div className="contact-layout"><section className="content-card"><h2>Como podemos ajudar?</h2><p className="muted">Preencha os campos abaixo e descreva sua dúvida ou solicitação.</p><form onSubmit={submit}>
      <div className="form-row"><label className="field">Nome<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} /></label><label className="field">E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} /></label></div>
      <label className="field">Assunto<input value={subject} onChange={(e) => setSubject(e.target.value)} required minLength={3} maxLength={150} placeholder="Sobre o que você precisa falar?" /></label>
      <label className="field">Mensagem<textarea value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} maxLength={5000} rows={6} placeholder="Descreva sua dúvida com o máximo de detalhes possível." /></label>
      <div className="form-actions"><button className="button" disabled={busy}>{busy ? 'Enviando...' : 'Enviar mensagem'}</button></div>
    </form></section>
      <aside className="content-card contact-aside"><div className="summary-icon">✉</div><h2>Fale com a gente</h2><p className="muted">As mensagens são registradas para que sua solicitação possa ser acompanhada pela equipe.</p><div className="contact-aside-line"><strong>Precisa de outra coisa?</strong><span>Você também pode voltar para a <Link className="text-link" href="/dashboard">Home do painel</Link>.</span></div></aside>
    </div>
    <section className="content-card history-card"><div className="content-card-heading"><div><h2>Suas solicitações</h2><p>Histórico das mensagens enviadas pelo painel.</p></div><span className="status-pill">{history.length} {history.length === 1 ? 'mensagem' : 'mensagens'}</span></div>
      {history.length ? <div className="contact-history">{history.map((record) => <article key={record.id} className="history-item"><div><strong>{record.subject}</strong><p>{record.message}</p><span className="muted small-text">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.createdAt))}</span></div><span className={`status-pill ${record.status === 'CLOSED' ? '' : 'status-active'}`}>{record.status === 'CLOSED' ? 'Encerrada' : record.status === 'IN_PROGRESS' ? 'Em andamento' : 'Aberta'}</span></article>)}</div> : <div className="empty-state"><span className="summary-icon">✉</span><strong>Nenhuma solicitação ainda</strong><p className="muted">Quando você enviar uma mensagem, ela aparecerá aqui.</p></div>}
    </section>
  </>;
}
