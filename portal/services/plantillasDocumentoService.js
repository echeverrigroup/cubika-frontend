
import { supabase } from "../../js/supabaseClient.js";
import { obtenerTenantIdActual } from "../tenantContextService.js";

const TABLE = "plantillas_documento";
const BUCKET = "plantillas-documentales";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";


export const plantillasDocumentoService = {

    // =========================================
    // IDENTIFICACIÓN DEL TENANT
    // =========================================

    obtenerClienteId() {

        const clienteId = obtenerTenantIdActual();

        if (clienteId == null) {
            throw new Error(
                "No se pudo identificar la empresa cliente activa."
            );
        }

        return clienteId;
    },


    // Se conserva el método anterior para compatibilidad
    // con posibles llamadas existentes.
    async getCurrentClienteId() {

        return this.obtenerClienteId();
    },


    // =========================================
    // CONSULTAS
    // =========================================

    async getAll() {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("cliente_id", clienteId)
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getComplementos() {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                id,
                nombre,
                descripcion,
                contenido
            `)
            .eq("cliente_id", clienteId)
            .eq("tipo_documento", "COMPLEMENTO")
            .eq("estado", "Activo")
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getById(id) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("id", id)
            .eq("cliente_id", clienteId)
            .single();

        if (error) throw error;

        return data;
    },


    // =========================================
    // CREACIÓN DE PLANTILLAS
    // =========================================

    async create(
        plantillaId,
        plantilla,
        constructoraIds = [],
        cargoIds = []
    ) {

        if (!plantillaId) {
            throw new Error(
                "Falta el identificador de la plantilla."
            );
        }

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .rpc("crear_plantilla_con_asociaciones", {
                p_plantilla_id: plantillaId,
                p_datos: plantilla,
                p_constructora_ids: [...new Set(constructoraIds)],
                p_cargo_ids: [...new Set(cargoIds)],
                p_cliente_id: clienteId
            });

        if (error) throw error;

        return data;
    },


    // =========================================
    // ACTUALIZACIÓN DE PLANTILLAS
    // =========================================

    async update(id, plantilla) {

        if (!id) {
            throw new Error(
                "Falta el identificador de la plantilla."
            );
        }

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .rpc("actualizar_plantilla", {
                p_plantilla_id: id,
                p_datos: plantilla,
                p_cliente_id: clienteId
            });

        if (error) throw error;

        return data;
    },


    // =========================================
    // CAMBIO DE ESTADO
    // =========================================

    async cambiarEstado(id, estado) {

        if (!id) {
            throw new Error(
                "Falta el identificador de la plantilla."
            );
        }

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .rpc("cambiar_estado_plantilla", {
                p_plantilla_id: id,
                p_estado: estado,
                p_cliente_id: clienteId
            });

        if (error) throw error;

        return data;
    },


    // =========================================
    // ARCHIVOS DOCX - SUPABASE STORAGE
    // =========================================

    async subirArchivoDocx(plantillaId, archivo) {

        if (!plantillaId) {
            throw new Error(
                "Falta el identificador de la plantilla."
            );
        }

        if (!archivo || !(archivo instanceof File)) {
            throw new Error(
                "Debes seleccionar un archivo DOCX."
            );
        }

        if (!archivo.name.toLowerCase().endsWith(".docx")) {
            throw new Error(
                "El archivo debe tener extensión .docx."
            );
        }

        if (archivo.size === 0) {
            throw new Error(
                "El archivo seleccionado está vacío."
            );
        }

        // Tenant operativo, incluyendo Super Admin.
        const clienteId = this.obtenerClienteId();

        const nombreSeguro = archivo.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

        // Estructura:
        // cliente_id / plantilla_id / archivo
        const path =
            `${clienteId}/${plantillaId}/${Date.now()}-${nombreSeguro}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, archivo, {
                contentType: DOCX_MIME,
                upsert: false
            });

        if (error) throw error;

        return path;
    },


    async descargarArchivoDocx(path) {

        if (!path) {
            throw new Error(
                "La plantilla no tiene un archivo DOCX asociado."
            );
        }

        const { data, error } = await supabase.storage
            .from(BUCKET)
            .download(path);

        if (error) throw error;

        return data;
    },


    async eliminarArchivoDocx(path) {

        if (!path) return;

        const { error } = await supabase.storage
            .from(BUCKET)
            .remove([path]);

        if (error) throw error;
    },


    // =========================================
    // ASOCIACIONES DE CONSTRUCTORAS Y CARGOS
    // =========================================

    async getConstructorasIds(plantillaId) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from("plantilla_constructoras")
            .select("constructora_id")
            .eq("plantilla_id", plantillaId)
            .eq("cliente_id", clienteId);

        if (error) throw error;

        return data.map(item => item.constructora_id);
    },


    async getCargosIds(plantillaId) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from("plantilla_cargos")
            .select("cargo_id")
            .eq("plantilla_id", plantillaId)
            .eq("cliente_id", clienteId);

        if (error) throw error;

        return data.map(item => item.cargo_id);
    },


    async getTodasLasAsociacionesConstructoras() {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from("plantilla_constructoras")
            .select("plantilla_id, constructora_id")
            .eq("cliente_id", clienteId);

        if (error) throw error;

        return data;
    },


    async getTodasLasAsociacionesCargos() {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from("plantilla_cargos")
            .select("plantilla_id, cargo_id")
            .eq("cliente_id", clienteId);

        if (error) throw error;

        return data;
    },


    // =========================================
    // GUARDAR ASOCIACIONES MEDIANTE RPC
    // =========================================

    async guardarAsociaciones(
        plantillaId,
        constructoraIds = [],
        cargoIds = []
    ) {

        const clienteId = this.obtenerClienteId();

        const { error } = await supabase
            .rpc("actualizar_asociaciones_plantilla", {
                p_plantilla_id: plantillaId,
                p_constructora_ids: [...new Set(constructoraIds)],
                p_cargo_ids: [...new Set(cargoIds)],
                p_cliente_id: clienteId
            });

        if (error) throw error;
    }

};
