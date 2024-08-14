document.getElementById('med-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('med-photo');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const listItem = document.createElement('li');
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Medication Photo';

            const date = new Date();
            const timeInfo = document.createElement('span');
            timeInfo.className = 'time-info';
            timeInfo.textContent = `Taken on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;

            listItem.appendChild(img);
            listItem.appendChild(timeInfo);
            document.getElementById('photo-list').appendChild(listItem);

            // 이후 Firebase나 서버로 이미지를 업로드할 수 있습니다.
        };
        reader.readAsDataURL(file);
    }

    fileInput.value = ''; // 폼 리셋
});
