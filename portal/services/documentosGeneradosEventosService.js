
import { supabase } from "../../js/supabaseClient.js";

const TABLE = "documentos_generados_eventos";

export const documentosGeneradosEventosService = {

    async registrar(evento) {
        const { data, error } = await supabase
            .from(TABLE)
            .insert(evento)
            .select()
            .single();

        if (error) {
            console.error(
                "Error al registrar evento documental:",
                error
            );
            throw error;
        }

        return data;
    },

    async registrarGeneracion(documento) {
        return this.registrar({
            ...documento,
            evento: "GENERADO"
        });
    },

    async registrarDescarga(documento) {
        return this.registrar({
            ...documento,
            evento: "DESCARGA_INICIADA"
        });
    },

    async registrarError(documento, detalle) {
        return this.registrar({
            ...documento,
            evento: "ERROR",
            detalle: String(
                detalle?.message || detalle || "Error desconocido"
            )
        });
    },

    async getByLote(loteId) {
        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("lote_id", loteId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return data;
    },

    async getByContrato(contratoId) {
        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("contrato_id", contratoId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return data;
    }
};
