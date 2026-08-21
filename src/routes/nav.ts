import express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    brand: { label: "Planify", href: "/" },
    items: [
      { label: 'Services', href: '/services' },
        { label: 'Schedule', href: '/schedule' },
        { label: 'About', href: '/about' },
    ],
    cta: { label: "Login", href: "/login" },
  });
});

router.get("/pages/:slug", (req, res) => {
  const { slug } = req.params as { slug: string };
  res.json({
    slug,
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
  });
});

module.exports = router;

