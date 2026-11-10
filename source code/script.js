//FRONTEND LAYER
const addWebsiteButton = document.getElementById("show-add-website-form");
const addWebsiteForm = document.getElementById("add-website-form");
const websiteNameInput = document.getElementById("website-name");
const websiteUrlInput = document.getElementById("website-url");
const websiteLinks = document.getElementById("website-links");
const websiteFormStatus = document.getElementById("website-form-status");
const submitWebsiteButton = addWebsiteForm.querySelector('button[type="submit"]');

function renderWebsiteLink(website) {
    const websiteLink = document.createElement("a");
    websiteLink.className = "btn btn-primary m-1";
    websiteLink.href = website.url;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    websiteLink.textContent = `Open ${website.name}`;
    websiteLinks.append(websiteLink);
}

addWebsiteButton.addEventListener("click", () => {
    addWebsiteForm.hidden = !addWebsiteForm.hidden;
    addWebsiteButton.setAttribute("aria-expanded", String(!addWebsiteForm.hidden));

    if (!addWebsiteForm.hidden) {
        websiteNameInput.focus();
    }
});

addWebsiteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!addWebsiteForm.reportValidity()) {
        return;
    }

    websiteFormStatus.textContent = "Saving website...";
    submitWebsiteButton.disabled = true;

    try {
        const website = await apiService.createWebsite({
            name: websiteNameInput.value,
            url: websiteUrlInput.value
        });
        renderWebsiteLink(website);
        websiteFormStatus.textContent = `${website.name} was saved.`;
        addWebsiteForm.reset();
        addWebsiteForm.hidden = true;
        addWebsiteButton.setAttribute("aria-expanded", "false");
    } catch (error) {
        websiteFormStatus.textContent = `Unable to save website: ${error.message}`;
    } finally {
        submitWebsiteButton.disabled = false;
    }
});

apiService.fetchWebsites()
    .then((websites) => websites.forEach(renderWebsiteLink))
    .catch((error) => {
        websiteFormStatus.textContent = `Unable to load saved websites: ${error.message}`;
    });