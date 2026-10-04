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
                comuna:comunas(id,nombre)
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
                comuna:comunas(id,nombre)
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        return data;
    },


    async getByIdForDocument(id) {

    const trabajador =
        await this.getById(id);


    const [
        tiposDocumento,
        nacionalidades,
        estadosCiviles,
        bancos,
        tiposCuenta
    ] = await Promise.all([

        this.getTiposDocumento(),

        this.getNacionalidades(),

        this.getEstadosCiviles(),

        this.getBancos(),

        this.getTiposCuenta()

    ]);


    return {

        ...trabajador,

        tipo_documento:
            tiposDocumento.find(
                item =>
                    item.id ===
                    trabajador.tipo_documento_id
            )?.nombre ?? "",


        nacionalidad:
            nacionalidades.find(
                item =>
                    item.id ===
                    trabajador.nacionalidad_id
            )?.nombre ?? "",


        estado_civil:
            estadosCiviles.find(
                item =>
                    item.id ===
                    trabajador.estado_civil_id
            )?.nombre ?? "",


        banco:
            bancos.find(
                item =>
                    item.id ===
                    trabajador.banco_id
            )?.nombre ?? "",


        tipo_cuenta:
            tiposCuenta.find(
                item =>
                    item.id ===
                    trabajador.tipo_cuenta_id
            )?.nombre ?? ""

    };
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


    async getAFP() {
        const { data, error } = await supabase
            .schema("global")
            .from("afp")
            .select("id, codigo, nombre, nombre_corto")
            .eq("activo", true)
            .order("orden")
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
