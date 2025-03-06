$(document).ready(function() {
    const apiUrl = 'https://urlAPIgateway'; // Ganti dengan URL API Gateway Anda
    let selectedGuestId = null; // Menyimpan ID tamu yang dipilih untuk diupdate

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, type) {
        const notification = $('#notification');
        notification.removeClass('hidden bg-green-500 bg-red-500');
        notification.addClass(type === 'success' ? 'bg-pink-500' : 'bg-red-500');
        notification.text(message);
        notification.removeClass('hidden');

        // Notifikasi akan hilang dalam 3 detik
        setTimeout(() => {
            notification.addClass('hidden');
        }, 3000);
    }

    // Fetch guests (READ - GET)
    function loadGuests() {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function(response) {
                console.log('Respons API:', response); // Debug: Lihat respons API di konsol

                // Parse `body` dari string JSON ke array objek
                const data = JSON.parse(response.body);

                // Urutkan data dari yang terbaru (berdasarkan ID atau timestamp)
                const sortedData = data.sort((a, b) => b.id - a.id);

                $('#guestList').empty();

                if (sortedData.length === 0) {
                    showNotification('Daftar tamu kosong.', 'warning');
                } else {
                    showNotification('Daftar tamu berhasil dimuat.', 'success');
                }

                sortedData.forEach((guest, index) => {
                    console.log('Tamu:', guest); // Debug: Lihat setiap tamu di konsol
                    $('#guestList').append(`
                        <tr>
                            <td class="p-2">${index + 1}</td>
                            <td class="p-2">${guest.nama}</td>
                            <td class="p-2">${guest.pesan}</td>
                            <td class="p-2">
                                <button class="bg-pink-300 text-white px-2 py-1 rounded-md hover:bg-pink-400 transition-transform transform hover:scale-105 font-secondary" onclick="editGuest('${guest.id}', '${guest.nama}', '${guest.pesan}')">Edit</button>
                                <button class="bg-red-300 text-white px-2 py-1 rounded-md hover:bg-red-400 transition-transform transform hover:scale-105 font-secondary" onclick="deleteGuest('${guest.id}')">Hapus</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function(xhr, status, error) {
                console.error('Error:', error); // Debug: Lihat error di konsol
                showNotification('Gagal memuat daftar tamu!', 'danger');
            }
        });
    }

    // Tambah/Edit tamu (CREATE/UPDATE - POST/PUT)
    $('#guestForm').submit(function(event) {
        event.preventDefault();
        const name = $('#name').val();
        const message = $('#message').val();
        const method = selectedGuestId ? 'PUT' : 'POST';
        const url = selectedGuestId ? `${apiUrl}/${selectedGuestId}` : apiUrl;

        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify({ nama: name, pesan: message }), // Sesuaikan dengan properti yang diharapkan API
            contentType: 'application/json',
            success: function() {
                $('#name').val('');
                $('#message').val('');
                selectedGuestId = null; // Reset selected guest
                loadGuests();

                if (method === 'POST') {
                    showNotification('Tamu berhasil ditambahkan!', 'success');
                } else {
                    showNotification('Tamu berhasil diperbarui!', 'success');
                }
            },
            error: function() {
                if (method === 'POST') {
                    showNotification('Gagal menambahkan tamu!', 'danger');
                } else {
                    showNotification('Gagal memperbarui tamu!', 'danger');
                }
            }
        });
    });

    // Edit guest (Memasukkan data ke form, bukan API call)
    window.editGuest = function(id, name, message) {
        selectedGuestId = id;
        $('#name').val(name);
        $('#message').val(message);
        showNotification('Edit mode: Silakan perbarui data tamu.', 'info');
    };

    // Hapus tamu (DELETE)
    window.deleteGuest = function(id) {
        $.ajax({
            url: `${apiUrl}/${id}`,
            method: 'DELETE',
            success: function() {
                loadGuests();
                showNotification('Tamu berhasil dihapus!', 'success');
            },
            error: function() {
                showNotification('Gagal menghapus tamu!', 'danger');
            }
        });
    };

    // Load daftar tamu saat halaman dimuat
    loadGuests();
});