import { useEffect, useState } from "react";
import {
  listarObras,
  atualizarStatusObra,
  buscarHistorico,
  criarObra,
  listarCondominios,
} from "./api";

function App() {
  // ---------- estados ----------
  const [condominios, setCondominios] = useState([]);
  const [condominioId, setCondominioId] = useState(null);

  const [obras, setObras] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [obraSelecionada, setObraSelecionada] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  // ---------- carregar condomínios ----------
  useEffect(() => {
    listarCondominios()
      .then((dados) => {
        setCondominios(dados);
        if (dados.length > 0) {
          setCondominioId(dados[0].id);
        }
      })
      .catch((e) => {
        console.error(e);
        alert("Erro ao carregar condomínios (backend ligado na porta 8001?)");
      });
  }, []);

  // ---------- carregar obras ----------
  function carregarObras(id) {
    listarObras(id)
      .then((dados) => setObras(dados))
      .catch((e) => {
        console.error(e);
        alert("Erro ao carregar obras");
      });
  }

  // quando escolher condomínio, carrega as obras dele
  useEffect(() => {
    if (condominioId) {
      carregarObras(condominioId);
      setObraSelecionada(null);
      setHistorico([]);
    }
  }, [condominioId]);

  // ---------- criar obra ----------
  function cadastrarObra(e) {
    e.preventDefault();

    if (!condominioId) {
      alert("Selecione um condomínio");
      return;
    }

    if (!titulo.trim()) {
      alert("Informe o título da obra");
      return;
    }

    criarObra({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      condominio_id: condominioId,
    })
      .then(() => {
        setTitulo("");
        setDescricao("");
        carregarObras(condominioId);
        alert("Obra criada com sucesso");
      })
      .catch((e) => {
        console.error(e);
        alert("Erro ao criar obra");
      });
  }

  // ---------- avançar status (respeita backend) ----------
  function avancarStatus(obra) {
    const transicoes = {
      CADASTRADA: "EM_ANALISE",
      EM_ANALISE: "APROVADA",
    };

    const proximo = transicoes[obra.status];
    if (!proximo) return;

    atualizarStatusObra(obra.id, proximo)
      .then(() => carregarObras(condominioId))
      .catch((e) => {
        console.error(e);
        alert("Erro ao atualizar status");
      });
  }

  // ---------- ver histórico ----------
  function verHistorico(obra) {
    setObraSelecionada(obra);

    buscarHistorico(obra.id)
      .then((dados) => setHistorico(dados))
      .catch((e) => {
        console.error(e);
        setHistorico([]);
        alert("Sem histórico para esta obra");
      });
  }

  return (
    <div>
      <header>
        <h1>Controle de Obras</h1>
      </header>

      <main>
        {/* ---------- seletor de condomínio ---------- */}
        <h2>Condomínio</h2>

        {condominios.length === 0 ? (
          <p>Nenhum condomínio cadastrado.</p>
        ) : (
          <select
            value={condominioId ?? ""}
            onChange={(e) => setCondominioId(Number(e.target.value))}
            style={{ width: "100%", padding: 8, marginBottom: 16 }}
          >
            {condominios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        )}

        {/* ---------- formulário nova obra ---------- */}
        <h2>Nova Obra</h2>

        <form onSubmit={cadastrarObra} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="Título da obra"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="Descrição (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <button type="submit" disabled={!condominioId}>
            Cadastrar obra
          </button>
        </form>

        {/* ---------- lista de obras ---------- */}
        <h2>Obras</h2>

        <div className="lista-obras">
          {obras.length === 0 && <p>Nenhuma obra encontrada.</p>}

          {obras.map((obra) => (
            <div key={obra.id} className="card-obra">
              <h3>{obra.titulo}</h3>
              <p>Status: {obra.status}</p>

              <button onClick={() => verHistorico(obra)}>Ver histórico</button>

              <button
                onClick={() => avancarStatus(obra)}
                disabled={obra.status === "APROVADA"}
              >
                {obra.status === "APROVADA"
                  ? "Aguardando próxima etapa"
                  : "Avançar status"}
              </button>
            </div>
          ))}
        </div>

        {/* ---------- histórico ---------- */}
        {obraSelecionada && (
          <div style={{ marginTop: 20 }}>
            <h2>Histórico — {obraSelecionada.titulo}</h2>

            {historico.length === 0 ? (
              <p>Sem histórico.</p>
            ) : (
              <ul>
                {historico.map((h, idx) => (
                  <li key={h.id ?? idx}>
                    {h.status_anterior} → {h.novo_status} | {h.criado_em}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;