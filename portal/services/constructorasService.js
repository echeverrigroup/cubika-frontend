import { supabase }
from "../../js/supabaseClient.js";

const TABLE =
    "constructoras";

export const constructorasService = {

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
