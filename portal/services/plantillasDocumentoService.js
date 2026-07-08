import { supabase }
from "../../js/supabaseClient.js";

const TABLE =
    "plantillas_documento";


export const plantillasDocumentoService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .order("nombre");

        if (error)
            throw error;

        return data;

    },


    async getById(id) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .eq("id", id)
                .single();

        if (error)
            throw error;

        return data;

    },


    async create(plantilla) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .insert(plantilla)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },


    async update(id, plantilla) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(plantilla)
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    }

};
