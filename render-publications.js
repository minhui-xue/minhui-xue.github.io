(() => {
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderPublicationLi(publication) {
    const title = escapeHtml(publication.title);
    const authors = escapeHtml(publication.authors);
    const venue = escapeHtml(publication.venue);
    const year = Number(publication.year);
    const notesText = publication.notes ? String(publication.notes) : "";
    const hasNotes = Boolean(notesText);
    const isAward = hasNotes && notesText.toLowerCase().includes("award");
    const badge = isAward ? ` <span class="pub-note pub-note-award">${escapeHtml(notesText)}</span>` : "";

    return (
      `<li>` +
      `<strong>${title}</strong>${badge}<br />` +
      `${authors}<br />` +
      `<em>${venue}</em>, ${year}.` +
      `</li>`
    );
  }

  function normalizePublications(publications) {
    if (!Array.isArray(publications)) return [];
    return publications.filter(
      (p) =>
        p &&
        typeof p.title === "string" &&
        typeof p.authors === "string" &&
        typeof p.venue === "string" &&
        Number.isFinite(Number(p.year))
    );
  }

  function applyFilters(publications, dataset) {
    let filtered = publications;

    const includeTitles = (dataset.includeTitles || "")
      .split("|")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const includeTitleSet = new Set(includeTitles);

    const venueNeedles = (dataset.venues || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (!venueNeedles.length && !includeTitleSet.size) return filtered;

    if (venueNeedles.length || includeTitleSet.size) {
      filtered = filtered.filter((p) => {
        const title = String(p.title).toLowerCase();
        if (includeTitleSet.has(title)) return true;

        if (!venueNeedles.length) return false;
        const venue = String(p.venue).toLowerCase();
        return venueNeedles.some((needle) => venue.includes(needle));
      });
    }

    return filtered;
  }


  function renderIntoList(listEl, publications, limit) {
    const pubs = limit ? publications.slice(0, limit) : publications;
    listEl.innerHTML = pubs.map(renderPublicationLi).join("");
  }

  function renderGroupedByYear(containerEl, publications) {
    containerEl.innerHTML = "";

    let currentYear = null;
    let currentList = null;

    for (const pub of publications) {
      const pubYear = Number(pub.year);
      if (pubYear !== currentYear) {
        currentYear = pubYear;
        const yearHeading = document.createElement("h4");
        yearHeading.className = "pub-year";
        yearHeading.textContent = String(pubYear);
        containerEl.appendChild(yearHeading);

        currentList = document.createElement("ul");
        currentList.className = "pubs";
        containerEl.appendChild(currentList);
      }

      const li = document.createElement("li");
      li.innerHTML = renderPublicationLi(pub).slice(4, -5);
      currentList.appendChild(li);
    }
  }

  function main() {
    const publications = normalizePublications(window.PUBLICATIONS);
    if (!publications.length) return;

    const targets = document.querySelectorAll("[data-publications]");
    for (const el of targets) {
      const limit = el.dataset.limit ? Number.parseInt(el.dataset.limit, 10) : null;
      const groupByYear = el.dataset.groupByYear === "true";
      const filtered = applyFilters(publications, el.dataset);

      if (groupByYear) {
        const pubs = limit ? filtered.slice(0, limit) : filtered;
        renderGroupedByYear(el, pubs);
      } else if (el.tagName === "UL" || el.tagName === "OL") {
        renderIntoList(el, filtered, limit);
      } else {
        const ul = document.createElement("ul");
        ul.className = "pubs";
        el.appendChild(ul);
        renderIntoList(ul, filtered, limit);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
