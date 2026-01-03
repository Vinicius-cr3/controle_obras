
const API_URL = "http://127.0.0.1:8001";

export async function listarObras(condominioId) {
    const response = await fetch(`${API_URL}/obras?condominio_id=${condominioId}`);

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status} - ${txt}`);
    }

    return response.json();
}

export async function atualizarStatusObra(obraId, novoStatus) {
    const response = await fetch(`${API_URL}/obras/${obraId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
    });

    const txt = await response.text();

    if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${txt}`);
    }

    // seu backend retorna JSON; txt pode vir vazio em algum erro, então cuidamos:
    return txt ? JSON.parse(txt) : null;
}

export async function buscarHistorico(obraId) {
    const response = await fetch(`${API_URL}/obras/${obraId}/historico`);

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status} - ${txt}`);
    }

    return response.json();
}

export async function criarObra({ titulo, descricao, condominio_id }) {
    const response = await fetch(`${API_URL}/obras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descricao, condominio_id }),
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status} - ${txt}`);
    }

    return response.json();
}

export async function listarCondominios() {
    const response = await fetch(`${API_URL}/condominios`);

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HTTP ${response.status} - ${txt}`);
    }

    return response.json();
}