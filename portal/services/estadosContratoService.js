import { supabase }
from "../../js/supabaseClient.js";


const TABLE =
    "estados_contrato";


export const estadosContratoService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    id,
                    codigo,
                    nombre,
                    descripcion,
                    simbolo,
                    estado
                `)
                .eq(
                    "estado",
                    "Activo"
                )
                .order(
                    "nombre"
                );


        if (error)
            throw error;


        return data;

    },


    async getById(id) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    id,
                    codigo,
                    nombre,
                    descripcion,
                    simbolo,
                    estado
                `)
                .eq(
                    "id",
                    id
                )
                .single();


        if (error)
            throw error;


        return data;

    },


    async getByCodigo(codigo) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    id,
                    codigo,
                    nombre,
                    descripcion,
                    simbolo,
                    estado
                `)
                .eq(
                    "codigo",
                    codigo
                )
                .single();


        if (error)
            throw error;


        return data;

    }

};
