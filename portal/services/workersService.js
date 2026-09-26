import { supabase } from "../../js/supabaseClient.js";

const TABLE = "workers";

export const workersService = {

    // =========================================================
    // WORKERS
    // =========================================================

    async getAll() {
        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                *,
                region:regiones(id,nombre),
                comuna:comunas(id,nombre),
                tipo_documento:tipo_documento_id(
                    id,
                    codigo,
                    nombre
                ),
                nacionalidad:nacionalidad_id(
                    id,
                    codigo,
                    nombre
                ),
                estado_civil:estado_civil_id(
                    id,
                    codigo,
                    nombre
                ),
                banco:banco_id(
                    id,
                    codigo,
                    nombre,
                    nombre_corto
                ),
                tipo_cuenta:tipo_cuenta_id(
                    id,
                    codigo,
                    nombre
                )
            `)
            .order("apellido_paterno");

        if (error) throw error;

        return data;
    },


    async getById(id) {
        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                *,
                region:regiones(id,nombre),
                comuna:comunas(id,nombre),
                tipo_documento:tipo_documento_id(
                    id,
                    codigo,
                    nombre
                ),
                nacionalidad:nacionalidad_id(
                    id,
                    codigo,
                    nombre
                ),
                estado_civil:estado_civil_id(
                    id,
                    codigo,
                    nombre
                ),
                banco:banco_id(
                    id,
                    codigo,
                    nombre,
                    nombre_corto
                ),
                tipo_cuenta:tipo_cuenta_id(
                    id,
                    codigo,
                    nombre
                )
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        return data;
    },


    async create(worker) {
        const { data, error } = await supabase
            .from(TABLE)
            .insert(worker)
            .select()
            .single();

        if (error) throw error;

        return data;
    },


    async update(id, worker) {
        const { data, error } = await supabase
            .from(TABLE)
            .update(worker)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return data;
    },


    async cambiarEstado(id, estado) {
        const { data, error } = await supabase
            .from(TABLE)
            .update({
                estado,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return data;
    },


    // =========================================================
    // CATÁLOGOS GLOBAL
    // =========================================================

    async getTiposDocumento() {
        const { data, error } = await supabase
            .schema("global")
            .from("tipos_documento_identidad")
            .select("id, codigo, nombre")
            .eq("activo", true)
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getNacionalidades() {
        const { data, error } = await supabase
            .schema("global")
            .from("nacionalidades")
            .select("id, codigo, nombre")
            .eq("activo", true)
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getEstadosCiviles() {
        const { data, error } = await supabase
            .schema("global")
            .from("estados_civiles")
            .select("id, codigo, nombre")
            .eq("activo", true)
            .order("orden")
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getBancos() {
        const { data, error } = await supabase
            .schema("global")
            .from("bancos")
            .select("id, codigo, nombre, nombre_corto")
            .eq("activo", true)
            .order("orden")
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getTiposCuenta() {
        const { data, error } = await supabase
            .schema("global")
            .from("tipos_cuenta_bancaria")
            .select("id, codigo, nombre")
            .eq("activo", true)
            .order("orden")
            .order("nombre");

        if (error) throw error;

        return data;
    }

};
