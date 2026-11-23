import {
    marcarCambiosPendientes,
    hayCambiosPendientes,
    limpiarCambiosPendientes
} from "../services/unsavedChangesGuard.js";


let currentOnConfirm = null;



function getModalElements() {

    return {

        overlay:
            document.getElementById("modalOverlay"),

        modal:
            document.querySelector(".modal"),

        title:
            document.getElementById("modalTitle"),

        body:
            document.getElementById("modalBody"),

        cancel:
            document.getElementById("modalCancel"),

        confirm:
            document.getElementById("modalConfirm")

    };

}


let estadoInicialModal = null;

function obtenerEstadoFormulario() {

    const body = document.getElementById("modalBody");

    if (!body) return "";

    const controles = body.querySelectorAll(
        "input, select, textarea, [contenteditable='true']"
    );

    return JSON.stringify(
        Array.from(controles).map(control => {

            if (control.type === "checkbox" || control.type === "radio") {
                return {
                    type: control.type,
                    checked: control.checked
                };
            }

            if (control.type === "file") {
                return {
                    type: "file",
                    files: Array.from(control.files || []).map(file => ({
                        name: file.name,
                        size: file.size,
                        lastModified: file.lastModified
                    }))
                };
            }

            if (control.tagName === "SELECT" && control.multiple) {
                return {
                    type: "select-multiple",
                    values: Array.from(control.selectedOptions).map(option => option.value)
                };
            }

            if (control.isContentEditable) {
                return {
                    type: "contenteditable",
                    value: control.innerHTML
                };
            }

            return {
                type: control.type || control.tagName,
                value: control.value
            };

        })
    );
}


function actualizarEstadoModal() {

    if (estadoInicialModal === null) return;

    const estadoActual =
        obtenerEstadoFormulario();

    marcarCambiosPendientes(
        "modal",
        estadoActual !== estadoInicialModal
    );
}


function observarCambiosModal() {

    const body =
        document.getElementById("modalBody");

    if (!body) return;

    estadoInicialModal =
        obtenerEstadoFormulario();

    limpiarCambiosPendientes("modal");

    body.addEventListener(
        "input",
        actualizarEstadoModal
    );

    body.addEventListener(
        "change",
        actualizarEstadoModal
    );
}



export async function closeModal() {

    if (hayCambiosPendientes("modal")) {

        const confirmar = window.confirm(
            "Tienes cambios sin guardar en este formulario.\n\n" +
            "¿Deseas cerrar y perder la información ingresada?"
        );

        if (!confirmar) return false;

    }

    cerrarModalForzado();

    return true;
}


function cerrarModalForzado() {

    const {
        overlay,
        body,
        confirm
    } = getModalElements();

    overlay.style.display = "none";

    body.innerHTML = "";

    confirm.disabled = false;
    confirm.textContent = "Confirmar";

    estadoInicialModal = null;

    limpiarCambiosPendientes("modal");
}

export function showConfirmModal({

    title,
    message,
    onConfirm,
    size = "normal"

}) {

    const {

        overlay,
        modal,
        title: modalTitle,
        body,
        cancel,
        confirm

    } = getModalElements();

    estadoInicialModal = null;
    limpiarCambiosPendientes("modal");


    currentOnConfirm =
        onConfirm ?? null;


    modal.classList.remove(
        "large"
    );

    if (size === "large") {

        modal.classList.add(
            "large"
        );

    }


    modalTitle.textContent =
        title;
    

    body.innerHTML = `

            <p>
        
                ${message}
        
            </p>
        
        `;

    
    overlay.style.display =
        "flex";


    cancel.onclick = () => {
        cerrarModalForzado();
    };


    confirm.onclick =
        async () => {

            let ok = true;

            if (currentOnConfirm) {

                ok =
                    await currentOnConfirm();

            }

            if (ok !== false) {

                cerrarModalForzado();

            }

        };

}



export function showResultModal({

    title,
    message,
    primaryText = "Continuar",
    onPrimary = null

}) {

    const {

        overlay,
        modal,
        title: modalTitle,
        body,
        cancel,
        confirm

    } = getModalElements();


    estadoInicialModal = null;
    limpiarCambiosPendientes("modal");


    modal.classList.remove(
        "large"
    );


    modalTitle.textContent =
        title;


    body.innerHTML = `

        <div
            style="
                text-align:center;
                line-height:1.6;
            "
        >

            ${message}

        </div>

    `;


    confirm.textContent =
        primaryText;


    overlay.style.display =
        "flex";


    cancel.onclick = () => {
        cerrarModalForzado();
    };


    confirm.onclick =
        async () => {

            if (onPrimary) {

                await onPrimary();

            }

        };

}




export function showFormModal({

    title,
    content,
    onSubmit,
    onSuccess = null,
    submitText = "Guardar",
    size = "normal"

}) {

    const {

        overlay,
        modal,
        title: modalTitle,
        body,
        cancel,
        confirm

    } = getModalElements();


    modal.classList.remove(
        "large"
    );

    if (size === "large") {

        modal.classList.add(
            "large"
        );

    }


    modalTitle.textContent =
        title;

    body.innerHTML =
        content;

    observarCambiosModal();

    setModalError("");

    confirm.textContent =
        submitText;

    overlay.style.display =
        "flex";


    cancel.onclick = () => {
        closeModal();
    };


    confirm.onclick =
        async () => {

            let result = true;

            if (onSubmit) {

                result =
                    await onSubmit();
                
            }

            if (result !== false) {

                 cerrarModalForzado();
            
                if (onSuccess) {
            
                    await onSuccess(result);
            
                }
            
            }

        };

}


export function setModalLoading(
    loading = true,
    text = "Guardando..."
) {

    const {

        confirm

    } = getModalElements();

    if (!confirm)
        return;


    confirm.disabled =
        loading;


    if (loading) {

        confirm.dataset.originalText =
            confirm.textContent;

        confirm.textContent =
            text;

    }

    else {

        confirm.textContent =
            confirm.dataset.originalText ||
            "Confirmar";

    }

}



export function setModalError(message = "") {

    let errorBox =
        document.getElementById("modalFormError");

    if (!errorBox)
        return;

    errorBox.textContent =
        message;

    errorBox.style.display =
        message
            ? "block"
            : "none";

}


