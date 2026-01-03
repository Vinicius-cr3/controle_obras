from pydantic import BaseModel
from datetime import datetime

class HistoricoStatusOut(BaseModel):
    id: int
    obra_id: int
    status_anterior: str
    novo_status: str
    criado_em: datetime

    class Config:
        from_attributes = True
