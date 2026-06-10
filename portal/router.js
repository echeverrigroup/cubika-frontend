import { renderDashboard } from "./pages/dashboard.js";
import { renderRubros } from "./pages/rubros.js";

export function navigate(page) {

    const content =
        document.querySelector(".content");

    switch(page){

        case "rubros":
            content.innerHTML =
                renderRubros();
            break;

        default:
            content.innerHTML =
                renderDashboard();
    }
}
