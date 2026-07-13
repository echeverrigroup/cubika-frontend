import {
    navigate
}
from "../router.js";

import {
    nuevoContrato
}
from "./construction_contrato_editor.js";

import {

    renderConstructionContratoEditor

}
from "./pages/construction_contrato_editor.js";




export function renderConstructionContratos() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>

                Contratos

            </h1>

            <button
                id="btnGenerarContrato"
                class="btn-primary">

                Generar Contrato

            </button>

        </div>


        <div class="card">

            <h2>

                Asistente de Generación
                de Contratos

            </h2>

            <p>

                Genere contratos laborales
                utilizando trabajadores,
                empresas, obras, cargos y
                plantillas documentales.

            </p>

        </div>


        <div id="contratosTable">

        </div>

    `;


    document

        .getElementById(
            "btnGenerarContrato"
        )

        .addEventListener(

            "click",

            () => {

                nuevoContrato();

                navigate(
                    "construction_contrato_editor"
                );

            }

        );

}
