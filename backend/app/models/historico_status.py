from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class HistoricoStatus(Base):
    __tablename__ = "historico_status"

    id = Column(Integer, primary_key=True, index=True)
    obra_id = Column(Integer, ForeignKey("obras.id"), nullable=False)

    status_anterior = Column(String, nullable=False)
    novo_status = Column(String, nullable=False)

    criado_em = Column(DateTime, default=datetime.utcnow)
