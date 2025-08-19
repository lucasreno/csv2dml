from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import pandas as pd
import io

app = FastAPI(
    title="CSV to DML Converter",
    description="Uma ferramenta para converter arquivos CSV em instruções DML SQL.",
    version="0.1.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens, para desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_insert_statements(df: pd.DataFrame, table_name: str, case_transform: str = 'none', sql_dialect: str = 'postgresql') -> str:
    """Gera instruções INSERT a partir de um DataFrame do pandas com transformações opcionais."""
    inserts = []
    for _, row in df.iterrows():
        columns = ", ".join(df.columns)

        values = []
        for v in row:
            # Garante que o valor é uma string antes de transformar
            val_str = str(v) if pd.notna(v) else 'NULL'

            if val_str != 'NULL':
                if case_transform == 'uppercase':
                    val_str = val_str.upper()
                elif case_transform == 'lowercase':
                    val_str = val_str.lower()

                # Escapa aspas simples para SQL
                val_str = val_str.replace("'", "''")
                val_str = f"'{val_str}'"

            values.append(val_str)

        values_str = ", ".join(values)
        insert_statement = f"INSERT INTO {table_name} ({columns}) VALUES ({values_str});"
        inserts.append(insert_statement)
    return "\n".join(inserts)

@app.post("/upload/", response_class=PlainTextResponse)
async def create_upload_file(
    file: UploadFile = File(...),
    table_name: str = "sua_tabela",
    case_transform: str = 'none',
    sql_dialect: str = 'postgresql'
):
    """
    Recebe um arquivo CSV e opções de transformação, e retorna as instruções INSERT SQL.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Formato de arquivo inválido. Por favor, envie um arquivo .csv.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        # Padronizar nomes de colunas
        df.columns = [col.lower().replace(' ', '_') for col in df.columns]

        # Gera DML com as transformações
        dml_statements = generate_insert_statements(df, table_name, case_transform, sql_dialect)
        return dml_statements
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro ao processar o arquivo: {e}")

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao conversor de CSV para DML."}
