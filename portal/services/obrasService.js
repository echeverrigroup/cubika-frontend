
import { supabase }
from "../../js/supabaseClient.js";

const TABLE = "obras";

export const obrasService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    *,
                    constructora:constructoras(
                        id,
                        nombre
                    ),
                    region:regiones(
                        id,
                        nombre
                    ),
                    comuna:comunas(
                        id,
                        nombre
                    )
                `)
                .order("nombre");

        if (error)
            throw error;

        return data;
    },


    async getById(id) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    *,
                    constructora:constructoras(
                        id,
                        nombre
                    ),
                    region:regiones(
                        id,
                        nombre
                    ),
                    comuna:comunas(
                        id,
                        nombre
                    )
                `)
                .eq("id", id)
                .single();

        if (error)
            throw error;

        return data;
    },


    async create(obra) {

        const { data, error } =
            await supabase.rpc(
                "crear_obra",
                {
                    p_datos: obra
                }
            );

        if (error)
            throw error;

        return data;
    },


    async update(id, obra) {

        const { data, error } =
            await supabase.rpc(
                "actualizar_obra",
                {
                    p_obra_id: id,
                    p_datos: obra
                }
            );

        if (error)
            throw error;

        return data;
    },


    async cambiarEstado(id, estado) {

        const { data, error } =
            await supabase.rpc(
                "cambiar_estado_obra",
                {
                    p_obra_id: id,
                    p_estado: estado
                }
            );

        if (error)
            throw error;

        return data;
    }

};
