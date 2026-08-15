import { supabase } from "../../js/supabaseClient.js";

const TABLE = "contratos_generados";

export const contratosGeneradosService = {

    async getAll() {

    const { data, error } =
        await supabase
            .from(TABLE)
            .select(`
                *,

                worker:workers(
                    id,
                    rut,
                    nombres,
                    apellido_paterno,
                    apellido_materno
                ),

                empresa:empresas_construccion(
                    id,
                    nombre
                ),

                obra:obras(
                    id,
                    nombre,

                    constructora:constructoras(
                        id,
                        nombre
                    )
                ),

                cargo:cargos(
                    id,
                    nombre
                ),

                plantilla:plantillas_documento(
                    id,
                    nombre
                ),

                tipo_contrato:tipos_contrato(
                    id,
                    nombre
                )
            `)
            .order(
                "fecha_generacion",
                {
                    ascending: false
                }
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
                    worker:workers(id,nombres,apellido_paterno,apellido_materno),
                    empresa:empresas_construccion(id,nombre),
                    obra:obras(id,nombre),
                    cargo:cargos(id,nombre),
                    plantilla:plantillas_documento(id,nombre),
                    tipo_contrato:tipos_contrato(id,nombre)
                `)
                .eq("id", id)
                .single();

        if (error) throw error;

        return data;

    },


    async create(contrato) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .insert(contrato)
                .select()
                .single();

        if (error) throw error;

        return data;

    },


    async update(id, contrato) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(contrato)
                .eq("id", id)
                .select()
                .single();

        if (error) throw error;

        return data;

    },


    async delete(id) {

        const { error } =
            await supabase
                .from(TABLE)
                .delete()
                .eq("id", id);

        if (error) throw error;

        return true;

    }

};
