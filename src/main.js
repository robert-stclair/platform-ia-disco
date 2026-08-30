import { RAIL_ITEMS, SECTION_LABELS, CONTENT } from './nav-data.js';
import { RAIL_ICONS, DOC_ICON } from './icons.js';

const state = {
  scope: 'single',
  section: 'insights',
};

const railEl = document.getElementById('rail');
const panelEl = document.getElementById('secondaryPanel');
const canvasEl = document.getElementById('canvas');

function renderRail() {
  railEl.innerHTML = RAIL_ITEMS.map(
    (item) => `
      <button class="rail-item${item.key === state.section ? ' is-active' : ''}" data-section="${item.key}">
        <span class="rail-item__icon">${RAIL_ICONS[item.icon] ?? ''}</span>
        <span class="rail-item__label">${item.label}</span>
      </button>
    `
  ).join('');

  railEl.querySelectorAll('.rail-item').forEach((el) => {
    el.addEventListener('click', () => {
      state.section = el.dataset.section;
      render();
    });
  });
}

function renderPanel(data) {
  let html = `<div class="secondary-panel__heading">${data.heading}</div><ul class="nav-list">`;

  data.items.forEach((item) => {
    html += `
      <li class="nav-list-item${item.active ? ' is-active' : ''}">
        <a href="#">${item.label}${item.badge ? `<span class="nav-list-item__badge">${item.badge}</span>` : ''}</a>
      </li>
    `;
  });
  html += `</ul>`;

  if (data.sublist) {
    html += `<ul class="nav-sublist">`;
    data.sublist.forEach((s) => {
      html += `<li><a href="#">${s}</a></li>`;
    });
    html += `</ul>`;
  }

  if (data.ugc) {
    html += `
      <div class="nav-divider"></div>
      <div class="ugc-group">
        <span class="ugc-group__label">My dashboards</span>
        <button class="ugc-group__add">+ New</button>
      </div>
      <ul class="nav-list">
    `;
    data.ugc.forEach((u) => {
      html += `<li class="nav-list-item"><a href="#">${u}</a></li>`;
    });
    html += `</ul>`;
  }

  panelEl.innerHTML = html;
}

function renderCanvas(data) {
  const c = data.canvas;
  canvasEl.innerHTML = `
    <div class="canvas__eyebrow">${c.eyebrow}</div>
    <h1 class="canvas__title">${c.title}</h1>
    <p class="canvas__subtitle">${c.subtitle}</p>
    ${c.note ? `<div class="canvas__note">${DOC_ICON}<span>${c.note}</span></div>` : ''}
    <div class="placeholder-block">Page content for "${SECTION_LABELS[state.section]}" is not built here — this artifact is a navigation wireframe only.</div>
  `;
}

function render() {
  const data = CONTENT[state.scope][state.section];
  renderRail();
  renderPanel(data);
  renderCanvas(data);
}

document.querySelectorAll('.scope-toggle button').forEach((el) => {
  el.addEventListener('click', () => {
    state.scope = el.dataset.scope;
    document.querySelectorAll('.scope-toggle button').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    render();
  });
});

render();
