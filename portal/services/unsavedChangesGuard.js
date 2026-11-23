
let cambiosPendientes = false;
let proteccionNavegadorActiva = false;

/**
 * Indica si la pantalla actual contiene cambios sin guardar.
 */
export function hayCambiosPendientes() {
    return cambiosPendientes;
}

/**
 * Marca la pantalla actual como modificada.
 */
export function marcarCambiosPendientes() {
    cambiosPendientes = true;
}

/**
 * Limpia el estado cuando los cambios se guardan
 * o cuando se abandona la pantalla.
 */
export function limpiarCambiosPendientes() {
    cambiosPendientes = false;
}

/**
 * Solicita confirmación antes de abandonar
 * una pantalla con cambios pendientes.
 *
 * Retorna:
 * true  -> se puede continuar.
 * false -> se debe permanecer.
 */
export async function confirmarSalida() {

    if (!cambiosPendientes) {
        return true;
    }

    return window.confirm(
        "Tienes cambios sin guardar.\n\n" +
        "Si abandonas esta pantalla, perderás la información ingresada.\n\n" +
        "¿Deseas salir sin guardar?"
    );
}

/**
 * Protección nativa del navegador:
 * cerrar pestaña, recargar o abandonar el sitio.
 */
export function activarProteccionNavegador() {

    if (proteccionNavegadorActiva) return;

    window.addEventListener("beforeunload", protegerSalida);

    proteccionNavegadorActiva = true;
}

function protegerSalida(event) {

    if (!cambiosPendientes) return;

    event.preventDefault();
    event.returnValue = "";
}
