let db;

// IndexedDB 초기화
function openDb() {
    const request = indexedDB.open("ImageDatabase", 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadImages(); // DB 열기 후 이미지 로드
    };

    request.onerror = function(event) {
        console.error("Database error:", event.target.errorCode);
    };
}

// 이미지와 메모 저장
function saveImage(imageData, dateTime, note) {
    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");
    const request = store.add({ imageSrc: imageData, time: dateTime, note: note });

    request.onsuccess = function() {
        console.log("Image saved successfully.");
    };

    request.onerror = function(event) {
        console.error("Error saving image:", event.target.errorCode);
    };
}

// 이미지와 메모 로드
function loadImages() {
    const transaction = db.transaction(["images"], "readonly");
    const store = transaction.objectStore("images");
    const request = store.getAll();

    request.onsuccess = function(event) {
        const images = event.target.result;
        const photoList = document.getElementById('photo-list');
        photoList.innerHTML = ""; // 기존 이미지 목록 초기화
        images.forEach(image => {
            const listItem = document.createElement('li');
            const img = document.createElement('img');
            img.src = image.imageSrc;
            img.alt = 'Medication Photo';
            listItem.appendChild(img);

            const timeInfo = document.createElement('span');
            timeInfo.className = 'time-info';

            // ISO 문자열을 Date 객체로 변환 후 포맷팅
            const date = new Date(image.time);
            timeInfo.textContent = `Taken on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
            listItem.appendChild(timeInfo);

            const note = document.createElement('p');
            note.textContent = `Note: ${image.note}`;
            listItem.appendChild(note);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this photo?')) {
                    deleteImage(image.id); // 이미지 삭제 함수 호출
                }
            });
            listItem.appendChild(deleteBtn);

            photoList.appendChild(listItem);
        });
    };

    request.onerror = function(event) {
        console.error("Error loading images:", event.target.errorCode);
    };
}

// 이미지 삭제
function deleteImage(id) {
    const transaction = db.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");
    const request = store.delete(id);

    request.onsuccess = function() {
        console.log("Image deleted successfully.");
        loadImages(); // 이미지 삭제 후 목록 갱신
    };

    request.onerror = function(event) {
        console.error("Error deleting image:", event.target.errorCode);
    };
}

// 파일 선택 및 EXIF 데이터 처리
function handleFileSelect(file) {
    if (file.size > 1024 * 1024 * 5) { // 파일 크기가 5MB를 초과할 경우
        alert("File size exceeds 5MB. Please upload a smaller file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newData = e.target.result;
        
        // 현재 시간으로 설정
        const currentDateTime = new Date().toISOString();
        const note = document.getElementById('note').value; // 메모 가져오기
        saveImage(newData, currentDateTime, note); // IndexedDB에 이미지 저장
        loadImages(); // 저장 후 이미지 목록 갱신
    };

    reader.onerror = function(event) {
        console.error("Error reading file:", event.target.errorCode);
    };

    reader.readAsDataURL(file);
}

// 페이지 로드 시 DB 열기
window.onload = function() {
    openDb();
};

// 폼 제출 시 이미지 처리
document.getElementById('med-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('med-photo');
    const file = fileInput.files[0];

    if (file) {
        handleFileSelect(file);
    } else {
        alert("No file selected.");
    }

    fileInput.value = ''; // 폼 리셋
});
