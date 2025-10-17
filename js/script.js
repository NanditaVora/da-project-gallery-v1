/* script.js
   Responsibilities:
   - Load projects.json
   - Render filter buttons and project cards
   - Filter client-side by track
   - Theme switching
   - Modal rendering for project details
*/

/* ---------- Config & helpers ---------- */

// Map filter codes to expected track names in the JSON.
// Extend this map as you support more track labels vs full names.
const TRACK_MAP = {
    "All": null,
    "DA": "Data Analytics",
    "DS": "Data Science",
    "SE": "Software Engineering",
    "DM": "Digital Marketing",
    "CY": "Cyber Security",
    "CD": "Cloud Computing",
};

const DATA_PATH = 'data/projects.json'; // relative path to projects.json

// DOM refs
const projectGrid = document.getElementById('projectGrid');
const noResults = document.getElementById('noResults');
const programHeader = document.getElementById('programHeader');
const programName = document.getElementById('programName');
const programSummary = document.getElementById('programSummary');
const rtbChiclets = document.getElementById('rtbChiclets');

let allProjects = [];
// We only show DA projects

/* ---------- RTB Chiclets ---------- */
async function loadRTBChiclets() {
    try {
        const response = await fetch(DATA_PATH);
        const data = await response.json();

        rtbChiclets.innerHTML = '';

        // Get the first program's RTB content
        if (data && data.length > 0 && data[0].rtb_content) {
            data[0].rtb_content.forEach(rtb => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4 ';

                const chiclet = document.createElement('div');
                chiclet.className = 'rtb-chiclet';

                const title = document.createElement('h3');
                title.className = 'rtb-title';
                // Parse markdown in title to remove ### syntax
                title.innerHTML = marked.parse(rtb.rtb_title);

                const content = document.createElement('div');
                content.className = 'rtb-content';
                
                // Convert rtbs array to bulleted list and parse markdown
                const listItems = rtb.rtbs.join('\n');
                content.innerHTML = marked.parse(listItems);

                chiclet.appendChild(title);
                chiclet.appendChild(content);
                col.appendChild(chiclet);
                rtbChiclets.appendChild(col);
            });
        }
    } catch (error) {
        console.error('Error loading RTB data:', error);
    }
}

/* ---------- Render helpers ---------- */

// No track filters needed as we only show DA projects

function renderProjectsList(projects) {
    projectGrid.innerHTML = ''; // clear
    if (!projects || projects.length === 0) {
        noResults.classList.add('show');
        return;
    }
    noResults.classList.remove('show');

    projects.forEach((p, idx) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-3 col-lg-4';
        col.setAttribute('role', 'listitem');

        const card = document.createElement('article');
        card.className = 'card project-card h-100';
        if (p.type === 'Capstone Project') {
            card.classList.add('capstone');
        }
        card.tabIndex = 0;
        card.setAttribute('aria-labelledby', `title-${idx}`);
        card.setAttribute('data-track', p.track || '');

        const body = document.createElement('div');
        body.className = 'card-body d-flex flex-column p-3';

        // Badge / Track label
        if (p.track) {
            const badge = document.createElement('span');
            badge.className = 'badge mb-2 project-badge';
            badge.textContent = p.header;
            body.appendChild(badge);
        }

          // --- Optional Project Image/Icon ---
        if (p.image_url) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'project-image-container';
            
            const img = document.createElement('img');
            img.src = p.image_url;
            img.alt = p.project_title || 'Project Image';
            img.className = 'project-img';
            
            imageContainer.appendChild(img);
            body.appendChild(imageContainer);
        }

        // title
        const title = document.createElement('h3');
        title.className = 'h5 mb-2 fw-semibold project-title text-center';
        title.id = `title-${idx}`;
        title.textContent = p.project_title || 'Untitled Project';
        body.appendChild(title);

        // brief description
        const brief = document.createElement('p');
        brief.className = 'small text-muted mb-2 project-brief';
        brief.textContent = p.brief_description || '';
        body.appendChild(brief);

        // tech list
        const techWrap = document.createElement('div');
        techWrap.className = 'tech-list d-flex flex-wrap gap-2 mt-auto';
        (p.technologies_used || []).forEach(t => {
            const tspan = document.createElement('span');
            tspan.className = 'tech-pill';
            tspan.textContent = t;
            techWrap.appendChild(tspan);
        });
        body.appendChild(techWrap);

        // actions
        const actions = document.createElement('div');
        actions.className = 'card-actions mt-3 text-end';
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'btn btn-sm btn-outline-primary';
        detailsBtn.textContent = 'View Details';
        detailsBtn.addEventListener('click', () => openModal(p));
        detailsBtn.setAttribute('aria-label', `Open details for ${p.project_title}`);
        // actions.appendChild(detailsBtn);
        body.appendChild(actions);

        card.appendChild(body);
        col.appendChild(card);
        projectGrid.appendChild(col);
    });
}


/* ---------- Filtering logic ---------- */

// No track filtering needed as we only show DA projects

// No track filtering needed as we only show DA projects


/* ---------- Modal ---------- */

function openModal(project) {
    const modalTitle = document.getElementById('modalTitle');
    const modalHeader = document.getElementById('modalHeader');
    const modalDetailed = document.getElementById('modalDetailed');
    const modalTech = document.getElementById('modalTech');
    const modalFeatures = document.getElementById('modalFeatures');

    modalTitle.textContent = project.project_title || 'Project';
    modalHeader.textContent = `${project.type} • ${project.track} • ${project.header || ''}`;
    modalDetailed.textContent = project.detailed_description || project.brief_description || '';

    modalTech.innerHTML = '';
    (project.technologies_used || []).forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        modalTech.appendChild(li);
    });

    modalFeatures.innerHTML = '';
    (project.core_features || []).forEach(f => {
        const li = document.createElement('li');
        li.textContent = f;
        modalFeatures.appendChild(li);
    });

    const bsModal = new bootstrap.Modal(document.getElementById('projectModal'));
    bsModal.show();
}

/* ---------- Theme switching ---------- */

function applyTheme(trackCode) {
    const themePrefix = 'theme-';
    const body = document.body;

    // Remove any previous theme classes
    body.classList.forEach(cls => {
        if (cls.startsWith(themePrefix)) body.classList.remove(cls);
    });

    // Add the new one
    body.classList.add(`theme-${trackCode}`);

    // Update header/banner colors - Use the specified color scheme
    const banner = document.getElementById('programHeader');
    const badges = document.getElementsByClassName('badge');
    if (banner) {
        // Keep white background
        banner.style.background = '#FFFFFF';

        // Update badges with accent yellow
        Array.from(badges).forEach(b => {
            b.style.background = '#FFCB05';
            b.style.color = '#0E3997';
        });
    }
}

// Function to update program information from JSON
function updateProgramInfo(programData) {
    if (programData && programData.length > 0) {
        // Get the first program item for program info
        const program = programData[0];

        // Update program name with markdown formatting
        const programNameText = program.program_track || 'Learning Program';
        programName.innerHTML = marked.parse(programNameText);

        // Update program summary with markdown support
        programSummary.innerHTML = marked.parse(program.program_brief || '');
    }
}

// Function to update track information section
function updateTrackInfoSection(trackCode) {
    // This function is no longer needed as we've removed the track info section
    // Keeping it for compatibility with existing code
}


/* ---------- Initialization ---------- */

async function init() {
    // No track filtering needed - only DA projects shown
    console.log('Initializing gallery with DA projects only');

    // Load RTB chiclets
    loadRTBChiclets();

    // theme selector
    // themeSelector.addEventListener('change', (e) => {
    //     applyTheme(e.target.value);
    // });

    // fetch project data
    try {
        // IMPORTANT: when testing locally, run via a local server (e.g. `npx http-server` or live-server).
        const res = await fetch(DATA_PATH);
        if (!res.ok) throw new Error('Failed to fetch project data');
        const data = await res.json();
        
        // Extract DA projects from the first program's project list
        if (data && data.length > 0 && data[0].project_content && data[0].project_content.projects) {
            allProjects = data[0].project_content.projects;
        } else {
            allProjects = [];
        }

        // Update program information from JSON
        updateProgramInfo(data);
    } catch (err) {
        console.error('Could not load projects.json — make sure you run this via HTTP server:', err);
        // fallback: show empty array
        allProjects = [];
    }

    // Render all DA projects
    renderProjectsList(allProjects);
    
    // Apply DA theme
    applyTheme('DA');


}

// Function to generate a simple SVG dynamically
function generateSVG(p) {
    // Generate a color based on the project title (optional)
    const colors = ['#FF6B6B', '#4ECDC4', '#556270', '#C7F464', '#FF6F91'];
    const color = colors[p.project_title.length % colors.length];

    // Get initials from project title
    const initials = p.project_title
        .split(' ')
        .map(word => word[0].toUpperCase())
        .join('');

    // Return SVG markup as a string
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="${color}" />
            <text x="50" y="55" font-size="30" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif">${initials}</text>
        </svg>
    `;
}




// Scroll to top functionality
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // Show after scrolling 300px
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    init();
    initScrollToTop();
});
