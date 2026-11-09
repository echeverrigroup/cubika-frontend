
import { supabase } from "../../js/supabaseClient.js";

const TABLE = "documentos_generados_eventos";

export const documentosGeneradosEventosService = {

    // =====================================================
    // CONSULTAS
    // =====================================================

    async getAll() {

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(
                "Error al obtener eventos documentales:",
                error
            );
            throw error;
        }

        return data || [];
    },


    async getByLote(loteId) {

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("lote_id", loteId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(
                "Error al obtener eventos del lote:",
                error
            );
            throw error;
        }

        return data || [];
    },


    async getByContrato(contratoId) {

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("contrato_id", contratoId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(
                "Error al obtener eventos del contrato:",
                error
            );
            throw error;
        }

        return data || [];
    },


    // =====================================================
    // REGISTRO CENTRALIZADO MEDIANTE RPC
    // =====================================================

    async registrar(evento) {

        const { data, error } = await supabase.rpc(
            "registrar_evento_documental",
            {
                p_datos: evento
            }
        );

        if (error) {
            console.error(
                "Error al registrar evento documental:",
                error
            );

            throw error;
        }

        return data;
    },


    // =====================================================
    // TIPOS DE EVENTOS
    // =====================================================

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
                detalle?.message ||
                detalle ||
                "Error desconocido"
            )
        });

    }

};
