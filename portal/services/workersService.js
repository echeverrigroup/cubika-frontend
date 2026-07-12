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
                    region:regiones(
                        id,
                        nombre
                    ),
                    comuna:comunas(
                        id,
                        nombre
                    )
                `)
                .order(
                    "apellido_paterno"
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
                    *,
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

    },


    async cambiarEstado(
        id,
        estado
    ) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update({

                    estado,

                    updated_at:
                        new Date()
                            .toISOString()

                })
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    }

};
