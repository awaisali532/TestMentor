import Swal from "sweetalert2";

export const showConfirmAlert = ({
  title,
  text,
  confirmButtonText,
  confirmColor = "#ef4444",
}) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: "#334155",
    confirmButtonText: confirmButtonText,
    background: "#0f172a", // Dark background
    color: "#ffffff",
    customClass: {
      popup: "rounded-xl border border-slate-700 shadow-2xl",
    },
  });
};
