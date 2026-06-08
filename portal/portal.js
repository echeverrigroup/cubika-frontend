import { requireAuth } from "./auth.js";

async function init() {

    const user = await requireAuth();

    if (!user) return;

    const userLabel =
        document.getElementById("usuario-logueado");

    userLabel.textContent = user.email;
}

init();
