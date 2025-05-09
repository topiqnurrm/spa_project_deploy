import { registerSW as registerVitePWA } from "virtual:pwa-register";
import Swal from "sweetalert2";

export const registerSW = () => {
  const updateSW = registerVitePWA({
    onNeedRefresh() {
      Swal.fire({
        title: "Update tersedia!",
        text: "Aplikasi telah diperbarui. Refresh untuk melihat versi terbaru.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#2563EB",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Refresh",
        cancelButtonText: "Nanti",
      }).then((result) => {
        if (result.isConfirmed) {
          updateSW();
        }
      });
    },
    onOfflineReady() {
      Swal.fire({
        title: "Aplikasi siap offline!",
        text: "Anda dapat menggunakan aplikasi ini tanpa koneksi internet.",
        icon: "success",
        confirmButtonColor: "#2563EB",
        confirmButtonText: "OK",
      });
    },
  });
};
