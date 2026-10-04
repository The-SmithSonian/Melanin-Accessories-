/* =================================
SUPABASE SETUP

Replace these two values with your own project's
Project URL and publishable (anon) key, from
Supabase: Project Settings -> API.
================================= */

const SUPABASE_URL = "https://ctyvzrijjubkiltcauwn.supabase.co";

const SUPABASE_KEY = "sb_publishable_HrwdGjEHDWrcHLhd0Cn5OA_u-KNmSwY";

const IMAGE_BUCKET = "product-images";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* =================================
HELPERS
================================= */

function escapeHTML(value) {

    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(/[&<>"']/g, function (char) {
        return map[char];
    });

}


/* =================================
ADMIN LOGIN (login.html)
================================= */

const loginForm = document.querySelector("#loginForm");

if (loginForm) {

    const loginMessage = document.querySelector("#loginMessage");

    sb.auth.getSession().then(function (result) {

        if (result.data.session) {
            window.location.replace("dashboard.html");
        }

    });

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.querySelector("#email").value.trim();

        const password =
            document.querySelector("#password").value;

        const loginButton =
            loginForm.querySelector("button[type='submit']");

        if (email === "" || password === "") {

            loginMessage.textContent =
                "Please enter your email and password.";

            return;

        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
        loginMessage.textContent = "";

        const result = await sb.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (result.error) {

            console.error(result.error);

            loginMessage.textContent =
                result.error.message === "Invalid login credentials"
                    ? "Incorrect email or password."
                    : "Login failed: " + result.error.message;

            loginButton.disabled = false;
            loginButton.textContent = "Login";

            return;

        }

        window.location.href = "dashboard.html";

    });

}


/* =================================
DASHBOARD (dashboard.html)
================================= */

const addProductBtn =
    document.querySelector("#addProductBtn");

const productFormContainer =
    document.querySelector("#productFormContainer");

const closeFormBtn =
    document.querySelector("#closeFormBtn");

const productForm =
    document.querySelector("#productForm");

const productList =
    document.querySelector("#productList");

const saveDraftBtn =
    document.querySelector("#saveDraftBtn");

const markSoldBtn =
    document.querySelector("#markSoldBtn");

const logoutBtn =
    document.querySelector("#logoutBtn");

const productImages =
    document.querySelector("#productImages");

const imagePreview =
    document.querySelector("#imagePreview");


// State

let products = [];

// null = adding a new product, otherwise the id being edited
let editingId = null;

// Image links already saved with the product being edited
let existingImages = [];

// New image files chosen but not uploaded yet
let newImageFiles = [];

let isSaving = false;

function getStatus(product) {
    return product.status || "draft";
}


/* ---------- Guard + startup ---------- */

async function initDashboard() {

    const result = await sb.auth.getSession();

    if (!result.data.session) {

        window.location.replace("login.html");

        return;

    }

    document.body.classList.remove("checking");

    await loadProducts();

}

if (productList) {

    sb.auth.onAuthStateChange(function (event, session) {

        if (!session) {
            window.location.replace("login.html");
        }

    });

    initDashboard();

}


/* ---------- Logout ---------- */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        await sb.auth.signOut();

        window.location.replace("login.html");

    });

}


/* ---------- Open / close the form ---------- */

function openForm(isEditing) {

    productFormContainer.style.display = "block";

    const heading =
        productFormContainer.querySelector(".form-header h2");

    if (heading) {

        heading.textContent =
            isEditing ? "Edit Product" : "Add New Product";

    }

    productFormContainer.scrollIntoView({
        behavior: "smooth"
    });

}

function closeForm() {

    productFormContainer.style.display = "none";

    productForm.reset();

    editingId = null;

    existingImages = [];

    newImageFiles = [];

    renderImagePreview();

}

if (addProductBtn && productFormContainer && closeFormBtn) {

    addProductBtn.addEventListener("click", function () {

        editingId = null;

        existingImages = [];

        newImageFiles = [];

        productForm.reset();

        renderImagePreview();

        openForm(false);

    });

    closeFormBtn.addEventListener("click", closeForm);

}


/* ---------- Load from database ---------- */

async function loadProducts() {

    productList.innerHTML =
        '<p class="loading-text">Loading products...</p>';

    const result = await sb
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (result.error) {

        console.error(result.error);

        productList.innerHTML =
            '<p class="loading-text">Could not load products. Please refresh the page.</p>';

        return;

    }

    products = result.data || [];

    displayProducts();

}


/* ---------- Stats ---------- */

function updateStats() {

    const total = products.length;

    const available = products.filter(function (p) {
        return getStatus(p) === "available";
    }).length;

    const sold = products.filter(function (p) {
        return getStatus(p) === "sold";
    }).length;

    const drafts = total - available - sold;

    document.querySelector("#totalProducts").textContent = total;

    document.querySelector("#availableProducts").textContent = available;

    document.querySelector("#soldProducts").textContent = sold;

    document.querySelector("#draftProducts").textContent = drafts;

}


/* ---------- Image previews ---------- */

function makePreviewItem(src, onRemove) {

    const item = document.createElement("div");

    item.className = "preview-item";

    const image = document.createElement("img");

    image.src = src;

    image.alt = "Product image preview";

    const removeBtn = document.createElement("button");

    removeBtn.type = "button";

    removeBtn.className = "preview-remove";

    removeBtn.textContent = "×";

    removeBtn.setAttribute("aria-label", "Remove image");

    removeBtn.addEventListener("click", onRemove);

    item.appendChild(image);

    item.appendChild(removeBtn);

    return item;

}

function renderImagePreview() {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    existingImages.forEach(function (url, index) {

        imagePreview.appendChild(
            makePreviewItem(url, function () {

                existingImages.splice(index, 1);

                renderImagePreview();

            })
        );

    });

    newImageFiles.forEach(function (file, index) {

        imagePreview.appendChild(
            makePreviewItem(URL.createObjectURL(file), function () {

                newImageFiles.splice(index, 1);

                renderImagePreview();

            })
        );

    });

}

let imageStatus = null;

function handleImageSelection() {

    if (!imageStatus) {

        imageStatus = document.createElement("small");

        imagePreview.parentNode.insertBefore(imageStatus, imagePreview);

    }

    const files = Array.from(productImages.files || []);

    if (files.length === 0) return;

    let added = 0;

    files.forEach(function (file) {

        if (file.size === 0) return;

        newImageFiles.push(file);

        added++;

    });

    productImages.value = "";

    imageStatus.textContent =
        added > 0
            ? added + " photo(s) added."
            : "That photo could not be read. Try a photo saved on your phone.";

    renderImagePreview();

}

if (productImages) {

    productImages.addEventListener("change", handleImageSelection);

    productImages.addEventListener("input", handleImageSelection);

}


/* ---------- Image storage ---------- */

function compressImage(file) {

    return new Promise(function (resolve) {

        if (!file.type.startsWith("image/") || file.size < 350000) {

            resolve(file);

            return;

        }

        const image = new Image();

        const objectUrl = URL.createObjectURL(file);

        image.onload = function () {

            URL.revokeObjectURL(objectUrl);

            const maxSide = 1600;

            const scale = Math.min(
                1,
                maxSide / Math.max(image.width, image.height)
            );

            const canvas = document.createElement("canvas");

            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);

            const ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(function (blob) {

                if (!blob || blob.size >= file.size) {

                    resolve(file);

                    return;

                }

                resolve(new File(
                    [blob],
                    file.name.replace(/\.\w+$/, ".jpg"),
                    { type: "image/jpeg" }
                ));

            }, "image/jpeg", 0.82);

        };

        image.onerror = function () {

            URL.revokeObjectURL(objectUrl);

            resolve(file);

        };

        image.src = objectUrl;

    });

}

async function uploadImages(files) {

    const urls = [];

    for (const original of files) {

        const file = await compressImage(original);

        const cleanName =
            file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const path =
            Date.now() + "-" +
            Math.random().toString(36).slice(2, 8) + "-" +
            cleanName;

        const result = await sb.storage
            .from(IMAGE_BUCKET)
            .upload(path, file, {
                contentType: file.type || "image/jpeg",
                cacheControl: "3600"
            });

        if (result.error) throw result.error;

        const publicUrl = sb.storage
            .from(IMAGE_BUCKET)
            .getPublicUrl(path).data.publicUrl;

        urls.push(publicUrl);

    }

    return urls;

}

async function deleteImageFiles(urls) {

    const marker = "/" + IMAGE_BUCKET + "/";

    const paths = urls.map(function (url) {

        const position = url.indexOf(marker);

        if (position === -1) return null;

        return decodeURIComponent(
            url.slice(position + marker.length)
        );

    }).filter(Boolean);

    if (paths.length === 0) return;

    const result = await sb.storage
        .from(IMAGE_BUCKET)
        .remove(paths);

    if (result.error) console.error(result.error);

}


/* ---------- Save a product ---------- */

const publishBtn =
    productForm ? productForm.querySelector(".primary-btn") : null;

function setSaving(saving) {

    isSaving = saving;

    saveDraftBtn.disabled = saving;

    markSoldBtn.disabled = saving;

    publishBtn.disabled = saving;

    publishBtn.textContent =
        saving ? "Saving..." : "Publish as Available";

}

async function saveProductFromForm(status) {

    if (isSaving) return;

    const name =
        document.querySelector("#productName").value.trim();

    const category =
        document.querySelector("#productCategory").value;

    const price =
        document.querySelector("#productPrice").value;

    const description =
        document.querySelector("#productDescription").value.trim();

    if (name === "") {

        alert("Please enter a product name.");

        return;

    }

    setSaving(true);

    try {

        const newUrls = await uploadImages(newImageFiles);

        const productData = {
            name: name,
            category: category || null,
            price: price === "" ? null : Number(price),
            description: description || null,
            status: status,
            images: existingImages.concat(newUrls)
        };

        let result;

        if (editingId) {

            result = await sb
                .from("products")
                .update(productData)
                .eq("id", editingId);

        } else {

            result = await sb
                .from("products")
                .insert(productData);

        }

        if (result.error) throw result.error;

        if (editingId) {

            const original = products.find(function (p) {
                return p.id === editingId;
            });

            if (original) {

                const removed = (original.images || []).filter(function (url) {
                    return !existingImages.includes(url);
                });

                await deleteImageFiles(removed);

            }

        }

        closeForm();

        await loadProducts();

        const messages = {
            draft: "Draft saved!",
            available: "Product published!",
            sold: "Marked as sold!"
        };

        alert(messages[status] || "Saved!");

    } catch (error) {

        console.error(error);

        alert("Could not save the product. Please try again.");

    } finally {

        setSaving(false);

    }

}

if (productForm && productList) {

    productForm.addEventListener("submit", function (event) {

        event.preventDefault();

        saveProductFromForm("available");

    });

    saveDraftBtn.addEventListener("click", function () {

        const name =
            document.querySelector("#productName").value.trim();

        if (name === "") {

            alert("Please enter a product name to save a draft.");

            return;

        }

        saveProductFromForm("draft");

    });

    markSoldBtn.addEventListener("click", function () {

        const name =
            document.querySelector("#productName").value.trim();

        if (name === "") {

            alert("Please enter a product name first.");

            return;

        }

        saveProductFromForm("sold");

    });

}


/* ---------- Display products ---------- */

function displayProducts() {

    updateStats();

    productList.innerHTML = "";

    if (products.length === 0) {

        productList.innerHTML = `
            <div class="empty-state">
                <h3>No Products Yet</h3>
                <p>
                    Click "Add Product" to create
                    your first listing.
                </p>
            </div>
        `;

        return;

    }

    products.forEach(function (product, cardIndex) {

        const productCard = document.createElement("div");

        productCard.className = "product-card";

        productCard.style.setProperty("--i", cardIndex);

        const status = getStatus(product);

        const statusLabels = {
            draft: "Draft",
            available: "Available",
            sold: "Sold"
        };

        const images = (product.images || []).map(function (url) {

            return `
                <img
                    src="${escapeHTML(url)}"
                    alt="${escapeHTML(product.name)}"
                >
            `;

        }).join("");

        productCard.innerHTML = `

            <div class="product-images">
                ${images}
            </div>

            <h2>${escapeHTML(product.name)}</h2>

            <p>
                <strong>Status:</strong>
                <span class="status-badge status-${status}">
                    ${statusLabels[status] || status}
                </span>
            </p>

            <p>
                <strong>Category:</strong>
                ${escapeHTML(product.category || "-")}
            </p>

            <p>
                <strong>Price:</strong>
                ${product.price !== null && product.price !== undefined
                    ? "₦" + Number(product.price).toLocaleString()
                    : "-"}
            </p>

            <p>
                <strong>Description:</strong>
                ${escapeHTML(product.description || "-")}
            </p>

            <div class="product-actions">

                <button onclick="editProduct('${product.id}')">
                    Edit
                </button>

                <button onclick="deleteProduct('${product.id}')">
                    Delete
                </button>

            </div>

        `;

        productList.appendChild(productCard);

    });

}


/* ---------- Edit ---------- */

function editProduct(id) {

    const product = products.find(function (item) {
        return item.id === id;
    });

    if (!product) return;

    document.querySelector("#productName").value =
        product.name || "";

    document.querySelector("#productCategory").value =
        product.category || "";

    document.querySelector("#productPrice").value =
        product.price ?? "";

    document.querySelector("#productDescription").value =
        product.description || "";

    editingId = id;

    existingImages = (product.images || []).slice();

    newImageFiles = [];

    renderImagePreview();

    openForm(true);

}


/* ---------- Delete ---------- */

async function deleteProduct(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    const product = products.find(function (item) {
        return item.id === id;
    });

    if (editingId !== null) closeForm();

    const result = await sb
        .from("products")
        .delete()
        .eq("id", id);

    if (result.error) {

        console.error(result.error);

        alert("Could not delete the product. Please try again.");

        return;

    }

    if (product) {
        await deleteImageFiles(product.images || []);
    }

    await loadProducts();

}
