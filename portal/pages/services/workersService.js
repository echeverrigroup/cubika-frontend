import { supabase } from "../../js/supabaseClient.js";

export const workersService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from("workers")
                .select("*")
                .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return [];
        }

        return data;

    },

    async create(worker) {

        const { data, error } =
            await supabase
                .from("workers")
                .insert(worker)
                .select();

        if (error) {
            console.error(error);
            return null;
        }

        return data?.[0];

    },

    async update(id, worker) {

        const { data, error } =
            await supabase
                .from("workers")
                .update(worker)
                .eq("id", id)
                .select();

        if (error) {
            console.error(error);
            return null;
        }

        return data?.[0];

    },

    async delete(id) {

        const { error } =
            await supabase
                .from("workers")
                .delete()
                .eq("id", id);

        if (error) {
            console.error(error);
        }

    },

    async getById(id) {

        const { data, error } =
            await supabase
                .from("workers")
                .select("*")
                .eq("id", id)
                .single();

        if (error) {
            console.error(error);
            return null;
        }

        return data;

    }

};
