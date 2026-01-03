from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Obra(Base):
    __tablename__ = "obras"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(String)
    status = Column(String, default="CADASTRADA")

    condominio_id = Column(Integer, ForeignKey("condominios.id"), nullable=False)
