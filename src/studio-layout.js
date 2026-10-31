import './studio-layout.css';

// Enhance the existing editor in place so its controls and event handlers stay intact.
function enhanceStudio() {
  const editor = document.querySelector('#studio .text-studio');
  if (!editor || editor.classList.contains('maker-studio')) return;
  const controls = editor.querySelector(':scope > .controls');
  const workspace = editor.querySelector(':scope > .workspace');
  const downloads = workspace?.querySelector('.export');
  if (!controls || !workspace || !downloads) return;

  editor.classList.add('maker-studio');
  const targets = [
    [controls, 'studio-controls', 'Customise', 'Design controls'],
    [workspace, 'studio-preview', 'Preview', 'Design preview and downloads'],
    [downloads, 'studio-downloads', 'Download', 'Download your design'],
  ];
  const jumps = document.createElement('nav');
  jumps.className = 'studio-jumps';
  jumps.setAttribute('aria-label', 'Move around your studio');
  for (const [index, [target, id, label, description]] of targets.entries()) {
    if (!target.id) target.id = id;
    target.tabIndex = -1;
    if (!target.hasAttribute('role')) target.setAttribute('role', target === downloads ? 'group' : 'region');
    if (!target.hasAttribute('aria-label')) target.setAttribute('aria-label', description);
    const link = document.createElement('a');
    link.href = `#${target.id}`;
    const step = document.createElement('span');
    step.className = 'studio-jump-step';
    step.setAttribute('aria-hidden', 'true');
    step.textContent = String(index + 1).padStart(2, '0');
    link.append(step, document.createTextNode(label));
    link.addEventListener('click', event => {
      event.preventDefault();
      target.focus({preventScroll: true});
      target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
    });
    jumps.append(link);
  }
  editor.before(jumps);

  for (const fieldset of controls.querySelectorAll(':scope > fieldset')) {
    const legend = fieldset.querySelector(':scope > legend');
    if (!legend) continue;
    fieldset.classList.add('studio-control-section');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'studio-section-toggle';
    toggle.setAttribute('aria-expanded', 'true');
    const title = document.createElement('span');
    title.className = 'studio-section-title';
    while (legend.firstChild) title.append(legend.firstChild);
    const icon = document.createElement('span');
    icon.className = 'studio-section-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '−';
    toggle.append(title, icon);
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      fieldset.classList.toggle('is-collapsed', !open);
      icon.textContent = open ? '−' : '+';
    });
    legend.append(toggle);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceStudio, {once: true});
} else {
  queueMicrotask(enhanceStudio);
}
