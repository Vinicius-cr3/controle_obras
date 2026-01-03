from sqlalchemy import Column, Integer, String
from app.database import Base

class Condominio(Base):
    __tablename__ = "condominios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
