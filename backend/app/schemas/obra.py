from pydantic import BaseModel

class ObraCreate(BaseModel):
    titulo: str
    descricao: str | None = None
    condominio_id: int

class ObraStatusUpdate(BaseModel):
    status: str
