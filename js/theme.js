function applyTheme(isDark){
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('prefers-dark', isDark);
  const toggle = document.getElementById('themeSwitch');
  if (toggle) toggle.checked = isDark;
}

document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('prefers-dark') === 'true';
  applyTheme(stored);

  document.getElementById('themeSwitch')
          .addEventListener('change', e => applyTheme(e.target.checked));
});