document.addEventListener("DOMContentLoaded", function () {
    const thumbnailsContainer = document.getElementById("thumbnails");
    const form = document.querySelector('form');


    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);

        fetch('/', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.error || 'Network response was not ok');
                    });
                }
                return response.text();
            })
            .then(() => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`An error occurred while uploading the images: ${error.message}`);
            });
    });



    // 既存のコード（画像リストの取得）はそのまま
    fetch('/images')
        .then(response => response.json())
        .then(images => {
            // ... (既存のコード)
        })
        .catch(error => console.error('Error loading images:', error));
});