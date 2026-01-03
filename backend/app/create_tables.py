from app.database import engine, Base

# IMPORTAR os models para o SQLAlchemy "conhecer" as tabelas
from app.models.condominio import Condominio
from app.models.obra import Obra
from app.models.historico_status import HistoricoStatus

Base.metadata.create_all(bind=engine)
