/**
 * Servicio de usuarios
 * Encapsula la lógica de negocios relacionada con usuarios
 * Extraído de: portal/portal.js (lineas 42-76)
 */

import { supabase } from "../js/supabaseClient.js";
import { MESSAGES } from "../config/constants.js";

class UserService {
    
    /**
     * Obtiene el perfil completo del usuario
     * @param {string} userId - ID del usuario autenticado
     * @returns {Promise<Object|null>}
     */
    async getUserProfile(userId) {
        try {
            const { data: perfil, error } = await supabase
                .from("usuarios")
                .select(`
                    nombre,
                    apellido,
                    cargo,
                    empresas (
                        nombre_fantasia
                    )
                `)
                .eq("auth_user_id", userId)
                .single();
            
            if (error) {
                console.error("Error al obtener perfil:", error);
                return null;
            }
            
            return perfil;
        } catch (error) {
            console.error("Error en getUserProfile:", error);
            return null;
        }
    }
    
    /**
     * Formatea los datos del perfil para presentación
     * Extraído de: portal/portal.js (lineas 68-76)
     * @param {Object} perfil - Datos del perfil
     * @returns {Object} Datos formateados
     */
    formatProfileData(perfil) {
        if (!perfil) {
            return {
                name: MESSAGES.PROFILE_ERROR,
                role: MESSAGES.DEFAULT_ROLE,
                company: MESSAGES.DEFAULT_COMPANY
            };
        }
        
        return {
            name: `${perfil.nombre} ${perfil.apellido ?? ""}`.trim(),
            role: `${perfil.cargo ?? MESSAGES.DEFAULT_ROLE}`,
            company: `${perfil.empresas?.nombre_fantasia ?? MESSAGES.DEFAULT_COMPANY}`
        };
    }
    
    /**
     * Obtiene y formatea el perfil del usuario
     * @param {string} userId - ID del usuario autenticado
     * @returns {Promise<Object>}
     */
    async getFormattedProfile(userId) {
        const perfil = await this.getUserProfile(userId);
        return this.formatProfileData(perfil);
    }
}

export const userService = new UserService();
