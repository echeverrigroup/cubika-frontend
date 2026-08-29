/**
 * Configuraciones y constantes globales del portal
 */

export const ROUTES = {
    // Principal
    DASHBOARD: "dashboard",
    
    // Administración
    EMPRESAS: "empresas",
    SUCURSALES: "sucursales",
    USUARIOS: "usuarios",
    
    // Operaciones
    BODEGAS: "bodegas",
    UBICACIONES: "ubicaciones",
    PRODUCTOS: "productos",
    
    // Inventario
    STOCK: "stock",
    MOVIMIENTOS: "movimientos",
    
    // Construcción
    CONSTRUCTION_EMPRESAS: "construction_empresas",
    CONSTRUCTION_TRABAJADORES: "construction_trabajadores",
    CONSTRUCTION_OBRAS: "construction_obras",
    CONSTRUCTION_CARGOS: "construction_cargos",
    CONSTRUCTION_PLANTILLAS: "construction_plantillas",
    CONSTRUCTION_CONTRATOS: "construction_contratos",
    CONSTRUCTION_PLANTILLA_EDITOR: "construction_plantilla_editor",
    CONSTRUCTION_CONTRATO_EDITOR: "construction_contrato_editor",
    
    // Catálogos
    RUBROS: "rubros",
};

export const MENU_SECTIONS = [
    {
        title: null,
        items: [
            { label: "Dashboard", page: ROUTES.DASHBOARD }
        ]
    },
    {
        title: "Administración",
        items: [
            { label: "Empresas", page: ROUTES.EMPRESAS },
            { label: "Sucursales", page: ROUTES.SUCURSALES },
            { label: "Usuarios", page: ROUTES.USUARIOS }
        ]
    },
    {
        title: "Operaciones",
        items: [
            { label: "Bodegas", page: ROUTES.BODEGAS },
            { label: "Ubicaciones", page: ROUTES.UBICACIONES },
            { label: "Productos", page: ROUTES.PRODUCTOS }
        ]
    },
    {
        title: "Inventario",
        items: [
            { label: "Stock", page: ROUTES.STOCK },
            { label: "Movimientos", page: ROUTES.MOVIMIENTOS }
        ]
    },
    {
        title: "Construcción",
        items: [
            { label: "Empresas", page: ROUTES.CONSTRUCTION_EMPRESAS },
            { label: "Trabajadores", page: ROUTES.CONSTRUCTION_TRABAJADORES },
            { label: "Obras", page: ROUTES.CONSTRUCTION_OBRAS },
            { label: "Cargos", page: ROUTES.CONSTRUCTION_CARGOS },
            { label: "Plantillas", page: ROUTES.CONSTRUCTION_PLANTILLAS },
            { label: "Contratos", page: ROUTES.CONSTRUCTION_CONTRATOS }
        ]
    },
    {
        title: "Catálogos",
        items: [
            { label: "Rubros", page: ROUTES.RUBROS }
        ]
    }
];

export const AUTH_CONFIG = {
    REDIRECT_LOGIN: "/login.html",
    REDIRECT_PORTAL: "/portal/index.html"
};

export const MESSAGES = {
    LOGOUT_CONFIRMATION: {
        title: "Cerrar sesión",
        message: "¿Deseas abandonar la sesión actual de Cubika?"
    },
    PROFILE_ERROR: "Error de perfil",
    DEFAULT_ROLE: "Usuario ",
    DEFAULT_COMPANY: " "
};
