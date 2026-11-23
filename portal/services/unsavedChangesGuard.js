
const estados = new Map();

let proteccionNavegadorActiva = false;

export function marcarCambiosPendientes(
    scope = "pagina",
    pendiente = true
) {
    if (pendiente) {
        estados.set(scope, true);
    } else {
        estados.delete(scope);
    }
}

export function hayCambiosPendientes(scope = null) {
    if (scope) {
        return estados.get(scope) === true;
    }

    return estados.size > 0;
}

export function limpiarCambiosPendientes(scope = null) {
    if (scope) {
        estados.delete(scope);
    } else {
        estados.clear();
    }
}

export async function confirmarSalida() {
    if (!hayCambiosPendientes()) {
        return true;
    }

    return window.confirm(
        "Tienes cambios sin guardar.\n\n" +
        "Si abandonas esta pantalla, perderás la información ingresada.\n\n" +
        "¿Deseas salir sin guardar?"
    );
}

export function activarProteccionNavegador() {
    if (proteccionNavegadorActiva) return;

    window.addEventListener(
        "beforeunload",
        protegerSalida
    );

    proteccionNavegadorActiva = true;
}

function protegerSalida(event) {
    if (!hayCambiosPendientes()) return;

    event.preventDefault();
    event.returnValue = "";
}
