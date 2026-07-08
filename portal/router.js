import { renderDashboard } from "./pages/dashboard.js";
import { renderRubros } from "./pages/rubros.js";
import {
    renderEmpresas
}
from "../portal/pages/empresas.js";
import { renderConstructionEmpresas } from "./pages/construction_empresas.js";
import { renderConstructionTrabajadores } from "./pages/construction_trabajadores.js";
import { renderConstructionObras } from "./pages/construction_obras.js";
import { renderConstructionCargos } from "./pages/construction_cargos.js";
import { renderConstructionContratos } from "./pages/construction_contratos.js";
import { renderConstructionPlantillas } from "./pages/construction_plantillas.js";
import {
    renderConstructionPlantillaEditor
}
from "./pages/construction_plantilla_editor.js";



export function navigate(page) {

    const content =
        document.querySelector(".content");

    switch(page){

        case "rubros":
        renderRubros();
        break;

        case "empresas":
        renderEmpresas();
        break;

        case "construction_empresas":
        renderConstructionEmpresas();
        break;
    
        case "construction_trabajadores":
        renderConstructionTrabajadores();
        break;
    
        case "construction_obras":
        renderConstructionObras();
        break;
    
        case "construction_cargos":
        renderConstructionCargos();
        break;

        case "construction_plantillas":
        renderConstructionPlantillas();
        break;

        case "construction_plantilla_editor":
        renderConstructionPlantillaEditor();
        break;
    
        case "construction_contratos":
        renderConstructionContratos();
        break;

        default:
            content.innerHTML =
                renderDashboard();
    }
}
