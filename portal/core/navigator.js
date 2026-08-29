/**
 * Navegador
 * Encapsula la lógica de navegación del sidebar y cambio de páginas
 * Extraído de: portal/portal.js (lineas 79-98)
 */

import { ROUTES, MENU_SECTIONS } from "../config/constants.js";

class Navigator {
    
    constructor() {
        this.currentPage = null;
        this.onNavigate = null;
    }
    
    /**
     * Inicializa los event listeners del menú
     * @param {Function} navigateCallback - Callback al navegar
     */
    initMenuListeners(navigateCallback) {
        this.onNavigate = navigateCallback;
        
        document
            .querySelectorAll("[data-page]")
            .forEach(item => {
                item.addEventListener("click", (e) => {
                    this.selectMenuItem(item);
                    const page = item.dataset.page;
                    this.navigateTo(page);
                });
            });
    }
    
    /**
     * Marca un elemento del menú como activo
     * @param {HTMLElement} item - Elemento del menú
     */
    selectMenuItem(item) {
        // Remueve la clase active de todos
        document
            .querySelectorAll("[data-page]")
            .forEach(i => i.classList.remove("active"));
        
        // Agrega active al seleccionado
        item.classList.add("active");
    }
    
    /**
     * Navega a una página específica
     * @param {string} page - Identificador de la página
     * @param {Object} params - Parámetros opcionales
     */
    navigateTo(page, params = null) {
        this.currentPage = page;
        
        if (this.onNavigate) {
            this.onNavigate(page, params);
        }
    }
    
    /**
     * Activa un elemento del menú por su página
     * @param {string} page - Identificador de la página
     */
    activateMenuItem(page) {
        const menuItem = document.querySelector(`[data-page="${page}"]`);
        
        if (menuItem) {
            this.selectMenuItem(menuItem);
        }
    }
    
    /**
     * Obtiene todas las secciones del menú
     * @returns {Array}
     */
    getMenuSections() {
        return MENU_SECTIONS;
    }
    
    /**
     * Obtiene las rutas disponibles
     * @returns {Object}
     */
    getRoutes() {
        return ROUTES;
    }
}

export const navigator = new Navigator();
