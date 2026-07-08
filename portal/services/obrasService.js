import { supabase }
from "../../js/supabaseClient.js";

const TABLE =
    "obras";

export const obrasService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    *,
                    empresa:empresas_construccion(
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
                    empresa:empresas_construccion(
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
            await supabase
                .from(TABLE)
                .insert(obra)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },


    async update(id, obra) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(obra)
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    }

};
