import { supabase }
from "../../js/supabaseClient.js";

const TABLE =
    "tipos_contrato";

export const tiposContratoService = {

    async getAll() {

        const {
            data,
            error
        } = await supabase

            .from(TABLE)

            .select("*")

            .eq(
                "estado",
                "Activo"
            )

            .order(
                "nombre"
            );

        if (error) {

            console.error(
                "Error obteniendo tipos de contrato:",
                error
            );

            return [];
        }

        return data ?? [];
    },



    async getById(id) {

        const {
            data,
            error
        } = await supabase

            .from(TABLE)

            .select("*")

            .eq(
                "id",
                id
            )

            .single();

        if (error) {

            console.error(
                "Error obteniendo tipo de contrato:",
                error
            );

            return null;
        }

        return data;
    }

};
