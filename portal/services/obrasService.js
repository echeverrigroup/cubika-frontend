
import { supabase } from "../../js/supabaseClient.js";
import { obtenerTenantIdActual } from "../tenantContextService.js";

const TABLE = "obras";

export const obrasService = {

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
            .select(`
                *,
                constructora:constructoras(id,nombre),
                region:regiones(id,nombre),
                comuna:comunas(id,nombre)
            `)
            .eq("cliente_id", clienteId)
            .order("nombre");

        if (error) {
            console.error("Error al obtener obras:", error);
            return [];
        }

        return data;
    },

    async getById(id) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase
            .from(TABLE)
            .select(`
                *,
                constructora:constructoras(id,nombre),
                region:regiones(id,nombre),
                comuna:comunas(id,nombre)
            `)
            .eq("id", id)
            .eq("cliente_id", clienteId)
            .single();

        if (error) {
            console.error("Error al obtener obra:", error);
            return null;
        }

        return data;
    },

    async create(obra) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase.rpc(
            "crear_obra",
            {
                p_datos: obra,
                p_cliente_id: clienteId
            }
        );

        if (error) throw error;

        return data;
    },

    async update(id, obra) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase.rpc(
            "actualizar_obra",
            {
                p_obra_id: id,
                p_datos: obra,
                p_cliente_id: clienteId
            }
        );

        if (error) throw error;

        return data;
    },

    async cambiarEstado(id, estado) {

        const clienteId = this.obtenerClienteId();

        const { data, error } = await supabase.rpc(
            "cambiar_estado_obra",
            {
                p_obra_id: id,
                p_estado: estado,
                p_cliente_id: clienteId
            }
        );

        if (error) throw error;

        return data;
    }

};
