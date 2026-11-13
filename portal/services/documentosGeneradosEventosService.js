import {
    obtenerTenantIdActual
} from "../tenantContextService.js";

import { supabase } from "../../js/supabaseClient.js";

const TABLE = "documentos_generados_eventos";

export const documentosGeneradosEventosService = {

    // =====================================================
    // CONSULTAS
    // =====================================================

    async getAll() {

        const clienteId = obtenerTenantIdActual();
    
        if (clienteId == null) {
            throw new Error("No se pudo determinar la empresa activa.");
        }
    
        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("cliente_id", clienteId)
            .order("created_at", { ascending: false });
    
        if (error) {
            console.error("Error al obtener eventos documentales:", error);
            throw error;
        }
    
        return data || [];
    },
    
    async getByLote(loteId) {
    
        const clienteId = obtenerTenantIdActual();
    
        if (clienteId == null) {
            throw new Error("No se pudo determinar la empresa activa.");
        }
    
        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("lote_id", loteId)
            .eq("cliente_id", clienteId)
            .order("created_at", { ascending: true });
    
        if (error) {
            console.error("Error al obtener eventos del lote:", error);
            throw error;
        }
    
        return data || [];
    },
    
    async getByContrato(contratoId) {
    
        const clienteId = obtenerTenantIdActual();
    
        if (clienteId == null) {
            throw new Error("No se pudo determinar la empresa activa.");
        }
    
        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("contrato_id", contratoId)
            .eq("cliente_id", clienteId)
            .order("created_at", { ascending: true });
    
        if (error) {
            console.error("Error al obtener eventos del contrato:", error);
            throw error;
        }
    
        return data || [];
    },

    // =====================================================
    // REGISTRO MEDIANTE RPC
    // =====================================================

    async registrar(evento) {

        const clienteId = obtenerTenantIdActual();
    
        if (clienteId == null) {
            throw new Error("No se pudo determinar la empresa activa.");
        }
    
        const { data, error } = await supabase.rpc(
            "registrar_evento_documental",
            {
                p_datos: {
                    ...evento,
                    cliente_id: clienteId
                }
            }
        );
    
        if (error) {
            console.error("Error al registrar evento documental:", error);
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
                detalle?.message ||
                detalle ||
                "Error desconocido"
            )
        });
    }
};
