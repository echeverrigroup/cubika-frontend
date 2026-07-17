import { supabase } from "../../js/supabaseClient.js";

export const empresasService = {

    async getAll() {

        const { data, error } =
            await supabase
                .from("empresas_construccion")
                .select(`
        
                    *,
        
                    region:
                        regiones!empresas_region_fkey(
                            id,
                            nombre
                        ),
        
                    comuna:
                        comunas!empresas_comuna_fkey(
                            id,
                            nombre
                        ),
        
                    region_representante:
                        regiones!empresas_rep_region_fkey(
                            id,
                            nombre
                        ),
        
                    comuna_representante:
                        comunas!empresas_rep_comuna_fkey(
                            id,
                            nombre
                        )
        
                `)
    
                .order("nombre");

        if (error) {

            console.error(error);

            return [];

        }

        return data;

    },


    async getById(id) {

        const { data, error } =
        await supabase

        .from("empresas_construccion")

        .select(`

            *,

            region:
                regiones!empresas_region_fkey(
                    id,
                    nombre
                ),

            comuna:
                comunas!empresas_comuna_fkey(
                    id,
                    nombre
                ),

            region_representante:
                regiones!empresas_rep_region_fkey(
                    id,
                    nombre
                ),

            comuna_representante:
                comunas!empresas_rep_comuna_fkey(
                    id,
                    nombre
                )

        `)

        .eq("id", id)

        .single();

        if (error) {

            console.error(error);

            return null;

        }

        return data;

    },


    async create(empresa) {

        const { error } =
            await supabase
                .from("empresas_construccion")
                .insert(empresa);

        if (error)
            throw error;

    },


    async update(id, empresa) {

        const { error } =
            await supabase
                .from("empresas_construccion")
                .update(empresa)
                .eq("id", id);

        if (error)
            throw error;

    },


    async delete(id) {

        const { error } =
            await supabase
                .from("empresas_construccion")
                .delete()
                .eq("id", id);

        if (error)
            throw error;

    }

};
