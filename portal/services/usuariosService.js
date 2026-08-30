import { supabase }
from "../../js/supabaseClient.js";


const TABLE =
    "usuarios";


export const usuariosService = {


    // ==================================================
    // OBTENER TODOS LOS USUARIOS
    // ==================================================

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .order("nombre");

        if (error)
            throw error;

        return data;

    },


    // ==================================================
    // OBTENER USUARIO POR ID
    // ==================================================

    async getById(id) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .eq("id", id)
                .single();

        if (error)
            throw error;

        return data;

    },


    // ==================================================
    // OBTENER USUARIOS DE UNA EMPRESA
    // ==================================================

    async getByEmpresa(empresaId) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .eq("empresa_id", empresaId)
                .order("nombre");

        if (error)
            throw error;

        return data;

    },


    // ==================================================
    // CREAR REGISTRO DE USUARIO
    // ==================================================
    //
    // IMPORTANTE:
    // La creación de usuarios mediante invitación
    // debe realizarse mediante la Edge Function
    // invite-user.
    //
    // Este método queda disponible para operaciones
    // administrativas futuras que necesiten crear
    // directamente el registro en usuarios.
    //

    async create(usuario) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .insert(usuario)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },


    // ==================================================
    // ACTUALIZAR USUARIO
    // ==================================================

    async update(id, usuario) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(usuario)
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },


    // ==================================================
    // CAMBIAR ESTADO
    // ==================================================

    async cambiarEstado(id, estado) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update({
                    estado,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },


    // ==================================================
    // INVITAR USUARIO
    // ==================================================

    async invitar(usuario) {

        const { data, error } =
            await supabase.functions.invoke(
                "invite-user",
                {
                    body: usuario
                }
            );

        if (error)
            throw error;

        return data;

    }

};
