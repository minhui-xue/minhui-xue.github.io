(() => {
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function normalizePressItems(items) {
    if (!Array.isArray(items)) return [];
    return items.filter(
      (item) =>
        item &&
        typeof item.title === "string" &&
        typeof item.outlet === "string" &&
        typeof item.url === "string" &&
        Number.isFinite(Number(item.year))
    );
  }

  function sortByDateDesc(items) {
    return items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const yearA = Number(a.item.year);
        const yearB = Number(b.item.year);
        if (yearA !== yearB) return yearB - yearA;

        const monthA = Number.isFinite(Number(a.item.month)) ? Number(a.item.month) : 0;
        const monthB = Number.isFinite(Number(b.item.month)) ? Number(b.item.month) : 0;
        if (monthA !== monthB) return monthB - monthA;

        return a.index - b.index;
      })
      .map(({ item }) => item);
  }

  function renderOutletLink(item) {
    const outlet = escapeHtml(item.outlet);
    const url = escapeHtml(item.url);
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${outlet}</a>`;
  }

  function renderSidebarLi(item) {
    const year = Number(item.year);
    const title = escapeHtml(item.title);
    return `<li><strong>${year}:</strong> ${title}, ${renderOutletLink(item)}.</li>`;
  }

  function renderTimelineLi(item) {
    const dateLabel = item.dateLabel ? escapeHtml(item.dateLabel) : escapeHtml(String(item.year));
    const title = escapeHtml(item.title);

    return (
      `<li>` +
      `<div class="timeline-date">${dateLabel}</div>` +
      `<div class="timeline-details">${title}, ${renderOutletLink(item)}.</div>` +
      `</li>`
    );
  }

  function main() {
    const items = normalizePressItems(window.PRESS_ITEMS);
    if (!items.length) return;

    const sidebarTargets = document.querySelectorAll("[data-press='sidebar']");
    if (sidebarTargets.length) {
      const sidebarItems = sortByDateDesc(items.filter((item) => item.sidebar));
      for (const el of sidebarTargets) {
        el.innerHTML = sidebarItems.map(renderSidebarLi).join("");
      }
    }

    const timelineTargets = document.querySelectorAll("[data-press='timeline']");
    if (timelineTargets.length) {
      const timelineItems = sortByDateDesc(items.filter((item) => item.timeline));
      for (const el of timelineTargets) {
        el.innerHTML = timelineItems.map(renderTimelineLi).join("");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

