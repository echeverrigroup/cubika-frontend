let currentOnConfirm = null;



function getModalElements() {

    return {

        overlay:
            document.getElementById("modalOverlay"),

        modal:
            document.querySelector(".modal"),

        title:
            document.getElementById("modalTitle"),

        message:
            document.getElementById("modalMessage"),

        cancel:
            document.getElementById("modalCancel"),

        confirm:
            document.getElementById("modalConfirm")

    };

}



export function closeModal() {

    const { overlay } =
        getModalElements();

    overlay.style.display = "none";

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
        message: modalMessage,
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

    modalMessage.innerHTML =
        message;

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



export function setModalLoading(loading = true) {

    const { confirm } =
        getModalElements();

    if (!confirm) return;

    confirm.disabled =
        loading;

}



export function setModalError(message = "") {

    console.error(message);

}
