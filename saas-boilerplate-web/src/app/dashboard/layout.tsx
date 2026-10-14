'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type CurrentUser = { id: string; name: string; email: string };

const navigation = [
  { href: '/dashboard', label: 'Home', icon: '⌂', exact: true },
  { href: '/dashboard/profile', label: 'Perfil', icon: '◉' },
  { href: '/dashboard/contact', label: 'Contato', icon: '✉' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    api<CurrentUser>('/users/me')
      .then((result) => { if (active) setUser(result); })
      .catch(() => { if (active) router.replace('/login'); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [router]);

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); }
    finally { router.replace('/login'); router.refresh(); }
  }

  if (checking) return <main className="auth-loading"><div className="loading-dot" /><p className="muted">Carregando sua área...</p></main>;
  if (!user) return null;

  return (
    <div className="app-shell">
      {mobileOpen && <button aria-label="Fechar menu" className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <Link className="brand sidebar-brand" href="/dashboard"><span className="brand-mark">s.</span> saasbase<span className="brand-dot">.</span></Link>
        <div className="sidebar-caption">ESPAÇO DE TRABALHO</div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          {navigation.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}><span className="sidebar-icon" aria-hidden="true">{item.icon}</span>{item.label}</Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user"><div className="avatar">{(user.name || user.email).slice(0, 1).toUpperCase()}</div><div className="sidebar-user-copy"><strong>{user.name || 'Minha conta'}</strong><span>{user.email}</span></div></div>
          <button className="sidebar-link sidebar-logout" onClick={logout}><span className="sidebar-icon" aria-hidden="true">↪</span>Sair da conta</button>
          <Link href="/" className="back-to-site">← Voltar ao site</Link>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="mobile-menu-button" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="topbar-label">Área do cliente</div>
          <div className="topbar-account"><span className="online-dot" /> Conta ativa <div className="avatar avatar-small">{(user.name || user.email).slice(0, 1).toUpperCase()}</div></div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
