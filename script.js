/* =====================================================================
   script.js
   Dépend de : lang/fr.js, lang/en.js (à charger AVANT ce fichier)
   Ces fichiers remplissent window.I18N = { fr: {...}, en: {...} }
   ===================================================================== */

/* ============ 1. i18n : liaison HTML <-> fichiers de langue ============
   Attributs utilisés dans index.html :
     data-i18n="clé"       -> remplace le texte de l'élément
     data-i18n-html="clé"  -> remplace le HTML de l'élément (balises <b>, <span>…)
     data-i18n-alt="clé"   -> remplace l'attribut alt d'une image
   Pour ajouter une langue : créer lang/xx.js (mêmes clés), l'inclure dans
   index.html, et ajouter <span data-l="xx">XX</span> dans le sélecteur.
   ===================================================================== */
(function () {
  var I18N = window.I18N || {};
  var DEFAULT_LANG = "fr";
  var btn = document.getElementById("langSwitch");

  function available() { return Object.keys(I18N); }

  /* Cherche la clé dans la langue choisie, sinon dans la langue par défaut */
  function t(lang, key) {
    if (I18N[lang] && I18N[lang][key] !== undefined) return I18N[lang][key];
    if (I18N[DEFAULT_LANG] && I18N[DEFAULT_LANG][key] !== undefined) return I18N[DEFAULT_LANG][key];
    return null;
  }

  /* Salutation selon l'heure (7h–18h : jour, sinon : soir) */
  function greeting(lang) {
    var h = new Date().getHours();
    return t(lang, (h >= 7 && h < 18) ? "hero.hello" : "hero.evening");
  }

  function apply(lang) {
    if (!I18N[lang]) lang = DEFAULT_LANG;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(lang, el.getAttribute("data-i18n"));
      if (v !== null) el.textContent = v;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = t(lang, el.getAttribute("data-i18n-html"));
      if (v !== null) el.innerHTML = v.replace("{greeting}", greeting(lang));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var v = t(lang, el.getAttribute("data-i18n-alt"));
      if (v !== null) el.setAttribute("alt", v);
    });

    var title = t(lang, "meta.title");
    if (title) document.title = title;
    document.documentElement.lang = lang;

    if (btn) {
      btn.querySelectorAll("span").forEach(function (sp) {
        sp.classList.toggle("on", sp.getAttribute("data-l") === lang);
      });
    }
    try { localStorage.setItem("lang", lang); } catch (e) {}
    return lang;
  }

  var lang = DEFAULT_LANG;
  try { lang = localStorage.getItem("lang") || DEFAULT_LANG; } catch (e) {}
  lang = apply(lang);

  /* Clic sur le sélecteur : passe à la langue suivante de la liste */
  if (btn) {
    btn.addEventListener("click", function () {
      var list = available();
      lang = list[(list.indexOf(lang) + 1) % list.length];
      apply(lang);
    });
  }
})();

/* ============ 2. Hackathon : vidéo au survol + plein écran ============ */
(function () {
  try {
    var hg = document.getElementById("hackGrid");
    var hv = document.getElementById("hackVideo");
    if (!hg || !hv) return;

    hg.addEventListener("mouseenter", function () {
      hv.currentTime = 0;
      hv.play().catch(function () {});
    });

    hg.addEventListener("mouseleave", function () {
      if (document.fullscreenElement) return; // ne rien faire en plein écran
      hv.pause();
      hv.currentTime = 0;
    });

    hv.addEventListener("dblclick", function () {
      if (!document.fullscreenElement) { hv.requestFullscreen(); }
      else { document.exitFullscreen(); }
    });

    document.addEventListener("fullscreenchange", function () {
      if (document.fullscreenElement === hv) {
        hv.controls = true;
        hv.play().catch(function () {});
      } else {
        hv.controls = false;
        hv.pause();
        hv.currentTime = 0;
      }
    });
  } catch (e) {}
})();

/* ============ 3. Apparition des sections au défilement ============ */
(function () {
  try {
    var els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add("in"); });
    }
  } catch (e) {}
})();