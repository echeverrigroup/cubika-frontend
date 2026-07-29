import { supabase }
from "../../js/supabaseClient.js";

const TABLE =
    "constructoras";

export const constructorasService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    *,
                    region:regiones(
                        id,
                        nombre
                    ),
                    comuna:comunas(
                        id,
                        nombre
                    ),
                    region_representante:regiones(
                        id,
                        nombre
                    ),
                    comuna_representante:comunas(
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
                    region:regiones(
                        id,
                        nombre
                    ),
                    comuna:comunas(
                        id,
                        nombre
                    ),
                    region_representante:regiones(
                        id,
                        nombre
                    ),
                    comuna_representante:comunas(
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


    async create(constructora) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .insert(constructora)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },


    async update(id, constructora) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(constructora)
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    }

};
