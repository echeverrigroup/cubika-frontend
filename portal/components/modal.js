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
        .textContent = message;

    overlay.style.display = "flex";

    document.getElementById("modalCancel")
        .onclick = () => {

            overlay.style.display = "none";

        };

    document.getElementById("modalConfirm")
        .onclick = () => {

            overlay.style.display = "none";

            if (onConfirm)
                onConfirm();

        };
}
