import './theme.css';
import { navigationHome, navigationGroups } from './navigation-catalogue.js';

const key = 'design-studio-theme';
const root = document.documentElement;
const header = document.querySelector('header');
const toggle = document.createElement('button');
toggle.className = 'theme-control quiet';
toggle.type = 'button';
header?.append(toggle);

function apply(value) {
  const theme = value === 'dark' ? 'dark' : 'light';
  root.dataset.theme = root.dataset.themePreference = theme;
  toggle.textContent = theme === 'dark' ? 'Dark' : 'Light';
  toggle.setAttribute('aria-label', 'Dark theme');
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  toggle.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`;
}

toggle.addEventListener('click', () => {
  apply(root.dataset.theme === 'dark' ? 'light' : 'dark');
  try { localStorage.setItem(key, root.dataset.theme); } catch {}
});
window.addEventListener('storage', event => {
  if (event.key === key) apply(event.newValue);
});
apply(root.dataset.theme);

const nav = header?.querySelector('nav');
const baseUrl = new URL(header?.querySelector('.brand')?.getAttribute('href') || './', location.href);
const normalisePath = path => path.replace(/index\.html$/, '').replace(/\/$/, '');
const pages = [navigationHome, ...navigationGroups.flatMap(group => group.items)];
const currentPage = pages.find(page => normalisePath(new URL(page.path, baseUrl).pathname) === normalisePath(location.pathname));
document.body.dataset.page = currentPage?.page || 'home';

if (nav) {
  function makeLink(page) {
    const link = document.createElement('a');
    link.href = new URL(page.path, baseUrl).href;
    link.textContent = page.label;
    if (page.page === currentPage?.page) link.setAttribute('aria-current', 'page');
    return link;
  }

  const home = makeLink(navigationHome);
  home.className = 'nav-home';
  const groups = navigationGroups.map(group => {
    const section = document.createElement('div');
    section.className = 'nav-group';
    section.setAttribute('role', 'group');
    section.setAttribute('aria-labelledby', `nav-${group.id}`);
    const label = document.createElement('p');
    label.className = 'nav-group-label';
    label.id = `nav-${group.id}`;
    label.textContent = group.label;
    const links = document.createElement('div');
    links.className = 'nav-group-links';
    links.append(...group.items.map(makeLink));
    section.append(label, links);
    return section;
  });
  nav.replaceChildren(home, ...groups);
  nav.id = 'site-navigation';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-toggle quiet';
  button.textContent = 'Menu';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', nav.id);
  nav.before(button);

  const close = (focus = false) => {
    nav.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    if (focus) button.focus();
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      close(true);
    }
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target) && !button.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (!nav.contains(event.target) && event.target !== button) close();
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) close();
  });
}
