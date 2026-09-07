/**
 * Servicio genérico de exportación Excel para Cúbika.
 *
 * Requiere que xlsx.full.min.js haya sido cargado previamente
 * y que la librería esté disponible como window.XLSX.
 */

export function exportarExcel(
    datos,
    nombreArchivo = "exportacion.xlsx",
    nombreHoja = "Datos"
) {
    if (!Array.isArray(datos)) {
        throw new Error("Los datos para exportar deben ser un arreglo.");
    }

    if (!datos.length) {
        throw new Error("No existen datos para exportar.");
    }

    const XLSX = globalThis.XLSX;

    if (!XLSX) {
        throw new Error(
            "La librería de Excel no está disponible. Verifica la carga de xlsx.full.min.js."
        );
    }

    // Convertir los objetos a una hoja Excel
    const worksheet = XLSX.utils.json_to_sheet(datos);

    // Crear libro
    const workbook = XLSX.utils.book_new();

    // Agregar hoja
    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        nombreHoja.substring(0, 31)
    );

    // Generar y descargar archivo
    XLSX.writeFile(workbook, nombreArchivo, {
        compression: true
    });
}
