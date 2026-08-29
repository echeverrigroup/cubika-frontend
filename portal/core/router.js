/**
 * Router mejorado
 * Maneja el enrutamiento de páginas de forma más modular y escalable
 * Reemplazo mejorado de: portal/router.js
 */

import { ROUTES } from "../config/constants.js";

// Importa los renders de páginas
import { renderDashboard } from "../pages/dashboard.js";
import { renderRubros } from "../pages/rubros.js";
import { renderEmpresas } from "../pages/empresas.js";
import { renderConstructionEmpresas } from "../pages/construction_empresas.js";
import { renderConstructionTrabajadores } from "../pages/construction_trabajadores.js";
import { renderConstructionObras } from "../pages/construction_obras.js";
import { renderConstructionCargos } from "../pages/construction_cargos.js";
import { renderConstructionContratos } from "../pages/construction_contratos.js";
import { renderConstructionPlantillas } from "../pages/construction_plantillas.js";
import { renderConstructionPlantillaEditor } from "../pages/construction_plantilla_editor.js";
import { renderConstructionContratoEditor } from "../pages/construction_contrato_editor.js";

/**
 * Mapa de rutas disponibles
 * Facilita agregar nuevas rutas de forma escalable
 */
const routeMap = {
    [ROUTES.DASHBOARD]: renderDashboard,
    [ROUTES.RUBROS]: renderRubros,
    [ROUTES.EMPRESAS]: renderEmpresas,
    [ROUTES.CONSTRUCTION_EMPRESAS]: renderConstructionEmpresas,
    [ROUTES.CONSTRUCTION_TRABAJADORES]: renderConstructionTrabajadores,
    [ROUTES.CONSTRUCTION_OBRAS]: renderConstructionObras,
    [ROUTES.CONSTRUCTION_CARGOS]: renderConstructionCargos,
    [ROUTES.CONSTRUCTION_CONTRATOS]: renderConstructionContratos,
    [ROUTES.CONSTRUCTION_PLANTILLAS]: renderConstructionPlantillas,
    [ROUTES.CONSTRUCTION_PLANTILLA_EDITOR]: renderConstructionPlantillaEditor,
    [ROUTES.CONSTRUCTION_CONTRATO_EDITOR]: renderConstructionContratoEditor,
};

class Router {
    
    constructor() {
        this.currentRoute = null;
        this.contentElement = null;
    }
    
    /**
     * Inicializa el router
     * @param {string} contentSelector - Selector del elemento donde renderizar
     */
    init(contentSelector = ".content") {
        this.contentElement = document.querySelector(contentSelector);
        
        if (!this.contentElement) {
            console.error(`Elemento ${contentSelector} no encontrado`);
        }
    }
    
    /**
     * Navega a una página
     * @param {string} page - Identificador de la página
     * @param {Object} params - Parámetros opcionales
     */
    navigate(page, params = null) {
        if (!this.contentElement) {
            console.error("Router no ha sido inicializado");
            return;
        }
        
        this.currentRoute = page;
        const renderFunction = routeMap[page] || routeMap[ROUTES.DASHBOARD];
        
        try {
            renderFunction(params);
        } catch (error) {
            console.error(`Error al renderizar página ${page}:`, error);
        }
    }
    
    /**
     * Obtiene la ruta actual
     * @returns {string}
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    /**
     * Verifica si una ruta existe
     * @param {string} page - Identificador de la página
     * @returns {boolean}
     */
    isRouteValid(page) {
        return page in routeMap;
    }
    
    /**
     * Obtiene todas las rutas disponibles
     * @returns {Array}
     */
    getAvailableRoutes() {
        return Object.keys(routeMap);
    }
    
    /**
     * Registra una nueva ruta (útil para módulos dinámicos)
     * @param {string} routeName - Nombre de la ruta
     * @param {Function} renderFunction - Función de renderizado
     */
    registerRoute(routeName, renderFunction) {
        if (typeof renderFunction !== "function") {
            console.error("La función de renderizado debe ser una función");
            return;
        }
        
        routeMap[routeName] = renderFunction;
    }
}

export const router = new Router();

/**
 * Función helper para navegar (compatibilidad con código existente)
 * @param {string} page - Página a navegar
 * @param {Object} params - Parámetros
 */
export function navigate(page, params = null) {
    router.navigate(page, params);
}
