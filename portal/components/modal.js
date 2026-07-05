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



export function closeModal() {

    const {

        overlay,
        body,
        confirm

    } = getModalElements();


    overlay.style.display =
        "none";


    body.innerHTML = "";


    confirm.disabled =
        false;

    confirm.textContent =
        "Confirmar";

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


    cancel.onclick =
        closeModal;


    confirm.onclick =
        async () => {

            let ok = true;

            if (currentOnConfirm) {

                ok =
                    await currentOnConfirm();

            }

            if (ok !== false) {

                closeModal();

            }

        };

}


export function showFormModal({

    title,
    content,
    onSubmit,
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

    confirm.textContent =
        submitText;

    overlay.style.display =
        "flex";


    cancel.onclick =
        closeModal;


    confirm.onclick =
        async () => {

            let ok = true;

            if (onSubmit) {

                ok =
                    await onSubmit();

            }

            if (ok !== false) {

                closeModal();

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
