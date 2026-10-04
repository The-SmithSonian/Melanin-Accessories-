/* =====================================================
MELANIN ACCESSORIES - PUBLIC WEBSITE
Content (contact details, categories, about text) lives
in site-config.js. Products come from Supabase (only
products marked "Available" or "Sold" appear).
===================================================== */

(function () {

    "use strict";

    // Replace with your own project's values (Supabase ->
    // Project Settings -> API). Must match admin.js.
    const SUPABASE_URL = "https://ctyvzrijjubkiltcauwn.supabase.co";

    const SUPABASE_KEY = "sb_publishable_HrwdGjEHDWrcHLhd0Cn5OA_u-KNmSwY";

    const WISHLIST_KEY = "melaninWishlist";


    /* =================================
    SETTINGS + HELPERS
    ================================= */

    const cfg = Object.assign(
        {
            name: "Melanin Accessories",
            tagline: "Accessorize. Elevate. Stand out.",
            location: "Ibadan, Nigeria",
            phonePrimary: "2348158289001",
            phonePrimaryDisplay: "0815 828 9001",
            phoneSecondary: "2348034670546",
            phoneSecondaryDisplay: "0803 467 0546",
            whatsapp: "2348158289001",
            categories: [],
            aboutText: "",
            stats: [],
            testimonials: [],
            faq: []
        },
        typeof SITE !== "undefined" ? SITE : {}
    );

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function esc(value) {

        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return String(value === null || value === undefined ? "" : value)
            .replace(/[&<>"']/g, function (char) {
                return map[char];
            });

    }

    function formatPrice(value) {

        if (value === null || value === undefined || value === "") {
            return "Price on request";
        }

        return "\u20A6" + Number(value).toLocaleString("en-NG");

    }

    function whatsappLink(text) {

        return "https://wa.me/" + cfg.whatsapp +
            "?text=" + encodeURIComponent(text);

    }


    /* =================================
    SITE CONTENT (from site-config.js)
    ================================= */

    function bindSiteContent() {

        $$("[data-bind]").forEach(function (element) {

            const value = cfg[element.dataset.bind];

            if (value) element.textContent = value;

        });

        $$('[data-href="tel-primary"]').forEach(function (element) {
            element.href = "tel:+" + cfg.phonePrimary;
        });

        $$('[data-href="tel-secondary"]').forEach(function (element) {
            element.href = "tel:+" + cfg.phoneSecondary;
        });

        $$("[data-wa]").forEach(function (element) {

            element.href = whatsappLink(
                "Hello Melanin Accessories, I would like to make an enquiry."
            );

        });

        const year = $("#year");

        if (year) year.textContent = new Date().getFullYear();

    }


    /* =================================
    INTRO LOADER
    ================================= */

    function hideIntroLoader() {

        const loader = document.getElementById("introLoader");

        if (!loader) return;

        loader.classList.add("is-done");

        setTimeout(function () {

            if (loader.parentNode) loader.parentNode.removeChild(loader);

        }, 800);

    }


    /* =================================
    HEADER + MENU
    ================================= */

    const header = $("#siteHeader");
    const nav = $("#siteNav");
    const menuToggle = $("#menuToggle");

    function updateHeader() {

        header.classList.toggle("is-solid", window.scrollY > 40);

    }

    function setMenu(open) {

        nav.classList.toggle("is-open", open);

        header.classList.toggle("menu-open", open);

        menuToggle.setAttribute("aria-expanded", String(open));

        menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    }

    window.addEventListener("scroll", updateHeader, { passive: true });

    updateHeader();

    menuToggle.addEventListener("click", function () {
        setMenu(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {

        if (event.target.closest("a")) setMenu(false);

    });


    /* =================================
    SCROLL ANIMATION
    ================================= */

    const revealObserver = "IntersectionObserver" in window
        ? new IntersectionObserver(function (entries, observer) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("is-in");

                    observer.unobserve(entry.target);

                }

            });

        }, { threshold: 0.02, rootMargin: "0px" })
        : null;

    function watchReveals() {

        $$(".reveal:not(.is-in)").forEach(function (element) {

            if (revealObserver) {
                revealObserver.observe(element);
            } else {
                element.classList.add("is-in");
            }

        });

    }


    /* =================================
    HIGHLIGHTS (stats strip)
    ================================= */

    function renderStats() {

        const stats = cfg.stats || [];

        if (stats.length === 0) return;

        $("#statsGrid").innerHTML = stats.map(function (stat) {

            return `
                <div class="stat">
                    <span class="stat__value">${esc(stat.value)}</span>
                    <span class="stat__label">${esc(stat.label)}</span>
                </div>
            `;

        }).join("");

        $("#stats").hidden = false;

    }


    /* =================================
    TESTIMONIALS
    ================================= */

    function renderTestimonials() {

        const testimonials = cfg.testimonials || [];

        if (testimonials.length === 0) return;

        $("#testimonialList").innerHTML = testimonials.map(function (item) {

            return `
                <div class="testimonial reveal">
                    <p>&ldquo;${esc(item.quote)}&rdquo;</p>
                    <strong>${esc(item.name)}</strong>
                    ${item.detail ? `<span>${esc(item.detail)}</span>` : ""}
                </div>
            `;

        }).join("");

        $("#testimonials").hidden = false;

        const navItem = $('[data-section="testimonials"]');

        if (navItem) navItem.hidden = false;

    }


    /* =================================
    FAQ
    ================================= */

    function renderFAQ() {

        const faq = cfg.faq || [];

        if (faq.length === 0) return;

        $("#faqList").innerHTML = faq.map(function (item) {

            return `
                <details class="faq-item">
                    <summary>${esc(item.question)}</summary>
                    <p>${esc(item.answer)}</p>
                </details>
            `;

        }).join("");

        $("#faq").hidden = false;

        const navItem = $('[data-section="faq"]');

        if (navItem) navItem.hidden = false;

    }


    /* =================================
    WISHLIST (stored in this browser only)
    ================================= */

    let wishlist = [];

    function loadWishlist() {

        try {

            const raw = window.localStorage.getItem(WISHLIST_KEY);

            wishlist = raw ? JSON.parse(raw) : [];

        } catch (error) {

            wishlist = [];

        }

    }

    function saveWishlist() {

        try {

            window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));

        } catch (error) {

            console.error(error);

        }

    }

    function isWished(id) {

        return wishlist.some(function (item) { return item.id === id; });

    }

    function toggleWishlist(product) {

        if (isWished(product.id)) {

            wishlist = wishlist.filter(function (item) {
                return item.id !== product.id;
            });

        } else {

            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: (product.images || [])[0] || null
            });

        }

        saveWishlist();

        updateWishlistUI();

    }

    function updateWishlistUI() {

        const count = wishlist.length;

        [$("#wishlistCount"), $("#floatWishlistCount")].forEach(function (badge) {

            if (!badge) return;

            badge.textContent = count;

            badge.hidden = count === 0;

        });

        $$(".card__wish").forEach(function (button) {

            button.classList.toggle("is-active", isWished(button.dataset.id));

        });

        const modalWishBtn = $("[data-wish-toggle]", productPanel);

        if (modalWishBtn) {

            const wished = isWished(modalWishBtn.dataset.wishToggle);

            modalWishBtn.classList.toggle("is-active", wished);

            modalWishBtn.innerHTML = wished
                ? '<svg class="i" aria-hidden="true"><use href="#i-heart-fill"/></svg> In Wishlist'
                : '<svg class="i" aria-hidden="true"><use href="#i-heart"/></svg> Add to Wishlist';

        }

    }

    function renderWishlistPanel() {

        const container = $("#wishlistItems");

        if (wishlist.length === 0) {

            container.innerHTML = `
                <p class="wishlist__empty">
                    Your wishlist is empty. Tap the heart on any
                    product to add it here.
                </p>
            `;

            $("#wishlistForm").hidden = true;

            return;

        }

        $("#wishlistForm").hidden = false;

        container.innerHTML = wishlist.map(function (item) {

            const image = item.image
                ? `<img src="${esc(item.image)}" alt="${esc(item.name)}">`
                : `<img src="logo.png" alt="">`;

            return `
                <div class="wishlist-item">
                    ${image}
                    <div class="wishlist-item__info">
                        <strong>${esc(item.name)}</strong>
                        <span>${esc(formatPrice(item.price))}</span>
                    </div>
                    <button
                        class="wishlist-item__remove"
                        type="button"
                        data-remove="${esc(item.id)}"
                        aria-label="Remove ${esc(item.name)}"
                    >&times;</button>
                </div>
            `;

        }).join("");

    }

    $("#wishlistItems").addEventListener("click", function (event) {

        const button = event.target.closest("[data-remove]");

        if (!button) return;

        wishlist = wishlist.filter(function (item) {
            return item.id !== button.dataset.remove;
        });

        saveWishlist();

        updateWishlistUI();

        renderWishlistPanel();

    });

    $("#wishlistForm").addEventListener("submit", function (event) {

        event.preventDefault();

        const name = $("#wName").value.trim();

        const location = $("#wLocation").value.trim();

        if (!name || !location) return;

        const lines = [
            "Hello Melanin Accessories, I'd like to order from my wishlist.",
            "",
            "Name: " + name,
            "Location: " + location,
            "",
            "Items:"
        ];

        wishlist.forEach(function (item) {

            lines.push("- " + item.name + " (" + formatPrice(item.price) + ")");

        });

        const link = document.createElement("a");

        link.href = whatsappLink(lines.join("\n"));

        link.target = "_blank";

        link.rel = "noopener";

        link.click();

        $("#wishlistNote").textContent =
            "Opening WhatsApp with your wishlist. Just press send there.";

    });


    /* =================================
    PRODUCTS
    ================================= */

    let allProducts = [];

    let activeCategory = "All";

    let searchText = "";

    let sortMode = "newest";

    const grid = $("#productGrid");

    function showNotice(title, text) {

        const message =
            "Hello Melanin Accessories, I would like to know what's available.";

        grid.innerHTML = `
            <div class="notice">
                <h3>${esc(title)}</h3>
                <p>${esc(text)}</p>
                <div class="notice__actions">
                    <a class="btn btn--violet" href="${whatsappLink(message)}" target="_blank" rel="noopener">
                        Ask on WhatsApp
                    </a>
                </div>
            </div>
        `;

    }

    function cardHTML(product, index) {

        const images = Array.isArray(product.images) ? product.images : [];

        const hasImage = images.length > 0;

        const media = hasImage
            ? `<img src="${esc(images[0])}" alt="${esc(product.name)}" loading="lazy">`
            : `<img src="logo.png" alt="">`;

        const category = product.category
            ? `<span class="card__category">${esc(product.category)}</span>`
            : "";

        const sold = product.status === "sold"
            ? `<span class="card__sold">Sold</span>`
            : "";

        const wishBtn = product.status !== "sold"
            ? `
                <button
                    class="card__wish${isWished(product.id) ? " is-active" : ""}"
                    type="button"
                    data-id="${esc(product.id)}"
                    aria-label="Add to wishlist"
                >
                    <svg class="i" aria-hidden="true"><use href="#i-heart${isWished(product.id) ? "-fill" : ""}"/></svg>
                </button>
            `
            : "";

        return `
            <article
                class="card"
                tabindex="0"
                role="button"
                aria-label="View details: ${esc(product.name)}"
                data-id="${esc(product.id)}"
                style="--n: ${Math.min(index, 8)}"
            >
                <div class="card__media${hasImage ? "" : " card__media--empty"}">
                    ${media}
                    ${category}
                    ${sold}
                    ${wishBtn}
                </div>
                <div class="card__body">
                    <p class="card__price">${esc(formatPrice(product.price))}</p>
                    <h3 class="card__title">${esc(product.name)}</h3>
                </div>
            </article>
        `;

    }

    function visibleProducts() {

        const query = searchText.trim().toLowerCase();

        const list = allProducts.filter(function (product) {

            if (activeCategory !== "All" && product.category !== activeCategory) {
                return false;
            }

            if (!query) return true;

            return [product.name, product.category, product.description]
                .join(" ").toLowerCase().includes(query);

        });

        if (sortMode === "priceLow" || sortMode === "priceHigh") {

            const priceOf = function (p) {
                return p.price === null || p.price === undefined ? null : Number(p.price);
            };

            list.sort(function (a, b) {

                const priceA = priceOf(a);
                const priceB = priceOf(b);

                if (priceA === null && priceB === null) return 0;
                if (priceA === null) return 1;
                if (priceB === null) return -1;

                return sortMode === "priceLow" ? priceA - priceB : priceB - priceA;

            });

        }

        return list;

    }

    function renderProducts() {

        const list = visibleProducts();

        $("#resultCount").textContent =
            list.length === 1 ? "1 product" : list.length + " products";

        if (list.length === 0) {

            showNotice(
                "No matching products",
                "Try a different search or category, or ask us directly and we'll help you find the right piece."
            );

            return;

        }

        grid.innerHTML = list.map(cardHTML).join("");

    }

    function buildCategoryChips() {

        const found = [];

        allProducts.forEach(function (product) {

            if (product.category && !found.includes(product.category)) {
                found.push(product.category);
            }

        });

        const categories = (cfg.categories && cfg.categories.length)
            ? cfg.categories.filter(function (c) { return found.includes(c); })
            : found;

        const chips = $("#categoryChips");

        if (categories.length < 2) {

            chips.style.display = "none";

            return;

        }

        chips.innerHTML = ["All"].concat(categories).map(function (category) {

            return `
                <button class="chip" type="button" data-category="${esc(category)}" aria-pressed="${category === "All"}">
                    ${esc(category)}
                </button>
            `;

        }).join("");

    }

    async function loadProducts() {

        if (!window.supabase) {

            grid.setAttribute("aria-busy", "false");

            $("#resultCount").textContent = "";

            showNotice(
                "We could not load our products",
                "Please check your connection and refresh, or contact us and we will send you what's available."
            );

            return;

        }

        try {

            const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });

            const result = await db
                .from("products")
                .select("*")
                .in("status", ["available", "sold"])
                .order("created_at", { ascending: false });

            grid.setAttribute("aria-busy", "false");

            if (result.error) throw result.error;

            allProducts = result.data || [];

        } catch (error) {

            console.error(error);

            grid.setAttribute("aria-busy", "false");

            $("#resultCount").textContent = "";

            showNotice(
                "We could not load our products",
                "Please check your connection and refresh, or contact us and we will send you what's available."
            );

            return;

        }

        if (allProducts.length === 0) {

            $(".filters").style.display = "none";

            $("#resultCount").textContent = "";

            showNotice(
                "New pieces coming soon",
                "We are adding new products. Contact us to hear about what is available now."
            );

            return;

        }

        buildCategoryChips();

        renderProducts();

        ensureHero();

    }

    $("#categoryChips").addEventListener("click", function (event) {

        const button = event.target.closest(".chip");

        if (!button) return;

        activeCategory = button.dataset.category;

        $$(".chip").forEach(function (chip) {
            chip.setAttribute("aria-pressed", String(chip === button));
        });

        renderProducts();

    });

    let searchTimer = null;

    $("#searchInput").addEventListener("input", function (event) {

        const value = event.target.value;

        clearTimeout(searchTimer);

        searchTimer = setTimeout(function () {

            searchText = value;

            renderProducts();

        }, 200);

    });

    $("#sortSelect").addEventListener("change", function (event) {

        sortMode = event.target.value;

        renderProducts();

    });

    grid.addEventListener("click", function (event) {

        const wishButton = event.target.closest(".card__wish");

        if (wishButton) {

            event.stopPropagation();

            const product = allProducts.find(function (p) { return p.id === wishButton.dataset.id; });

            if (product) toggleWishlist(product);

            renderProducts();

            return;

        }

        const card = event.target.closest(".card");

        if (card) showProduct(card.dataset.id);

    });

    grid.addEventListener("keydown", function (event) {

        if (event.key !== "Enter" && event.key !== " ") return;

        const card = event.target.closest(".card");

        if (!card) return;

        event.preventDefault();

        showProduct(card.dataset.id);

    });


    /* =================================
    HERO PHOTO SLIDESHOW
    ================================= */

    const HERO_LOGO_TIME = 2200;
    const HERO_INTERVAL = 30000;
    const HERO_FADE = 1600;

    let heroPhotos = [];
    let heroIndex = 0;
    let heroTimer = null;
    let heroStarted = false;

    function loadImage(url) {

        return new Promise(function (resolve) {

            const image = new Image();

            image.onload = function () { resolve(true); };

            image.onerror = function () { resolve(false); };

            image.src = url;

        });

    }

    function setHeroImage(url) {

        const photo = $("#heroPhoto");

        photo.classList.remove("is-on");

        setTimeout(function () {

            photo.style.backgroundImage = 'url("' + url + '")';

            photo.classList.add("is-on");

        }, HERO_FADE);

    }

    function collectHeroPhotos() {

        const seen = [];

        const photos = [];

        allProducts.forEach(function (product) {

            const image = Array.isArray(product.images) ? product.images[0] : null;

            if (image && !seen.includes(image)) {

                seen.push(image);

                photos.push(image);

            }

        });

        return photos.slice(0, 10);

    }

    function advanceHero() {

        heroIndex = (heroIndex + 1) % heroPhotos.length;

        setHeroImage(heroPhotos[heroIndex]);

    }

    async function startHeroSlideshow() {

        if (heroStarted) return;

        heroPhotos = collectHeroPhotos();

        if (heroPhotos.length === 0) {

            const found = await loadImage("hero.jpg");

            if (found) setHeroImage("hero.jpg");

            return;

        }

        heroStarted = true;

        heroIndex = 0;

        setHeroImage(heroPhotos[0]);

        if (heroPhotos.length > 1) {

            heroTimer = setInterval(advanceHero, HERO_INTERVAL);

        }

    }

    function ensureHero() {

        setTimeout(startHeroSlideshow, HERO_LOGO_TIME);

    }


    /* =================================
    POP-UP WINDOWS
    ================================= */

    const productModal = $("#productModal");

    const productPanel = $("#productPanel");

    const wishlistModal = $("#wishlistModal");

    let openModalElement = null;

    let lastFocused = null;

    let gallery = { images: [], index: 0, name: "" };

    function openModal(modal) {

        lastFocused = document.activeElement;

        openModalElement = modal;

        modal.classList.add("is-open");

        document.body.classList.add("no-scroll");

        setTimeout(function () {

            const closeButton = $(".modal__close", modal) || $("input, button", modal);

            if (closeButton) closeButton.focus();

        }, 60);

    }

    function closeModal() {

        if (!openModalElement) return;

        openModalElement.classList.remove("is-open");

        document.body.classList.remove("no-scroll");

        openModalElement = null;

        if (lastFocused && lastFocused.focus) lastFocused.focus();

    }

    [productModal, wishlistModal].forEach(function (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target.closest("[data-close]")) closeModal();

        });

    });

    function openWishlistModal() {

        renderWishlistPanel();

        openModal(wishlistModal);

    }

    $("#wishlistToggle").addEventListener("click", openWishlistModal);

    $("#floatWishlistBtn").addEventListener("click", openWishlistModal);

    $("#heroWishlistBtn").addEventListener("click", openWishlistModal);

    function stepGallery(step) {

        const total = gallery.images.length;

        if (total < 2) return;

        gallery.index = (gallery.index + step + total) % total;

        updateGallery(true);

    }

    function updateGallery(animate) {

        const image = $("#galleryImage");

        if (!image) return;

        image.src = gallery.images[gallery.index];

        image.alt = gallery.name + " photo " + (gallery.index + 1);

        const count = $("#galleryCount");

        if (count) count.textContent = (gallery.index + 1) + " / " + gallery.images.length;

        $$(".gallery__thumb", productPanel).forEach(function (thumb, index) {

            if (index === gallery.index) {
                thumb.setAttribute("aria-current", "true");
                thumb.scrollIntoView({ block: "nearest", inline: "nearest" });
            } else {
                thumb.removeAttribute("aria-current");
            }

        });

    }

    function showProduct(id) {

        const product = allProducts.find(function (item) { return item.id === id; });

        if (!product) return;

        const images = Array.isArray(product.images) ? product.images.slice() : [];

        gallery = { images: images, index: 0, name: product.name };

        const stage = images.length
            ? `
                <img id="galleryImage" src="${esc(images[0])}" alt="${esc(product.name)} photo 1">
                ${images.length > 1 ? `
                    <button class="gallery__nav gallery__nav--prev" type="button" data-step="-1" aria-label="Previous photo">&#8249;</button>
                    <button class="gallery__nav gallery__nav--next" type="button" data-step="1" aria-label="Next photo">&#8250;</button>
                    <span class="gallery__count" id="galleryCount">1 / ${images.length}</span>
                ` : ""}
            `
            : `<div class="gallery__empty"><img src="logo.png" alt=""></div>`;

        const thumbs = images.length > 1
            ? `
                <div class="gallery__thumbs">
                    ${images.map(function (url, index) {
                        return `
                            <button class="gallery__thumb" type="button" data-thumb="${index}" aria-label="Show photo ${index + 1}" ${index === 0 ? 'aria-current="true"' : ""}>
                                <img src="${esc(url)}" alt="" loading="lazy">
                            </button>
                        `;
                    }).join("")}
                </div>
            `
            : "";

        const isSold = product.status === "sold";

        const enquireMessage = 'Hello Melanin Accessories, I am interested in "' +
            product.name + '" (' + formatPrice(product.price) + ').';

        const wishOrSoldBlock = isSold
            ? `<div class="modal__sold-note">This piece has been sold. Message us to ask about similar items.</div>`
            : `
                <button
                    class="btn btn--line"
                    type="button"
                    data-wish-toggle="${esc(product.id)}"
                >
                    <svg class="i" aria-hidden="true"><use href="#i-heart${isWished(product.id) ? "-fill" : ""}"/></svg>
                    ${isWished(product.id) ? "In Wishlist" : "Add to Wishlist"}
                </button>
            `;

        productPanel.innerHTML = `

            <button class="modal__close" type="button" data-close aria-label="Close">&times;</button>

            <div class="gallery">
                <div class="gallery__stage">${stage}</div>
                ${thumbs}
            </div>

            <div class="modal__info">

                ${product.category ? `<span class="modal__category">${esc(product.category)}</span>` : ""}

                <h3 class="modal__title">${esc(product.name)}</h3>

                <p class="modal__price">${esc(formatPrice(product.price))}</p>

                ${product.description ? `<p class="modal__desc">${esc(product.description)}</p>` : ""}

                <div class="modal__actions">

                    <a class="btn btn--violet" href="${whatsappLink(enquireMessage)}" target="_blank" rel="noopener">
                        <svg class="i" aria-hidden="true"><use href="#i-chat"/></svg>
                        Enquire on WhatsApp
                    </a>

                    ${wishOrSoldBlock}

                </div>

            </div>
        `;

        productPanel.scrollTop = 0;

        openModal(productModal);

        updateWishlistUI();

    }

    productPanel.addEventListener("click", function (event) {

        const step = event.target.closest("[data-step]");

        if (step) {
            stepGallery(Number(step.dataset.step));
            return;
        }

        const thumb = event.target.closest("[data-thumb]");

        if (thumb) {
            gallery.index = Number(thumb.dataset.thumb);
            updateGallery(true);
            return;
        }

        const wishToggle = event.target.closest("[data-wish-toggle]");

        if (wishToggle) {

            const product = allProducts.find(function (p) { return p.id === wishToggle.dataset.wishToggle; });

            if (product) {

                toggleWishlist(product);

                renderProducts();

            }

        }

    });

    let touchStartX = null;

    productPanel.addEventListener("touchstart", function (event) {

        touchStartX = event.target.closest(".gallery__stage") ? event.touches[0].clientX : null;

    }, { passive: true });

    productPanel.addEventListener("touchend", function (event) {

        if (touchStartX === null) return;

        const distance = event.changedTouches[0].clientX - touchStartX;

        if (Math.abs(distance) > 50) stepGallery(distance < 0 ? 1 : -1);

        touchStartX = null;

    });

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            setMenu(false);

            closeModal();

            return;

        }

        if (!openModalElement) return;

        if (openModalElement === productModal) {

            if (event.key === "ArrowLeft") stepGallery(-1);

            if (event.key === "ArrowRight") stepGallery(1);

        }

        if (event.key === "Tab") {

            const focusable = $$(
                'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
                openModalElement
            ).filter(function (element) {
                return element.getClientRects().length > 0;
            });

            if (focusable.length === 0) return;

            const first = focusable[0];

            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {

                event.preventDefault();

                last.focus();

            } else if (!event.shiftKey && document.activeElement === last) {

                event.preventDefault();

                first.focus();

            }

        }

    });


    /* =================================
    START
    ================================= */

    setTimeout(hideIntroLoader, 1900);

    loadWishlist();

    bindSiteContent();

    renderStats();

    renderTestimonials();

    renderFAQ();

    updateWishlistUI();

    watchReveals();

    loadProducts();

})();
