import { supabase } from "../../js/supabaseClient.js";

const TABLE = "document_sequences";

export const documentNumberService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .order("tipo_documento")
                .order("anio", {
                    ascending: false
                });

        if (error)
            throw error;

        return data;

    },

    async getByTypeAndYear(
        tipoDocumento,
        anio
    ) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .eq(
                    "tipo_documento",
                    tipoDocumento
                )
                .eq(
                    "anio",
                    anio
                )
                .maybeSingle();

        if (error)
            throw error;

        return data;

    },

    async create(sequence) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .insert(sequence)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },

    async update(
        id,
        sequence
    ) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(sequence)
                .eq("id", id)
                .select()
                .single();

        if (error)
            throw error;

        return data;

    },

    async delete(id) {

        const { error } =
            await supabase
                .from(TABLE)
                .delete()
                .eq("id", id);

        if (error)
            throw error;

    },

    async generarNumeroDocumento(
        tipoDocumento
    ) {

        const { data, error } =
            await supabase.rpc(
                "generar_numero_documento",
                {
                    p_tipo_documento:
                        tipoDocumento
                }
            );

        if (error)
            throw error;

        return data;

    }

};
