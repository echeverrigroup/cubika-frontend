import { supabase } from "../../js/supabaseClient.js";


export const usuariosEmpresasService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from("empresas")
                .select(`
                    id,
                    razon_social,
                    nombre_fantasia,
                    estado
                `)
                .order("razon_social");

        if (error) {

            console.error(
                "Error cargando empresas:",
                error
            );

            throw error;

        }

        return data ?? [];

    }

};
