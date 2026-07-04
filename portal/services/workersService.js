import { supabase } from "../../js/supabaseClient.js";

export const workersService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from("workers")
                .select(`
                    *,
                    empresas (
                        id,
                        nombre
                    )
                `)
                .order("apellido_paterno");

        if (error) {

            console.error(error);

            return [];

        }

        return data;

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

    },


    async create(worker) {

        const { error } =
            await supabase
                .from("workers")
                .insert(worker);

        if (error) {

            console.error(error);

            throw error;

        }

    },


    async update(id, worker) {

        const { error } =
            await supabase
                .from("workers")
                .update(worker)
                .eq("id", id);

        if (error) {

            console.error(error);

            throw error;

        }

    },


    async delete(id) {

        const { error } =
            await supabase
                .from("workers")
                .delete()
                .eq("id", id);

        if (error) {

            console.error(error);

            throw error;

        }

    }

};
