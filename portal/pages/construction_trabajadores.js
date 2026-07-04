export function renderConstructionTrabajadores() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Trabajadores</h1>

            <button class="btn-primary">
                Nuevo Trabajador
            </button>

        </div>

        <div class="card">

            <p>
                Aquí irá el CRUD de Trabajadores.
            </p>

        </div>

    `;

}
