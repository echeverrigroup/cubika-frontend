
import { supabase } from "../../js/supabaseClient.js";

const TABLE = "plantillas_documento";
const BUCKET = "plantillas-documentales";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";


export const plantillasDocumentoService = {

    // =========================================
    // CONSULTAS
    // =========================================

    async getAll() {

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getComplementos() {

        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                id,
                nombre,
                descripcion,
                contenido
            `)
            .eq("tipo_documento", "COMPLEMENTO")
            .eq("estado", "Activo")
            .order("nombre");

        if (error) throw error;

        return data;
    },


    async getById(id) {

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return data;
    },


    // =========================================
    // IDENTIFICACIÓN DEL TENANT
    // =========================================

    async getCurrentClienteId() {

        const { data, error } = await supabase
            .rpc("current_cliente_id");

        if (error) throw error;

        if (data === null || data === undefined) {
            throw new Error(
                "No se pudo identificar el tenant del usuario."
            );
        }

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

        const { data, error } = await supabase
            .rpc("crear_plantilla_con_asociaciones", {
                p_plantilla_id: plantillaId,
                p_datos: plantilla,
                p_constructora_ids: [...new Set(constructoraIds)],
                p_cargo_ids: [...new Set(cargoIds)]
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

        const { data, error } = await supabase
            .rpc("actualizar_plantilla", {
                p_plantilla_id: id,
                p_datos: plantilla
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

        const { data, error } = await supabase
            .rpc("cambiar_estado_plantilla", {
                p_plantilla_id: id,
                p_estado: estado
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

        // Identificar el tenant mediante la función segura.
        const clienteId = await this.getCurrentClienteId();

        // Sanitizar nombre del archivo.
        const nombreSeguro = archivo.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

        // Nueva estructura:
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

        const { data, error } = await supabase
            .from("plantilla_constructoras")
            .select("constructora_id")
            .eq("plantilla_id", plantillaId);

        if (error) throw error;

        return data.map(item => item.constructora_id);
    },


    async getCargosIds(plantillaId) {

        const { data, error } = await supabase
            .from("plantilla_cargos")
            .select("cargo_id")
            .eq("plantilla_id", plantillaId);

        if (error) throw error;

        return data.map(item => item.cargo_id);
    },


    async getTodasLasAsociacionesConstructoras() {

        const { data, error } = await supabase
            .from("plantilla_constructoras")
            .select("plantilla_id, constructora_id");

        if (error) throw error;

        return data;
    },


    async getTodasLasAsociacionesCargos() {

        const { data, error } = await supabase
            .from("plantilla_cargos")
            .select("plantilla_id, cargo_id");

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

        const { error } = await supabase
            .rpc("actualizar_asociaciones_plantilla", {
                p_plantilla_id: plantillaId,
                p_constructora_ids: [...new Set(constructoraIds)],
                p_cargo_ids: [...new Set(cargoIds)]
            });

        if (error) throw error;
    }

};
