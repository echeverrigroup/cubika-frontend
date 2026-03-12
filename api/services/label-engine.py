from fpdf import FPDF
from io import BytesIO
import pandas as pd


class EtiquetaPDF(FPDF):

    def header(self):

        self.set_font("Arial", "B", 16)
        self.set_fill_color(0, 0, 0)
        self.set_text_color(255, 255, 255)

        self.cell(0, 10, self.linea.upper(), ln=True, align="C", fill=True)

        self.set_text_color(0, 0, 0)

        self.ln(5)

        self.set_font("Arial", "B", 14)
        self.cell(0, 6, f"BULTO # {self.bulto}", ln=True)

        self.set_font("Arial", "", 9)
        self.cell(0, 6, f"Fecha de Empacado: {self.fecha}", ln=True)

        self.ln(3)


def generar_etiquetas_desde_df(df: pd.DataFrame):

    columnas_clave = [
        "BULTO",
        "LINEA",
        "MODELO",
        "FAMILIA",
        "COLOR",
        "PPTO",
        "CANTIDAD"
    ]

    df = df[columnas_clave].dropna()

    df["CANTIDAD"] = df["CANTIDAD"].astype(int)
    df["BULTO"] = df["BULTO"].astype(int)

    pdf = EtiquetaPDF()

    bultos = df["BULTO"].unique()

    for bulto in bultos:

        grupo = df[df["BULTO"] == bulto]

        linea = " + ".join(sorted(grupo["LINEA"].unique()))

        resumen = (
            grupo.groupby(["FAMILIA", "MODELO", "COLOR", "PPTO"])
            .agg({"CANTIDAD": "sum"})
            .reset_index()
        )

        pdf.bulto = str(bulto)
        pdf.linea = linea
        pdf.fecha = "Generado desde Cubika"

        pdf.add_page()

        pdf.set_font("Arial", "B", 10)

        pdf.cell(40, 8, "Modelo", 1)
        pdf.cell(60, 8, "Familia", 1)
        pdf.cell(40, 8, "Color", 1)
        pdf.cell(20, 8, "PPTO", 1)
        pdf.cell(20, 8, "Cantidad", 1)

        pdf.ln()

        total = 0

        for _, row in resumen.iterrows():

            pdf.set_font("Arial", "", 10)

            pdf.cell(40, 8, str(row["MODELO"]), 1)
            pdf.cell(60, 8, str(row["FAMILIA"]), 1)
            pdf.cell(40, 8, str(row["COLOR"]), 1)
            pdf.cell(20, 8, str(row["PPTO"]), 1)
            pdf.cell(20, 8, str(int(row["CANTIDAD"])), 1)

            pdf.ln()

            total += int(row["CANTIDAD"])

        pdf.set_font("Arial", "B", 10)

        pdf.cell(160, 8, "TOTAL UNIDADES", 1)
        pdf.cell(20, 8, str(total), 1)

    buffer = BytesIO()

    pdf.output(buffer)

    return buffer.getvalue()
