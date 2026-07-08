import { supabase }
from "../../js/supabaseClient.js";

const TABLE =
    "cargos";

export const cargosService = {

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


    async create(cargo) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .insert(cargo)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },


    async update(id, cargo) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(cargo)
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    }

};
