document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const uploadedImage = document.getElementById('uploadedImage');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});