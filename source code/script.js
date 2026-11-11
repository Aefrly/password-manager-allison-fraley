//FRONTEND LAYER
//selecting page elements from HTML 
const addWebsiteButton = document.getElementById("show-add-website-form");
const addWebsiteForm = document.getElementById("add-website-form");
const websiteNameInput = document.getElementById("website-name");
const websiteUrlInput = document.getElementById("website-url");
const websiteLinks = document.getElementById("website-links");
const websiteFormStatus = document.getElementById("website-form-status");
const credentialPrompts = document.getElementById("credential-prompts");

//display website link on the page
function renderWebsiteLink(website) {
    const websiteLink = document.createElement("a");
    websiteLink.className = "btn btn-primary m-1";
    websiteLink.href = website.url;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    websiteLink.textContent = `Open ${website.name}`;
    websiteLinks.append(websiteLink);
}

function renderCredentialPrompt(website) {
    const prompt = document.createElement("article");
    prompt.className = "credential-prompt card text-dark";

    const body = document.createElement("div");
    body.className = "card-body";

    const heading = document.createElement("h3");
    heading.className = "card-title h5";
    heading.textContent = `For "${website.name}", fill in this information`;

    const usernameLabel = document.createElement("label");
    usernameLabel.className = "form-label";
    usernameLabel.textContent = "Username/email";

    const usernameInput = document.createElement("input");
    usernameInput.className = "form-control mb-3";
    usernameInput.type = "text";
    usernameInput.autocomplete = "username";

    const passwordLabel = document.createElement("label");
    passwordLabel.className = "form-label";
    passwordLabel.textContent = "Password";

    const passwordInput = document.createElement("input");
    passwordInput.className = "form-control";
    passwordInput.type = "password";
    passwordInput.autocomplete = "current-password";

    body.append(heading, usernameLabel, usernameInput, passwordLabel, passwordInput);
    prompt.append(body);
    credentialPrompts.append(prompt);
}

//event listener for the add website button
addWebsiteButton.addEventListener("click", () => {
    addWebsiteForm.hidden = !addWebsiteForm.hidden;

    if (!addWebsiteForm.hidden) {
        websiteNameInput.focus();
    }
});

//event listener for the form submission
addWebsiteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!addWebsiteForm.reportValidity()) {
        return;
    }

    try {
        const website = await apiService.createWebsite({
            name: websiteNameInput.value,
            url: websiteUrlInput.value
        });
        renderWebsiteLink(website);
        renderCredentialPrompt(website);
        websiteFormStatus.textContent = `${website.name} was saved.`;
        addWebsiteForm.reset();
        addWebsiteForm.hidden = true;
    } catch (error) {
        websiteFormStatus.textContent = `Unable to save website: ${error.message}`;
    }
});

//fetch and display saved websites on page load
//saved websites are optional when the API is unavailable.
apiService.fetchWebsites()
    .then((websites) => websites.forEach(renderWebsiteLink))
    .catch(() => {});