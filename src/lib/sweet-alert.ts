"use client";

type AlertKind = "success" | "error" | "info" | "warning";

export async function showSweetAlert(title: string, text = "", icon: AlertKind = "info") {
  const Swal = (await import("sweetalert2")).default;
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "Oldu",
    confirmButtonColor: "#6d28d9",
    customClass: {
      popup: "rounded-xl",
      confirmButton: "rounded-lg",
    },
  });
}

export async function showSweetToast(title: string, icon: AlertKind = "success") {
  const Swal = (await import("sweetalert2")).default;
  return Swal.fire({
    title,
    icon,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
}
