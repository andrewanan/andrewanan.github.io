const projects = [
  {
    title: 'SATC 2024 Submission',
    desc : 'Trading Algorithm for the 2024 Stevens Algorithmic Trading Competition.',
    link : 'https://github.com/andrewanan/ol_college_try_SATC_S2024'
  },
  {
    title: 'This Portfolio Website!',
    desc : 'A personal portfolio website built with HTML, CSS, and JavaScript.',
    link : 'https://github.com/andrewanan/andrewanan.github.io'
  },
  {
    title: 'Using Social Media Sentiment to Predict Bitcoin Price',
    desc : 'Looking at the connection between Twitter and Reddit sentiment on Bitcoin pricing.',
    link : 'https://github.com/andrewanan/aai595-final-project',
    img : '../imgs/AAI595-Poster.png'
  },

  {
    title: 'SQL Phi Interpreter',
    desc : 'A mini ad-hoc OLAP query-processing engine that reads an MF query description, autogenerates Python code, queries a PostgreSQL sales table, and prints the result.',
    link : 'https://github.com/kmill89/cs562-project-demo',
    img: ''
  },

{
    title: 'Duck Study Hub',
    desc : 'A web application that allows users to create and review study spots across Stevens Campus.',
    link : 'https://github.com/a-eryan/cs-546-group-proj'
},

{
    title: 'Port Authority of NY & NJ: Daily Traffic Report Automation Script',
    desc : "A Python script that automates the retrieval and processing of daily traffic reports from the Port Authority of New York and New Jersey's internal SQL database.",
    link : 'https://github.com/andrewanan/PANYNJ_project',
    img: ''
},
  {
    title: 'Digital Clock on Nexsys A7-100T FPGA',
    desc : 'A digital clock that features an alarm setting using VHDL.',
    link : 'https://github.com/cfoote5/CPE487_FinalProject',
    img: ''
  }

];

function defaultOpenGraph(repoUrl) {
  const [, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
  return owner && repo
      ? `https://opengraph.githubassets.com/0/${owner}/${repo}`
      : '';
}

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  projects.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4';
    const imgSrc = p.img || defaultOpenGraph(p.link);

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
      ${imgSrc ? `<img src="${imgSrc}" class="card-img-top" alt="Preview of ${p.title}">` : ''}
        <div class="card-body d-flex flex-column">
          <h5 class="card-title project-title">${p.title}</h5>
          <p class="card-text flex-grow-1">${p.desc}</p>
          <a href="${p.link}" target="_blank" class="btn btn-outline-primary mt-2">
            View on GitHub
          </a>
        </div>
      </div>`;
    grid.appendChild(col);
  });
}


function showSection(id) {
  const home = document.getElementById('home-section');
  const project = document.getElementById('projects-section');
  const new_home = document.getElementById('new-home-section');
  


  home.classList.toggle('d-none', id !== 'home');
  project.classList.toggle('d-none', id !== 'projects');
  new_home.classList.toggle('d-none', id !== 'new-home');



  document.querySelectorAll('a[data-section]').forEach(a =>
    a.classList.toggle('active', a.dataset.section === id));
}

document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  showSection('home');  

  document.querySelector('nav').addEventListener('click', e => {
    if (e.target.matches('a[data-section]')) {
      e.preventDefault();
      showSection(e.target.dataset.section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});

