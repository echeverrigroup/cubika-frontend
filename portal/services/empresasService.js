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


    async create(mandante) {

        const { data, error } =
            await supabase.rpc(
                "crear_mandante",
                {
                    p_datos: mandante
                }
            );
    
        if (error)
            throw error;
    
        return data;
    
    },
    
    
    async update(id, mandante) {
    
        const { data, error } =
            await supabase.rpc(
                "actualizar_mandante",
                {
                    p_mandante_id: id,
                    p_datos: mandante
                }
            );
    
        if (error)
            throw error;
    
        return data;
    
    },
    
    
    async cambiarEstado(id, estado) {
    
        const { data, error } =
            await supabase.rpc(
                "cambiar_estado_mandante",
                {
                    p_mandante_id: id,
                    p_estado: estado
                }
            );
    
        if (error)
            throw error;
    
        return data;
    
    },
    
    
    async actualizarLogo(id, logoPath) {
    
        const { data, error } =
            await supabase.rpc(
                "actualizar_logo_mandante",
                {
                    p_mandante_id: id,
                    p_logo_path: logoPath
                }
            );
    
        if (error)
            throw error;
    
        return data;
    
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
