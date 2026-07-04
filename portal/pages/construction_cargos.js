export function renderConstructionCargos() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Cargos</h1>

            <button class="btn-primary">
                Nuevo Cargo
            </button>

        </div>

        <div class="card">

            <p>
                Aquí irá el CRUD de Cargos y la asociación de Plantillas DOCX.
            </p>

        </div>

    `;

}
