
import { generarDocxConVariables } from "../services/docxEngine.js";

const ALLOWED_ORIGIN = "https://cubika.cl";
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Permite que el frontend pueda leer el diagnóstico.
    res.setHeader(
        "Access-Control-Expose-Headers",
        "X-Cubika-Docx-Report"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Método no permitido. Usa POST.",
        });
    }

    try {
        const chunks = [];
        let totalSize = 0;

        for await (const chunk of req) {
            totalSize += chunk.length;

            if (totalSize > MAX_FILE_SIZE) {
                return res.status(413).json({
                    error: "El archivo supera el límite de 15 MB.",
                });
            }

            chunks.push(chunk);
        }

        const body = Buffer.concat(chunks);

        let payload;

        try {
            payload = JSON.parse(body.toString("utf8"));
        } catch {
            return res.status(400).json({
                error: "El cuerpo debe ser JSON válido.",
            });
        }

        const { docxBase64, variables } = payload;

        if (
            typeof docxBase64 !== "string" ||
            !docxBase64.trim()
        ) {
            return res.status(400).json({
                error: "Falta el campo docxBase64.",
            });
        }

        if (
            !variables ||
            typeof variables !== "object" ||
            Array.isArray(variables)
        ) {
            return res.status(400).json({
                error: "El campo variables debe ser un objeto JSON.",
            });
        }

        const docxBuffer = Buffer.from(docxBase64, "base64");

        if (
            !docxBuffer.length ||
            docxBuffer.length > MAX_FILE_SIZE
        ) {
            return res.status(400).json({
                error: "El DOCX está vacío o supera el límite permitido.",
            });
        }

        // Generación del documento y diagnóstico.
        const resultado = generarDocxConVariables(
            docxBuffer,
            variables
        );

        // Codificamos el informe para transportarlo en una cabecera HTTP.
        const informeBase64 = Buffer
            .from(JSON.stringify(resultado.informe))
            .toString("base64");

        res.setHeader(
            "X-Cubika-Docx-Report",
            informeBase64
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="cubika-documento.docx"'
        );

        res.setHeader(
            "Content-Length",
            resultado.buffer.length
        );

        return res.status(200).send(resultado.buffer);

    } catch (error) {
        console.error("Error generando DOCX:", error);

        return res.status(422).json({
            error: "No fue posible procesar la plantilla DOCX.",
            detail: error.message,
        });
    }
}
