import './theme.js';
import './home.css';

const search = document.querySelector('#project-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-project]')];
let collection = 'all';
function filterProjects() {
  const words = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  let visible = 0;
  for (const card of cards) {
    const match = (collection === 'all' || card.dataset.group === collection)
      && words.every(word => card.dataset.search.toLocaleLowerCase().includes(word));
    card.hidden = !match;
    if (match) visible++;
  }
  for (const section of document.querySelectorAll('[data-collection]')) {
    section.hidden = ![...section.querySelectorAll('[data-project]')].some(card => !card.hidden);
  }
  document.querySelector('#no-projects').hidden = visible > 0;
  document.querySelector('#project-results').textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}${collection === 'all' && !words.length ? ' across 4 collections' : ' found'}`;
}
search.addEventListener('input', filterProjects);
for (const button of filters) button.addEventListener('click', () => {
  collection = button.dataset.filter;
  for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
  filterProjects();
});
document.querySelector('.finder-controls').hidden = false;
