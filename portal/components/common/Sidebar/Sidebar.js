/**
 * Componente Sidebar
 * Maneja la presentación del menú lateral
 * Refactorización de: portal/portal.js (lineas 79-98)
 */

import { navigator } from "../../../core/navigator.js";

export class Sidebar {
    
    /**
     * Inicializa el sidebar
     */
    init() {
        this.setupMenuItems();
    }
    
    /**
     * Configura los items del menú
     */
    setupMenuItems() {
        const secciones = navigator.getMenuSections();
        
        // Aquí se pueden agregar validaciones de permisos si es necesario
        // Por ahora solo usa las secciones configuradas
    }
    
    /**
     * Activa un item del menú
     * @param {string} page - Página a activar
     */
    activateItem(page) {
        navigator.activateMenuItem(page);
    }
}

export const sidebar = new Sidebar();
