import { renderDashboard } from "./pages/dashboard.js";
import { renderRubros } from "./pages/rubros.js";
import {
    renderEmpresas
}
from "../portal/pages/empresas.js";



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

        default:
            content.innerHTML =
                renderDashboard();
    }
}
