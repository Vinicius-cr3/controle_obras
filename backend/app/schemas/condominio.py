from pydantic import BaseModel

class CondominioCreate(BaseModel):
    nome: str

class CondominioOut(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True
