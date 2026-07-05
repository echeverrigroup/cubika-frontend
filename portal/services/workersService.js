import { supabase }
from "../../js/supabaseClient.js";

const TABLE =
    "workers";

export const workersService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select(`
                    *,
                    empresa:empresas_construccion(
                        id,
                        nombre
                    )
                `)
                .order("nombres");

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
                    )
                `)
                .eq("id", id)
                .single();

        if (error)
            throw error;

        return data;

    },

    async create(worker) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .insert(worker)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },

    async update(id, worker) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(worker)
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    }

};
