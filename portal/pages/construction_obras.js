export function renderConstructionObras() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Obras</h1>

            <button class="btn-primary">
                Nueva Obra
            </button>

        </div>

        <div class="card">

            <p>
                Aquí irá el CRUD de Obras.
            </p>

        </div>

    `;

}
