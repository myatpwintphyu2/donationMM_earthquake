const GITHUB_USERNAME = "myatpwintphyu2";  // Replace with your GitHub username
const REPO_NAME = "donationMM_earthquake";  // Replace with your repo name
const FILE_PATH = "data.json";  // File where data will be stored
const TOKEN = "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";  // Replace with your GitHub token (DO NOT expose publicly)

async function getGitHubData() {
    try {
        let response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`);
        if (!response.ok) throw new Error("GitHub file not found!");

        let data = await response.json();
        let content = atob(data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        return []; // Return empty array if file doesn't exist
    }
}

async function updateGitHubData(newData) {
    let existingData = await getGitHubData();
    existingData.push(newData);

    let jsonData = JSON.stringify(existingData, null, 2);
    let encodedContent = btoa(jsonData);

    let response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: "PUT",
        headers: {
            "Authorization": `token ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "Updated data.json",
            content: encodedContent,
            sha: await getFileSHA()  // Get the latest file SHA
        })
    });

    if (response.ok) {
        console.log("✅ Data updated successfully!");
        fetchAndDisplayData(); // Refresh UI
    } else {
        console.error("❌ Error updating data:", await response.json());
    }
}

async function getFileSHA() {
    try {
        let response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`);
        let data = await response.json();
        return data.sha;
    } catch {
        return null;  // File might not exist yet
    }
}

async function submitData() {
    let text = document.getElementById("userText").value;
    let number = parseFloat(document.getElementById("userNumber").value);

    if (!text || isNaN(number)) {
        alert("Please enter valid data!");
        return;
    }

    let newEntry = { text, number };
    await updateGitHubData(newEntry);
}

async function fetchAndDisplayData() {
    let entries = await getGitHubData();
    
    let total = entries.reduce((sum, entry) => sum + entry.number, 0);
    document.getElementById("totalAmount").innerText = total;

    let entryList = document.getElementById("entryList");
    entryList.innerHTML = "";
    entries.forEach(entry => {
        let li = document.createElement("li");
        li.innerText = `${entry.text}: ${entry.number}`;
        entryList.appendChild(li);
    });
}

// Load data on page load
fetchAndDisplayData();
