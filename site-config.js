/* =====================================================
MELANIN ACCESSORIES - SITE CONTENT
Edit this file to change contact details, categories,
and the about text. No other file needs to change.
===================================================== */

const SITE = {

    name: "Melanin Accessories",

    tagline: "Accessorize. Elevate. Stand out.",

    location: "Ibadan, Nigeria",

    // Digits only, with the country code (used for call and WhatsApp links)
    phonePrimary: "2348158289001",
    phonePrimaryDisplay: "0815 828 9001",

    phoneSecondary: "2348034670546",
    phoneSecondaryDisplay: "0803 467 0546",

    // WhatsApp enquiries and the wishlist checkout both go to this number
    whatsapp: "2348158289001",

    instagram: "",


    /* -------------------------------------------------
    PRODUCT CATEGORIES
    Shown as filter chips on the shop section. Keep this
    in sync with the category options in the admin form.
    ------------------------------------------------- */

    categories: [
        "Necklaces",
        "Bracelets",
        "Earrings",
        "Rings",
        "Anklets",
        "Sets",
        "Accessories"
    ],


    /* -------------------------------------------------
    ABOUT TEXT
    ------------------------------------------------- */

    aboutText: "Melanin Accessories is a Nigerian accessories brand based in " +
        "Ibadan, curating pieces that let you accessorize, elevate, and stand " +
        "out. Every piece is chosen with the same care, whether it is a " +
        "statement necklace or an everyday bracelet.",


    /* -------------------------------------------------
    HIGHLIGHTS (the numbers under the hero section)
    While this list is empty, the section is hidden.

    { value: "500+", label: "Pieces sold" },
    ------------------------------------------------- */

    stats: [],


    /* -------------------------------------------------
    TESTIMONIALS
    While this list is empty, the section is hidden.

    {
        quote: "What the customer said about their piece.",
        name: "Customer name",
        detail: "Lagos"     // optional: their city, etc.
    },
    ------------------------------------------------- */

    testimonials: [],


    /* -------------------------------------------------
    FREQUENTLY ASKED QUESTIONS
    Edit the answers below to match your real policies on
    delivery, payment and returns.
    ------------------------------------------------- */

    faq: [

        {
            question: "How do I place an order?",
            answer: "Add the pieces you like to your wishlist, then send it to us on WhatsApp with your name and location. We'll confirm availability and arrange payment and delivery with you directly."
        },
        {
            question: "Do you deliver outside Ibadan?",
            answer: "Message us with your location and we'll let you know delivery options and cost for your area."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We'll share our payment details once you reach out on WhatsApp to confirm your order."
        },
        {
            question: "Are your pieces authentic and true to the photos?",
            answer: "Yes. Photos are of the actual pieces we stock. If a specific piece sells out, we'll let you know before confirming your order."
        }

    ]

};
