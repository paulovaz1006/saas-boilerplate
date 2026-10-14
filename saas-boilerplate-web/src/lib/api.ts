const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030/api';
export async function api<T>(path:string, init:RequestInit = {}):Promise<T> {
 const response = await fetch(`${API}${path}`, { ...init, credentials:'include', headers:{'Content-Type':'application/json', ...(init.headers||{})}, cache:'no-store' });
 if(!response.ok) { const body=await response.json().catch(()=>({})); throw new Error(body.message || `Erro HTTP ${response.status}`); }
 if(response.status===204) return undefined as T; return response.json();
}
