from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.obra import Obra
from app.models.historico_status import HistoricoStatus
from app.models.condominio import Condominio

from app.schemas.obra import ObraCreate, ObraStatusUpdate
from app.schemas.historico_status import HistoricoStatusOut
from app.schemas.condominio import CondominioCreate, CondominioOut

app = FastAPI()

# CORS (liberado para integração com frontend no Vercel e testes locais)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

transicoes_permitidas = {
    "CADASTRADA": ["EM_ANALISE"],
    "EM_ANALISE": ["APROVADA", "REPROVADA"],
    "APROVADA": ["CONCLUIDA"],
    "REPROVADA": [],
    "CONCLUIDA": [],
}

@app.get("/")
def root():
    return {"mensagem": "API de Controle de Obras rodando"}

# -------- Condominios --------

@app.post("/condominios", response_model=CondominioOut)
def criar_condominio(dados: CondominioCreate, db: Session = Depends(get_db)):
    condominio = Condominio(nome=dados.nome)
    db.add(condominio)
    db.commit()
    db.refresh(condominio)
    return condominio

@app.get("/condominios", response_model=List[CondominioOut])
def listar_condominios(db: Session = Depends(get_db)):
    return db.query(Condominio).order_by(Condominio.id).all()

# -------- Obras --------

@app.post("/obras")
def criar_obra(obra: ObraCreate, db: Session = Depends(get_db)):
    # valida se o condomínio existe (evita 500 por FK)
    cond = db.query(Condominio).filter(Condominio.id == obra.condominio_id).first()
    if not cond:
        raise HTTPException(status_code=404, detail="Condomínio não encontrado")

    nova_obra = Obra(
        titulo=obra.titulo,
        descricao=obra.descricao,
        condominio_id=obra.condominio_id,
    )
    db.add(nova_obra)
    db.commit()
    db.refresh(nova_obra)
    return nova_obra

@app.get("/obras")
def listar_obras(condominio_id: int, db: Session = Depends(get_db)):
    return db.query(Obra).filter(Obra.condominio_id == condominio_id).all()

@app.patch("/obras/{obra_id}/status")
def atualizar_status(obra_id: int, dados: ObraStatusUpdate, db: Session = Depends(get_db)):
    obra = db.query(Obra).filter(Obra.id == obra_id).first()
    if not obra:
        raise HTTPException(status_code=404, detail="Obra não encontrada")

    if dados.status not in transicoes_permitidas.get(obra.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Transição inválida de {obra.status} para {dados.status}",
        )

    status_anterior = obra.status
    obra.status = dados.status

    historico = HistoricoStatus(
        obra_id=obra.id,
        status_anterior=status_anterior,
        novo_status=dados.status,
    )
    db.add(historico)

    db.commit()
    db.refresh(obra)
    return obra

@app.get("/obras/{obra_id}/historico", response_model=List[HistoricoStatusOut])
def listar_historico(obra_id: int, db: Session = Depends(get_db)):
    historico = (
        db.query(HistoricoStatus)
        .filter(HistoricoStatus.obra_id == obra_id)
        .order_by(HistoricoStatus.criado_em)
        .all()
    )

    if not historico:
        raise HTTPException(status_code=404, detail="Nenhum histórico encontrado para esta obra")

    return historico