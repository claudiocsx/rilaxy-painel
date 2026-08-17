import { useEffect, useState } from 'react';
import { aprovarCandidatura, recusarCandidatura, excluirCandidatura, listarCandidaturas, garantirConviteDaCandidatura } from '../services/candidaturasService';
import { normalizarWhatsApp, montarMensagemAprovacao, linkWhatsApp } from '../utils/whatsapp';

function WhatsAppIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginRight: 5, verticalAlign: 'middle' }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.17 0 4.21.84 5.74 2.37a8.07 8.07 0 0 1 2.37 5.74c0 4.47-3.64 8.11-8.12 8.11a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.24-4.3c0-4.47 3.64-8.11 8.12-8.11zm-3.2 3.68c-.22 0-.57.08-.87.4-.3.32-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.91-.78 2.18-1.54.27-.76.27-1.4.19-1.54-.08-.13-.29-.22-.6-.38-.31-.17-1.91-.94-2.2-1.05-.3-.11-.51-.16-.72.17-.22.32-.85 1.05-1.04 1.26-.19.22-.38.24-.7.08-.31-.16-1.33-.49-2.53-1.56-.94-.84-1.57-1.87-1.75-2.18-.19-.31-.02-.48.14-.64.14-.13.31-.35.47-.52.16-.17.21-.3.32-.5.11-.19.05-.36-.03-.52-.08-.17-.72-1.72-.98-2.36-.26-.62-.52-.54-.72-.55h-.62z" />
    </svg>
  );
}

export default function Candidaturas() {
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const carregar = async () => {
    setLoading(true);
    try {
      const lista = await listarCandidaturas();
      setCandidaturas(lista);
    } catch (err) {
      console.error('Erro ao carregar candidaturas:', err);
    }
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const handleAprovar = async (id) => {
    if (!confirm('Aprovar esta candidatura?')) return;
    const codigo = await aprovarCandidatura(id);
    const candidatura = candidaturas.find((c) => c.id === id);
    setMsg(`Candidatura aprovada! Código de acesso: ${codigo}`);
    carregar();
    if (candidatura) abrirWhatsApp(candidatura, codigo);
  };

  const abrirWhatsApp = async (c, codigo) => {
    const codigoFinal = codigo || c.codigoGerado;
    try {
      await garantirConviteDaCandidatura({ ...c, codigoGerado: codigoFinal });
    } catch (err) {
      console.error('Erro ao garantir convite:', err);
    }
    const numero = normalizarWhatsApp(c.contato);
    if (!numero) {
      setMsg(`Candidatura aprovada! Código: ${codigoFinal}. Contato não reconhecido para abrir WhatsApp — use o botão Copiar.`);
      return;
    }
    const msg = montarMensagemAprovacao(c, codigoFinal);
    window.open(linkWhatsApp(numero, msg), '_blank');
  };

  const copiarMensagem = async (c) => {
    const codigo = c.codigoGerado || '';
    try {
      await garantirConviteDaCandidatura({ ...c, codigoGerado: codigo });
    } catch (err) {
      console.error('Erro ao garantir convite:', err);
    }
    const msg = montarMensagemAprovacao(c, codigo);
    try {
      await navigator.clipboard.writeText(msg);
      setMsg('Mensagem copiada para a área de transferência.');
    } catch {
      setMsg('Não foi possível copiar automaticamente.');
    }
  };

  const handleRecusar = async (id) => {
    if (!confirm('Recusar esta candidatura?')) return;
    await recusarCandidatura(id);
    setMsg('Candidatura recusada.');
    carregar();
  };

  const handleExcluir = async (id) => {
    if (!confirm('Excluir este registro definitivamente?')) return;
    await excluirCandidatura(id);
    setMsg('Registro removido.');
    carregar();
  };

  const statusBadge = (status) => {
    if (status === 'Aprovado') return <span className="badge badge-success">Aprovado</span>;
    if (status === 'Recusado') return <span className="badge badge-danger">Recusado</span>;
    return <span className="badge badge-warning">Pendente</span>;
  };

  const dataFormatada = (createdAt) => {
    try {
      if (createdAt?.toDate) return createdAt.toDate().toLocaleDateString('pt-BR');
      if (createdAt && typeof createdAt === 'object' && 'seconds' in createdAt) {
        return new Date(createdAt.seconds * 1000).toLocaleDateString('pt-BR');
      }
      return '-';
    } catch {
      return '-';
    }
  };

  return (
    <div>
      <h1 className="page-title">Candidaturas</h1>

      {msg && (
        <div className="card" style={{ marginBottom: 16, padding: 12, color: '#34d399', borderColor: '#065f46', backgroundColor: '#022c22' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }}></i>{msg}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : candidaturas.length === 0 ? (
          <div className="empty-state"><p>Nenhuma candidatura recebida ainda</p></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Idade</th>
                  <th>Perfil</th>
                  <th>Contato</th>
                  <th>Cidade</th>
                  <th>Motivo</th>
                  <th>Status</th>
                  <th>Código</th>
                  <th>Recebida em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidaturas.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Foto">
                      {c.fotoUrl ? (
                        <img
                          src={c.fotoUrl}
                          alt={c.nome}
                          className="candidatura-foto"
                          loading="lazy"
                        />
                      ) : (
                        <div className="candidatura-foto candidatura-foto-placeholder">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td data-label="Nome"><strong>{c.nome}</strong></td>
                    <td data-label="Idade">{c.idade}</td>
                    <td data-label="Perfil">{c.perfil}</td>
                    <td data-label="Contato">{c.contato}</td>
                    <td data-label="Cidade">{c.cidade}</td>
                    <td data-label="Motivo" title={c.porque} style={{ maxWidth: 200 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.porque}
                      </span>
                    </td>
                    <td data-label="Status">{statusBadge(c.status)}</td>
                    <td data-label="Código">
                      {c.codigoGerado ? <code>{c.codigoGerado}</code> : '-'}
                    </td>
                    <td data-label="Recebida em">{dataFormatada(c.createdAt)}</td>
                    <td data-label="Ações">
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.status !== 'Aprovado' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleAprovar(c.id)}>Aprovar</button>
                        )}
                        {c.status !== 'Recusado' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleRecusar(c.id)}>Recusar</button>
                        )}
                        {c.status === 'Aprovado' && (
                          <button className="btn btn-whatsapp btn-sm" onClick={() => abrirWhatsApp(c)}>
                            <WhatsAppIcon /> WhatsApp
                          </button>
                        )}
                        {c.status === 'Aprovado' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => copiarMensagem(c)}>Copiar</button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => handleExcluir(c.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
