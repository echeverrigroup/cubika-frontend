
import { supabase } from "../../js/supabaseClient.js";

import {
    obtenerTenantIdActual
} from "../tenantContextService.js";


export const empresasService = {

    // ========================================================
    // OBTENER TENANT ACTUAL
    // ========================================================

    obtenerClienteId() {

        const clienteId = obtenerTenantIdActual();

        if (clienteId == null) {
            throw new Error(
                "No se pudo determinar la empresa activa."
            );
        }

        return clienteId;
    },


    // ========================================================
    // CONSULTAR TODOS
    // ========================================================

    async getAll() {

        const clienteId = this.obtenerClienteId();

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
                .eq("cliente_id", clienteId)
                .order("nombre");

        if (error) {
            console.error(error);
            return [];
        }

        return data;
    },


    // ========================================================
    // CONSULTAR POR ID
    // ========================================================

    async getById(id) {

        const clienteId = this.obtenerClienteId();

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
                .eq("cliente_id", clienteId)
                .single();

        if (error) {
            console.error(error);
            return null;
        }

        return data;
    },


    // ========================================================
    // CREAR
    // ========================================================

    async create(mandante) {

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase.rpc(
                "crear_mandante",
                {
                    p_datos: mandante,
                    p_cliente_id: clienteId
                }
            );

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // ACTUALIZAR
    // ========================================================

    async update(id, mandante) {

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase.rpc(
                "actualizar_mandante",
                {
                    p_mandante_id: id,
                    p_datos: mandante,
                    p_cliente_id: clienteId
                }
            );

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // CAMBIAR ESTADO
    // ========================================================

    async cambiarEstado(id, estado) {

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase.rpc(
                "cambiar_estado_mandante",
                {
                    p_mandante_id: id,
                    p_estado: estado,
                    p_cliente_id: clienteId
                }
            );

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // ACTUALIZAR LOGO
    // ========================================================

    async actualizarLogo(id, logoPath) {

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase.rpc(
                "actualizar_logo_mandante",
                {
                    p_mandante_id: id,
                    p_logo_path: logoPath,
                    p_cliente_id: clienteId
                }
            );

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // ELIMINAR
    // ========================================================

    async delete(id) {

        const clienteId = this.obtenerClienteId();

        const { error } =
            await supabase
                .from("empresas_construccion")
                .delete()
                .eq("id", id)
                .eq("cliente_id", clienteId);

        if (error)
            throw error;

    }

};
