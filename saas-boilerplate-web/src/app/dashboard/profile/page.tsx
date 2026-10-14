'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type UserProfile = { id: string; name: string; email: string; isActive: boolean; emailVerified: boolean; createdAt: string; updatedAt: string };

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { api<UserProfile>('/users/me').then((user) => { setProfile(user); setName(user.name || ''); }).catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o perfil.')); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess(''); setBusy(true);
    try {
      const updated = await api<UserProfile>('/users/me', { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) });
      setProfile(updated); setName(updated.name || ''); setSuccess('Perfil atualizado com sucesso.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível salvar as alterações.'); }
    finally { setBusy(false); }
  }

  return <>
    <section className="page-heading"><p className="eyebrow">MINHA CONTA</p><h1>Perfil</h1><p className="page-description">Visualize e atualize as informações cadastradas na sua conta.</p></section>
    {error && <div className="notice notice-error" role="alert">{error}</div>}
    {success && <div className="notice notice-success" role="status">{success}</div>}
    <div className="profile-layout">
      <section className="content-card profile-identity"><div className="avatar avatar-xl">{(name || profile?.email || '?').slice(0, 1).toUpperCase()}</div><h2>{profile?.name || 'Seu nome'}</h2><p>{profile?.email || 'Carregando e-mail...'}</p><span className={`status-pill ${profile?.isActive ? 'status-active' : 'status-inactive'}`}>{profile ? (profile.isActive ? 'Conta ativa' : 'Conta inativa') : 'Carregando...'}</span></section>
      <section className="content-card"><div className="content-card-heading"><div><h2>Dados pessoais</h2><p>Atualize seu nome de exibição.</p></div></div>
        <form onSubmit={submit}>
          <label className="field">Nome completo<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} placeholder="Como podemos chamar você?" /></label>
          <label className="field">E-mail<input value={profile?.email || ''} readOnly disabled type="email" /><span className="field-hint">O e-mail de acesso não pode ser alterado por esta tela.</span></label>
          <div className="profile-meta"><div><span>Data de cadastro</span><strong>{profile ? dateLabel(profile.createdAt) : '—'}</strong></div><div><span>Verificação de e-mail</span><strong>{profile ? (profile.emailVerified ? 'Verificado' : 'Pendente') : '—'}</strong></div></div>
          <div className="form-actions"><button className="button" disabled={busy || !profile}>{busy ? 'Salvando...' : 'Salvar alterações'}</button></div>
        </form>
      </section>
    </div>
  </>;
}
