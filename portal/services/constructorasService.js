
import { supabase } from "../../js/supabaseClient.js";
import { obtenerTenantIdActual } from "../tenantContextService.js";

const TABLE = "constructoras";

export const constructorasService = {

    obtenerClienteId() {
        const clienteId = obtenerTenantIdActual();

        if (clienteId == null) {
            throw new Error("No se pudo identificar la empresa cliente activa.");
        }

        return clienteId;
    },

    async getAll() {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from(TABLE)
            .select("*")
            .eq("cliente_id", clienteId)
            .order("nombre");

        if (error) {
            console.error("Error al obtener constructoras:", error);
            return [];
        }

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

        if (error) {
            console.error("Error al obtener constructora:", error);
            return null;
        }

        return data;
    },

    async create(constructora) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase.rpc(
            "crear_constructora",
            {
                p_datos: constructora,
                p_cliente_id: clienteId
            }
        );

        if (error) throw error;

        return data;
    },

    async update(id, constructora) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase.rpc(
            "actualizar_constructora",
            {
                p_constructora_id: id,
                p_datos: constructora,
                p_cliente_id: clienteId
            }
        );

        if (error) throw error;

        return data;
    },

    async cambiarEstado(id, estado) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase.rpc(
            "cambiar_estado_constructora",
            {
                p_constructora_id: id,
                p_estado: estado,
                p_cliente_id: clienteId
            }
        );

        if (error) throw error;

        return data;
    }

};
