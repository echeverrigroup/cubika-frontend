import { supabase } from "../../js/supabaseClient.js";


export const globalService = {


    async getTiposJornada() {

        const { data, error } = await supabase
            .schema("global")
            .from("tipos_jornada")
            .select("id, codigo, nombre, descripcion")
            .eq("activo", true)
            .order("orden")
            .order("nombre");
    
        if (error) throw error;
    
        return data;
    },


    async getParametroVigente(codigo) {

        const hoy =
            new Date()
                .toISOString()
                .split("T")[0];


        // 1. Buscar el parámetro
        const { data: parametro, error: errorParametro } =
            await supabase
                .schema("global")
                .from("parametros")
                .select(`
                    id,
                    codigo,
                    nombre,
                    tipo_dato,
                    unidad
                `)
                .eq("codigo", codigo)
                .eq("activo", true)
                .single();


        if (errorParametro)
            throw errorParametro;


        // 2. Buscar su valor vigente
        const { data: valor, error: errorValor } =
            await supabase
                .schema("global")
                .from("parametros_valores")
                .select(`
                    id,
                    valor,
                    vigente_desde,
                    vigente_hasta,
                    fuente,
                    observacion
                `)
                .eq("parametro_id", parametro.id)
                .lte("vigente_desde", hoy)
                .or(
                    `vigente_hasta.is.null,vigente_hasta.gte.${hoy}`
                )
                .order(
                    "vigente_desde",
                    {
                        ascending: false
                    }
                )
                .limit(1)
                .single();


        if (errorValor)
            throw errorValor;


        return {

            ...parametro,

            ...valor

        };

    }

};
