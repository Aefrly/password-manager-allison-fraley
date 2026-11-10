//FRONTEND LAYER

const addWebsiteButton = document.getElementById("show-add-website-form");
const addWebsiteForm = document.getElementById("add-website-form");
const websiteNameInput = document.getElementById("website-name");
const websiteUrlInput = document.getElementById("website-url");
const websiteLinks = document.getElementById("website-links");
const websiteFormStatus = document.getElementById("website-form-status");

addWebsiteButton.addEventListener("click", () => {
    addWebsiteForm.hidden = !addWebsiteForm.hidden;
    addWebsiteButton.setAttribute("aria-expanded", String(!addWebsiteForm.hidden));

    if (!addWebsiteForm.hidden) {
        websiteNameInput.focus();
    }
});

websiteNameInput.addEventListener("input", () => {
    websiteNameInput.setCustomValidity("");
});

websiteUrlInput.addEventListener("input", () => {
    websiteUrlInput.setCustomValidity("");
});

addWebsiteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const websiteName = websiteNameInput.value.trim();
    if (!websiteName) {
        websiteNameInput.setCustomValidity("Enter a website name.");
        websiteNameInput.reportValidity();
        return;
    }

    let websiteUrl;
    try {
        websiteUrl = new URL(websiteUrlInput.value.trim());
    } catch {
        websiteUrlInput.setCustomValidity("Enter a valid website URL beginning with http:// or https://.");
        websiteUrlInput.reportValidity();
        return;
    }

    if (websiteUrl.protocol !== "http:" && websiteUrl.protocol !== "https:") {
        websiteUrlInput.setCustomValidity("Enter a website URL beginning with http:// or https://.");
        websiteUrlInput.reportValidity();
        return;
    }

    const websiteLink = document.createElement("a");
    websiteLink.className = "btn btn-primary m-1";
    websiteLink.href = websiteUrl.href;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    websiteLink.textContent = `Open ${websiteName}`;
    websiteLinks.append(websiteLink);

    websiteFormStatus.textContent = `${websiteName} was added.`;
    addWebsiteForm.reset();
    addWebsiteForm.hidden = true;
    addWebsiteButton.setAttribute("aria-expanded", "false");
});