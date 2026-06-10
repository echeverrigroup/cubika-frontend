import { renderDashboard } from "./pages/dashboard.js";
import { renderRubros } from "./pages/rubros.js";

export function navigate(page) {

    const content =
        document.querySelector(".content");

    switch(page){

        case "rubros":
        renderRubros();
        break;

        default:
            content.innerHTML =
                renderDashboard();
    }
}
