from fastapi import FastAPI, UploadFile, File
import pandas as pd
from fastapi.responses import FileResponse
from fpdf import FPDF
import uuid

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Cubika Backend funcionando"}

# =========================
# SUBIR EXCEL
# =========================
@app.post("/upload-excel/")
async def upload_excel(file: UploadFile = File(...)):

    df = pd.read_excel(file.file)

    return {
        "filename": file.filename,
        "columnas_detectadas": list(df.columns),
        "filas": len(df)
    }

# =========================
# GENERAR PDF
# =========================
@app.get("/generate-pdf/")
def generate_pdf():

    filename = f"documento_{uuid.uuid4().hex}.pdf"

    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Cubika - Documento generado", ln=True)

    pdf.output(filename)

    return FileResponse(filename, media_type="application/pdf", filename=filename)
