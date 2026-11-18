
import PizZip from "pizzip";

/**
 * Decodifica entidades XML.
 */
function decodificarXML(texto) {
    return texto.replace(
        /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
        (entidad, codigo) => {
            if (codigo[0] === "#") {
                const numero = codigo[1].toLowerCase() === "x"
                    ? parseInt(codigo.slice(2), 16)
                    : parseInt(codigo.slice(1), 10);

                if (
                    !Number.isInteger(numero) ||
                    numero < 0 ||
                    numero > 0x10FFFF ||
                    (numero >= 0xD800 && numero <= 0xDFFF)
                ) {
                    return entidad;
                }

                return String.fromCodePoint(numero);
            }

            return {
                amp: "&",
                lt: "<",
                gt: ">",
                quot: '"',
                apos: "'",
            }[codigo.toLowerCase()];
        }
    );
}

/**
 * Escapa caracteres especiales para XML.
 */
function escaparXML(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Reemplaza variables dentro de un párrafo Word.
 * Contempla marcadores divididos entre varios nodos w:t.
 */
function reemplazarEnParrafo(parrafo, valores, informe) {
    const regexTexto = /<w:t\b([^>]*)>([\s\S]*?)<\/w:t>/g;
    const nodos = [];

    let coincidencia;

    while ((coincidencia = regexTexto.exec(parrafo)) !== null) {
        nodos.push({
            inicioXML: coincidencia.index,
            finXML: regexTexto.lastIndex,
            atributos: coincidencia[1],
            texto: decodificarXML(coincidencia[2]),
            inicioTexto: 0,
        });
    }

    if (!nodos.length) {
        return parrafo;
    }

    // Reconstruimos el texto completo del párrafo.
    let textoCompleto = "";

    for (const nodo of nodos) {
        nodo.inicioTexto = textoCompleto.length;
        textoCompleto += nodo.texto;
    }

    // Detectamos los marcadores.
    const regexVariable = /{{\s*([A-Z0-9_]+)\s*}}/g;
    const reemplazos = [];

    while (
        (coincidencia = regexVariable.exec(textoCompleto)) !== null
    ) {
        const nombre = coincidencia[1];

        // Registramos todas las variables encontradas.
        informe.encontradas.add(nombre);

        // Sin propiedad o con valor null/undefined:
        // conservamos el marcador original.
        if (
            !Object.hasOwn(valores, nombre) ||
            valores[nombre] === null ||
            valores[nombre] === undefined
        ) {
            informe.sinValor.add(nombre);
            continue;
        }

        reemplazos.push({
            inicio: coincidencia.index,
            fin: coincidencia.index + coincidencia[0].length,
            valor: String(valores[nombre]),
            nombre,
        });

        informe.reemplazadas.add(nombre);
    }

    if (!reemplazos.length) {
        return parrafo;
    }

    const textosNuevos = nodos.map(nodo => nodo.texto);

    // Procesamos de derecha a izquierda para conservar
    // las posiciones originales de los marcadores.
    for (const reemplazo of [...reemplazos].reverse()) {
        const indiceInicial = nodos.findIndex(
            nodo =>
                reemplazo.inicio >= nodo.inicioTexto &&
                reemplazo.inicio < nodo.inicioTexto + nodo.texto.length
        );

        const indiceFinal = nodos.findIndex(
            nodo =>
                reemplazo.fin - 1 >= nodo.inicioTexto &&
                reemplazo.fin - 1 < nodo.inicioTexto + nodo.texto.length
        );

        if (indiceInicial === -1 || indiceFinal === -1) {
            continue;
        }

        const nodoInicial = nodos[indiceInicial];
        const nodoFinal = nodos[indiceFinal];

        const posicionInicial =
            reemplazo.inicio - nodoInicial.inicioTexto;

        const posicionFinal =
            reemplazo.fin - nodoFinal.inicioTexto;

        if (indiceInicial === indiceFinal) {
            textosNuevos[indiceInicial] =
                textosNuevos[indiceInicial].slice(0, posicionInicial) +
                reemplazo.valor +
                textosNuevos[indiceInicial].slice(posicionFinal);

            continue;
        }

        textosNuevos[indiceInicial] =
            textosNuevos[indiceInicial].slice(0, posicionInicial) +
            reemplazo.valor;

        for (
            let i = indiceInicial + 1;
            i < indiceFinal;
            i++
        ) {
            textosNuevos[i] = "";
        }

        textosNuevos[indiceFinal] =
            textosNuevos[indiceFinal].slice(posicionFinal);
    }

    // Reconstruimos los nodos conservando sus atributos.
    let resultado = "";
    let posicionXML = 0;

    nodos.forEach((nodo, indice) => {
        resultado += parrafo.slice(
            posicionXML,
            nodo.inicioXML
        );

        const texto = escaparXML(textosNuevos[indice]);

        const atributos = nodo.atributos.includes("xml:space=")
            ? nodo.atributos
            : `${nodo.atributos} xml:space="preserve"`;

        resultado += `<w:t${atributos}>${texto}</w:t>`;

        posicionXML = nodo.finXML;
    });

    resultado += parrafo.slice(posicionXML);

    return resultado;
}

/**
 * Procesa los párrafos de una parte XML de Word.
 */
function procesarXML(xml, valores, informe) {
    return xml.replace(
        /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g,
        parrafo => reemplazarEnParrafo(
            parrafo,
            valores,
            informe
        )
    );
}

/**
 * Identifica las partes de Word que contienen texto editable.
 */
function esParteDeTextoWord(ruta) {
    return /^word\/(?:document|header\d+|footer\d+|footnotes|endnotes|comments)\.xml$/.test(
        ruta
    );
}

/**
 * Motor genérico de generación DOCX.
 *
 * @param {Buffer} docxBuffer Documento Word original.
 * @param {Object} valores Variables disponibles para reemplazo.
 * @returns {{ buffer: Buffer, informe: Object }}
 */
export function generarDocxConVariables(docxBuffer, valores) {
    if (!Buffer.isBuffer(docxBuffer) || !docxBuffer.length) {
        throw new Error(
            "El documento DOCX recibido está vacío o no es válido."
        );
    }

    if (
        !valores ||
        typeof valores !== "object" ||
        Array.isArray(valores)
    ) {
        throw new Error(
            "Las variables deben recibirse como un objeto."
        );
    }

    const zip = new PizZip(docxBuffer);

    if (!zip.file("word/document.xml")) {
        throw new Error(
            "El DOCX no contiene word/document.xml."
        );
    }

    const informe = {
        encontradas: new Set(),
        reemplazadas: new Set(),
        sinValor: new Set(),
    };

    // Procesamos las distintas partes de texto del documento.
    for (const ruta of Object.keys(zip.files)) {
        if (!esParteDeTextoWord(ruta)) {
            continue;
        }

        const archivo = zip.file(ruta);

        if (!archivo) {
            continue;
        }

        const xmlOriginal = archivo.asText();

        const xmlModificado = procesarXML(
            xmlOriginal,
            valores,
            informe
        );

        if (xmlModificado !== xmlOriginal) {
            zip.file(ruta, xmlModificado);
        }
    }

    const buffer = zip.generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });

    const encontradas = [...informe.encontradas];
    const reemplazadas = [...informe.reemplazadas];
    const sinValor = [...informe.sinValor];

    return {
        buffer,
        informe: {
            encontradas,
            reemplazadas,
            sinValor,

            // Compatibilidad con implementaciones anteriores.
            pendientes: sinValor,
        },
    };
}
