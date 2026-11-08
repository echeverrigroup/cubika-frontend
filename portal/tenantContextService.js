
import { supabase } from "../js/supabaseClient.js";

// ==================================================
// CONTEXTO DE EMPRESA CLIENTE
// ==================================================
//
// Este servicio administra el tenant con el que se trabaja
// dentro del portal.
//
// - CLIENTE: utiliza siempre el cliente_id de contexto.js.
// - SUPER_ADMIN: puede seleccionar una empresa cliente activa.
//
// IMPORTANTE:
// El tenant seleccionado en el navegador es contexto de interfaz.
// Las RPC y políticas RLS deben validar siempre la autorización
// correspondiente en el servidor.

const STORAGE_KEY = "cubika_tenant_activo";

let empresasClientes = [];
let empresaClienteActiva = null;
let tipoContexto = null;


// ==================================================
// NORMALIZAR EMPRESA
// ==================================================

function normalizarEmpresa(empresa) {
    return {
        id: String(empresa.id),
        razon_social: empresa.razon_social,
        nombre_fantasia: empresa.nombre_fantasia,
        nombre:
            empresa.nombre_fantasia?.trim()
            || empresa.razon_social
            || `Empresa ${empresa.id}`,
        estado: empresa.estado
    };
}


// ==================================================
// CARGAR EMPRESAS CLIENTES ACTIVAS
// ==================================================

export async function cargarEmpresasClientes() {
    const { data, error } = await supabase
        .from("empresas")
        .select(`
            id,
            razon_social,
            nombre_fantasia,
            estado
        `)
        .eq("estado", "Activo")
        .order("nombre_fantasia", { ascending: true });

    if (error) {
        console.error(
            "Error al cargar empresas clientes:",
            error
        );
        throw error;
    }

    empresasClientes = (data ?? []).map(normalizarEmpresa);

    return [...empresasClientes];
}


// ==================================================
// INICIALIZAR CONTEXTO DE TENANT
// ==================================================

export async function inicializarTenantContext(contexto) {
    if (!contexto?.tipo) {
        throw new Error(
            "No se recibió un contexto de sesión válido."
        );
    }

    tipoContexto = contexto.tipo;

    // --------------------------------------------------
    // SUPER ADMIN: puede seleccionar un tenant
    // --------------------------------------------------

    if (contexto.tipo === "SUPER_ADMIN") {
        await cargarEmpresasClientes();

        if (empresasClientes.length === 0) {
            empresaClienteActiva = null;
            sessionStorage.removeItem(STORAGE_KEY);

            throw new Error(
                "No existen empresas clientes activas disponibles."
            );
        }

        const tenantGuardado =
            sessionStorage.getItem(STORAGE_KEY);

        empresaClienteActiva =
            empresasClientes.find(
                empresa => empresa.id === tenantGuardado
            ) ?? empresasClientes[0];

        sessionStorage.setItem(
            STORAGE_KEY,
            empresaClienteActiva.id
        );

        return obtenerTenantActual();
    }

    // --------------------------------------------------
    // CLIENTE: el tenant viene del contexto autenticado
    // --------------------------------------------------

    if (contexto.tipo === "CLIENTE") {
        if (!contexto.cliente_id) {
            throw new Error(
                "El usuario cliente no tiene un tenant asignado."
            );
        }

        empresaClienteActiva = {
            id: String(contexto.cliente_id),
            nombre: contexto.empresa || "Empresa cliente",
            nombre_fantasia: contexto.empresa || null,
            razon_social: null
        };

        empresasClientes = [];

        sessionStorage.removeItem(STORAGE_KEY);

        return obtenerTenantActual();
    }

    throw new Error(
        `Tipo de contexto no soportado: ${contexto.tipo}`
    );
}


// ==================================================
// OBTENER TENANT ACTUAL
// ==================================================

export function obtenerTenantActual() {
    if (!tipoContexto || !empresaClienteActiva) {
        throw new Error(
            "El contexto de empresa cliente no ha sido inicializado."
        );
    }

    return {
        ...empresaClienteActiva,
        tipo_contexto: tipoContexto
    };
}


// ==================================================
// OBTENER ID DEL TENANT ACTUAL
// ==================================================

export function obtenerTenantIdActual() {
    return obtenerTenantActual().id;
}


// ==================================================
// OBTENER EMPRESAS DISPONIBLES
// ==================================================

export function obtenerEmpresasClientes() {
    return [...empresasClientes];
}


// ==================================================
// SELECCIONAR EMPRESA CLIENTE
// ==================================================

export function seleccionarEmpresaCliente(empresaId) {
    if (tipoContexto !== "SUPER_ADMIN") {
        throw new Error(
            "Solo el Super Admin puede cambiar la empresa cliente activa."
        );
    }

    const empresa = empresasClientes.find(
        item => item.id === String(empresaId)
    );

    if (!empresa) {
        throw new Error(
            "La empresa seleccionada no está disponible o se encuentra inactiva."
        );
    }

    empresaClienteActiva = empresa;

    sessionStorage.setItem(
        STORAGE_KEY,
        empresa.id
    );

    return obtenerTenantActual();
}


// ==================================================
// LIMPIAR CONTEXTO DE TENANT
// ==================================================

export function limpiarTenantContext() {
    empresasClientes = [];
    empresaClienteActiva = null;
    tipoContexto = null;

    sessionStorage.removeItem(STORAGE_KEY);
}
