// login page scripts - Mode PIN Rahasia
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  validatePin();
});

function validatePin() {
  var pinInput = document.getElementById("pinInput").value;

  // PIN rahasia yang kamu minta: 200408
  if (pinInput === "200408") {
    Swal.fire({
      icon: "success",
      title: "PIN Benar! 🎉",
      text: "Selamat datang ayanggg, selamat ulang tahun!",
      showConfirmButton: false,
      timer: 2000,
    }).then(function () {
      // Ini akan mengarahkan ke halaman utama ultahnya
      window.location.href = "birthday.html";
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "PIN Salah! ❌",
      text: "Coba inget-inget lagi tanggal rahasia kita...",
      confirmButtonText: "Coba lagi",
      confirmButtonColor: "#ff7675",
    });
    // Kosongkan input kalau salah
    document.getElementById("pinInput").value = "";
  }
}