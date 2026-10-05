from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from weasyprint import HTML

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cubika.cl",
        "https://www.cubika.cl",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Cubika API funcionando"
    }


@app.get("/pdf/test")
def pdf_test():

    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 60px;
            }

            h1 {
                color: #1f5f8b;
            }

            .box {
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 8px;
            }
        </style>
    </head>

    <body>

        <h1>Cubika — Prueba PDF</h1>

        <div class="box">
            <p>
                Este documento fue generado mediante
                <strong>WeasyPrint</strong>.
            </p>

            <p>
                Si puedes visualizar este PDF, significa que
                FastAPI + WeasyPrint están funcionando correctamente
                en producción.
            </p>
        </div>

    </body>
    </html>
    """

    pdf = HTML(string=html).write_pdf()

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "inline; filename=cubika-test.pdf"
        }
    )
