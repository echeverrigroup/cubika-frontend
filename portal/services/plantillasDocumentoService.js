
import { supabase } from "../../js/supabaseClient.js";

const TABLE = "plantillas_documento";
const BUCKET = "plantillas-documentales";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const plantillasDocumentoService = {

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

    async create(plantilla) {
        const { data, error } = await supabase
            .from(TABLE)
            .insert(plantilla)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, plantilla) {
        const { data, error } = await supabase
            .from(TABLE)
            .update(plantilla)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // =========================================
    // ARCHIVOS DOCX - SUPABASE STORAGE
    // =========================================

    async subirArchivoDocx(plantillaId, archivo) {
        if (!plantillaId) {
            throw new Error("Falta el identificador de la plantilla.");
        }

        if (!archivo || !(archivo instanceof File)) {
            throw new Error("Debes seleccionar un archivo DOCX.");
        }

        if (!archivo.name.toLowerCase().endsWith(".docx")) {
            throw new Error("El archivo debe tener extensión .docx.");
        }

        if (archivo.size === 0) {
            throw new Error("El archivo seleccionado está vacío.");
        }

        // Ruta estable: un archivo original por plantilla.
        const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${plantillaId}/${Date.now()}-${nombreSeguro}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, archivo, {
                contentType: DOCX_MIME,
                upsert: true
            });

        if (error) throw error;

        return path;
    },

    async descargarArchivoDocx(path) {
        if (!path) {
            throw new Error("La plantilla no tiene un archivo DOCX asociado.");
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

    async guardarAsociaciones(
        plantillaId,
        constructoraIds = [],
        cargoIds = []
    ) {
        constructoraIds = [...new Set(constructoraIds)];
        cargoIds = [...new Set(cargoIds)];

        const { error: errorDeleteConstructoras } = await supabase
            .from("plantilla_constructoras")
            .delete()
            .eq("plantilla_id", plantillaId);

        if (errorDeleteConstructoras) {
            throw errorDeleteConstructoras;
        }

        if (constructoraIds.length > 0) {
            const { error } = await supabase
                .from("plantilla_constructoras")
                .insert(
                    constructoraIds.map(constructora_id => ({
                        plantilla_id: plantillaId,
                        constructora_id
                    }))
                );

            if (error) throw error;
        }

        const { error: errorDeleteCargos } = await supabase
            .from("plantilla_cargos")
            .delete()
            .eq("plantilla_id", plantillaId);

        if (errorDeleteCargos) {
            throw errorDeleteCargos;
        }

        if (cargoIds.length > 0) {
            const { error } = await supabase
                .from("plantilla_cargos")
                .insert(
                    cargoIds.map(cargo_id => ({
                        plantilla_id: plantillaId,
                        cargo_id
                    }))
                );

            if (error) throw error;
        }
    }
};
