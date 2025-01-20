function submitResume() {
    const fileInput = document.getElementById("resume-upload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload a resume.");
        return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        displayFeedback(data);
    })
    .catch(error => {
        console.error("Error uploading resume:", error);
        alert("There was an error processing the resume.");
    });
}

function displayFeedback(feedback) {
    const feedbackContent = document.getElementById("feedback-content");
    feedbackContent.innerHTML = '';

    feedback.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('feedback-item');
        div.innerHTML = `<span>${item.type}:</span> ${item.message}`;
        feedbackContent.appendChild(div);
    });

    document.getElementById("feedback").style.display = 'block';
}
