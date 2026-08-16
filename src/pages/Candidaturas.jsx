import { useEffect, useState } from 'react';
import { aprovarCandidatura, recusarCandidatura, excluirCandidatura, listarCandidaturas } from '../services/candidaturasService';

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
    setMsg(`Candidatura aprovada! Código de acesso: ${codigo}`);
    carregar();
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
