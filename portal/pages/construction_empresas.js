export function renderConstructionEmpresas() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Empresas</h1>

            <button class="btn-primary">
                Nueva Empresa
            </button>

        </div>

        <div class="card">

            <p>
                Aquí irá el CRUD de Empresas para Construcción.
            </p>

        </div>

    `;

}
