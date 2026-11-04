
import { supabase } from "../js/supabaseClient.js";

// ==================================================
// CONTEXTO CENTRALIZADO DE SESIÓN
// ==================================================

let contextoActual = null;


// ==================================================
// INICIALIZAR CONTEXTO
// ==================================================

export async function inicializarContexto(user = null) {

    contextoActual = null;

    // 1. Obtener identidad autenticada
    if (!user) {

        const { data, error } =
            await supabase.auth.getUser();

        if (error)
            throw error;

        user = data.user;
    }

    if (!user)
        throw new Error("No existe una sesión autenticada.");


    // 2. Comprobar si es Super Admin
    const { data: admin, error: adminError } =
        await supabase
            .from("platform_admins")
            .select("id, auth_user_id, email, estado")
            .eq("auth_user_id", user.id)
            .maybeSingle();

    if (adminError)
        throw adminError;


    // 3. Si es Super Admin, establecer su contexto
    if (admin) {

        if (String(admin.estado).toUpperCase() !== "ACTIVO") {
            throw new Error("La cuenta de Super Admin no está activa.");
        }

        contextoActual = {

            tipo: "SUPER_ADMIN",

            auth_user_id: user.id,

            platform_admin_id: admin.id,

            email: admin.email

        };

        return contextoActual;
    }


    // 4. Si no es Super Admin, buscar usuario cliente
    const { data: perfil, error: perfilError } =
        await supabase
            .from("usuarios")
            .select(`
                id,
                auth_user_id,
                empresa_id,
                sucursal_id,
                nombre,
                apellido,
                cargo,
                estado,
                empresas (
                    nombre_fantasia,
                    razon_social
                )
            `)
            .eq("auth_user_id", user.id)
            .maybeSingle();

    if (perfilError)
        throw perfilError;

    if (!perfil)
        throw new Error("El usuario no está registrado en Cubika.");

    if (String(perfil.estado).toUpperCase() !== "ACTIVO") {
        throw new Error("El usuario se encuentra inactivo.");
    }

    if (!perfil.empresa_id)
        throw new Error("El usuario no tiene una empresa cliente asignada.");


    // 5. Establecer contexto del cliente
    contextoActual = {

        tipo: "CLIENTE",

        auth_user_id: user.id,

        usuario_id: perfil.id,

        cliente_id: perfil.empresa_id,

        sucursal_id: perfil.sucursal_id,

        nombre: perfil.nombre,

        apellido: perfil.apellido,

        cargo: perfil.cargo,

        empresa: perfil.empresas?.nombre_fantasia
            || perfil.empresas?.razon_social
            || ""

    };

    return contextoActual;
}


// ==================================================
// OBTENER CONTEXTO ACTUAL
// ==================================================

export function obtenerContexto() {

    if (!contextoActual) {
        throw new Error("El contexto de sesión no ha sido inicializado.");
    }

    return contextoActual;
}


// ==================================================
// LIMPIAR CONTEXTO
// ==================================================

export function limpiarContexto() {

    contextoActual = null;

}
