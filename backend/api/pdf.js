import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const ALLOWED_ORIGIN = "https://cubika.cl";

export default async function handler(req, res) {

    res.setHeader(
        "Access-Control-Allow-Origin",
        ALLOWED_ORIGIN
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    let browser;

    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                error: "Método no permitido. Usa POST."
            });
        }

        const { html } = req.body || {};

        if (!html || typeof html !== "string") {
            return res.status(400).json({
                error: "Debes enviar un campo 'html' de tipo string."
            });
        }

        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                right: "20mm",
                bottom: "20mm",
                left: "20mm",
            },
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "inline; filename=cubika-dynamic.pdf"
        );
        res.setHeader("Content-Length", pdf.length);

        return res.end(pdf);

    } catch (error) {
        console.error("Error generando PDF:", error);

        return res.status(500).json({
            error: "No fue posible generar el PDF",
            detail: error.message,
        });

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}