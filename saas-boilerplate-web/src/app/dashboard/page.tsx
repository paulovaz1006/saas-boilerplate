'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Summary = {
  user: { id: string; name: string; email: string; isActive: boolean; emailVerified: boolean; createdAt: string };
  subscription: null | { status: string; billingInterval: string; currentPeriodEnd: string | null; planName: string; planKey: string | null };
  supportMessages: number;
};

function dateLabel(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export default function DashboardHome() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api<Summary>('/dashboard').then(setSummary).catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o painel.')); }, []);

  if (error) return <section className="page-heading"><p className="eyebrow">Dashboard</p><h1>Não foi possível carregar</h1><div className="notice notice-error">{error}</div><Link className="button" href="/login">Entrar novamente</Link></section>;

  const user = summary?.user;
  const subscription = summary?.subscription;
  return <>
    <section className="page-heading"><p className="eyebrow">VISÃO GERAL</p><h1>Olá{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1><p className="page-description">Aqui está um resumo da sua conta e do seu espaço de trabalho.</p></section>
    <section className="summary-grid" aria-label="Resumo da conta">
      <article className="summary-card"><div className="summary-card-top"><span>Plano atual</span><span className="summary-icon">◇</span></div><strong>{subscription?.planName ?? 'Carregando...'}</strong><p>{subscription?.billingInterval === 'yearly' ? 'Cobrança anual' : subscription ? 'Cobrança mensal' : 'Plano da sua conta'}</p></article>
      <article className="summary-card"><div className="summary-card-top"><span>Status da conta</span><span className="summary-icon">✓</span></div><strong>{user ? (user.isActive ? 'Ativa' : 'Inativa') : 'Carregando...'}</strong><p>{user?.emailVerified ? 'E-mail verificado' : 'E-mail ainda não verificado'}</p></article>
      <article className="summary-card"><div className="summary-card-top"><span>Mensagens enviadas</span><span className="summary-icon">✉</span></div><strong>{summary?.supportMessages ?? '—'}</strong><p>Solicitações de contato</p></article>
    </section>
    <section className="dashboard-columns">
      <article className="content-card"><div className="content-card-heading"><div><h2>Seu perfil</h2><p>Confira os dados da sua conta.</p></div><Link className="text-link" href="/dashboard/profile">Editar perfil →</Link></div>
        {user ? <div className="profile-preview"><div className="avatar avatar-large">{(user.name || user.email).slice(0, 1).toUpperCase()}</div><div><strong>{user.name || 'Nome não informado'}</strong><p>{user.email}</p><span className="muted small-text">Membro desde {dateLabel(user.createdAt)}</span></div></div> : <div className="skeleton-line" />}
      </article>
      <article className="content-card"><div className="content-card-heading"><div><h2>Precisa de ajuda?</h2><p>Envie uma mensagem para nossa equipe.</p></div><span className="summary-icon">↗</span></div><p className="muted">Dúvidas, sugestões ou problemas? Registre sua solicitação e acompanhe o histórico pelo painel.</p><Link className="button" href="/dashboard/contact">Falar com suporte</Link></article>
    </section>
  </>;
}
