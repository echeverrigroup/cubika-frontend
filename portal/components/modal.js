export function showConfirmModal({

    title,
    message,
    onConfirm

}) {

    const overlay =
        document.getElementById("modalOverlay");

    document.getElementById("modalTitle")
        .textContent = title;

    document.getElementById("modalMessage")
    .innerHTML = message;

    overlay.style.display = "flex";

    document.getElementById("modalCancel")
        .onclick = () => {

            overlay.style.display = "none";

        };

   document.getElementById("modalConfirm")
    .onclick = async () => {

        let ok = true;

        if (onConfirm) {

            ok = await onConfirm();

        }

        if (ok !== false) {

            overlay.style.display = "none";

        }

    };
}
