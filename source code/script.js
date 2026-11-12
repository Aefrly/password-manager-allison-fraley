//FRONTEND LAYER
//selecting page elements from HTML 
const addWebsiteButton = document.getElementById("show-add-website-form");
const addWebsiteForm = document.getElementById("add-website-form");
const websiteNameInput = document.getElementById("website-name");
const websiteUrlInput = document.getElementById("website-url");
const websiteLinks = document.getElementById("website-links");
const websiteFormStatus = document.getElementById("website-form-status");
const credentialPrompts = document.getElementById("credential-prompts");
const savedCredentials = document.getElementById("saved-credentials");
const credentialListStatus = document.getElementById("credential-list-status");

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

//display credential card on the page
function renderCredentialCard(credential, websiteName) {
    if (
        !credential ||
        typeof credential.username !== "string" ||
        typeof credential.password !== "string" ||
        typeof websiteName !== "string"
    ) {
        throw new Error("Credential data is incomplete");
    }

    const card = document.createElement("article");
    card.className = "credential-card card text-dark";

    const body = document.createElement("div");
    body.className = "card-body";

    const heading = document.createElement("h3");
    heading.className = "card-title h5";
    heading.textContent = websiteName;

    const username = document.createElement("p");
    username.className = "card-text";
    username.textContent = `Username/email: ${credential.username}`;

    const passwordLabel = document.createElement("label");
    passwordLabel.className = "form-label";
    passwordLabel.textContent = "Password";

    const passwordInput = document.createElement("input");
    passwordInput.className = "form-control";
    passwordInput.type = "password";
    passwordInput.value = credential.password;
    passwordInput.readOnly = true;
    passwordLabel.append(passwordInput);

    const togglePasswordButton = document.createElement("button");
    togglePasswordButton.className = "btn btn-outline-secondary btn-sm mt-2";
    togglePasswordButton.type = "button";
    togglePasswordButton.textContent = "Show password";
    togglePasswordButton.addEventListener("click", () => {
        const shouldShowPassword = passwordInput.type === "password";
        passwordInput.type = shouldShowPassword ? "text" : "password";
        togglePasswordButton.textContent = shouldShowPassword ? "Hide password" : "Show password";
    });

    body.append(heading, username, passwordLabel, togglePasswordButton);
    card.append(body);
    savedCredentials.append(card);
}

//display credential prompt on the page
function renderCredentialPrompt(website) {
    const prompt = document.createElement("article");
    prompt.className = "credential-prompt card text-dark";

    const body = document.createElement("div");
    body.className = "card-body";

    const heading = document.createElement("h3");
    heading.className = "card-title h5";
    heading.textContent = `For "${website.name}", fill in this information`;

    const form = document.createElement("form");
    form.className = "credential-form";

    const usernameLabel = document.createElement("label");
    usernameLabel.className = "form-label";
    usernameLabel.textContent = "Username/email";

    const usernameInput = document.createElement("input");
    usernameInput.className = "form-control mb-3";
    usernameInput.type = "text";
    usernameInput.autocomplete = "username";
    usernameInput.required = true;
    usernameLabel.append(usernameInput);

    const passwordLabel = document.createElement("label");
    passwordLabel.className = "form-label";
    passwordLabel.textContent = "Password";

    const passwordInput = document.createElement("input");
    passwordInput.className = "form-control";
    passwordInput.type = "password";
    passwordInput.autocomplete = "current-password";
    passwordInput.required = true;
    passwordLabel.append(passwordInput);

    const saveButton = document.createElement("button");
    saveButton.className = "btn btn-success mt-3";
    saveButton.type = "submit";
    saveButton.textContent = "Save information";

    const status = document.createElement("p");
    status.className = "mt-3 mb-0";
    status.setAttribute("role", "status");

    form.append(usernameLabel, passwordLabel, saveButton, status);
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        saveButton.disabled = true;
        try {
            await apiService.createCredential({
                websiteId: website.id,
                username: usernameInput.value,
                password: passwordInput.value
            });
            renderCredentialCard({
                username: usernameInput.value,
                password: passwordInput.value
            }, website.name);
            prompt.remove();
        } catch (error) {
            status.textContent = `Unable to save information: ${error.message}`;
        } finally {
            saveButton.disabled = false;
        }
    });

    body.append(heading, form);
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

// Loads saved websites and credentials from the server and renders them on the page
async function loadSavedInformation() {
    let websites = [];
    try {
        websites = await apiService.fetchWebsites();
        websites.forEach(renderWebsiteLink);
    } catch (error) {
        websiteFormStatus.textContent = `Unable to load websites: ${error.message}`;
    }

    try {
        const credentials = await apiService.fetchCredentials();
        credentials.forEach((credential) => {
            const linkedWebsite = websites.find((website) =>
                String(website.id) === String(credential.websiteId)
            );
            const websiteName = credential.websiteName || (linkedWebsite && linkedWebsite.name);
            if (!websiteName) {
                throw new Error(`Unable to find the website for credential ${credential.id}.`);
            }
            renderCredentialCard(credential, websiteName);
        });
    } catch (error) {
        credentialListStatus.textContent = `Unable to load saved information: ${error.message}`;
    }
}

loadSavedInformation();