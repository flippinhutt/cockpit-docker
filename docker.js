/**
 * Cockpit Docker Module
 * Handles interaction between Cockpit and the Docker CLI.
 */

// Core DOM Elements
const containerList = document.getElementById('container-list');
const imageList = document.getElementById('image-list');
const loadingContainers = document.getElementById('loading-containers');
const loadingImages = document.getElementById('loading-images');
const errorElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const refreshBtn = document.getElementById('refresh-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabSections = document.querySelectorAll('.tab-content');

/** @type {string} Current active tab name */
let currentTab = 'containers';

/** @type {number|null} Interval ID for log refreshing */
let logInterval = null;

// Ensure modal is hidden immediately on script load
const initialModal = document.getElementById('logs-modal');
if (initialModal) initialModal.style.display = 'none';

/**
 * Initializes the module and checks for Cockpit availability.
 */
if (typeof cockpit === 'undefined') {
    console.error("Cockpit API not found. This module must run inside Cockpit.");
} else {
    console.log("Cockpit Docker module initializing...");
}

/**
 * Switches the active tab and refreshes data.
 * @param {string} tab - The name of the tab to switch to ('containers' or 'images').
 */
function switchTab(tab) {
    currentTab = tab;
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    tabSections.forEach(s => s.classList.toggle('active', s.id === `${tab}-section`));
    refreshData();
}

function showError(msg) {
    errorText.textContent = msg;
    errorElement.classList.remove('hidden');
    loadingContainers.classList.add('hidden');
    loadingImages.classList.add('hidden');
}

function refreshData() {
    if (currentTab === 'containers') fetchContainers();
    else if (currentTab === 'images') fetchImages();
}

/**
 * Fetches all containers using the Docker CLI in JSON format.
 */
function fetchContainers() {
    loadingContainers.classList.remove('hidden');
    errorElement.classList.add('hidden');
    
    cockpit.spawn(["docker", "ps", "-a", "--format", "{{json .}}"])
        .done(output => {
            const lines = output.trim().split('\n').filter(l => l.trim() !== '');
            const containers = lines.map(line => JSON.parse(line));
            renderContainers(containers);
        })
        .fail(err => {
            showError("Failed to fetch containers: " + err);
        });
}

/**
 * Renders the list of containers into the DOM.
 * @param {Array<Object>} containers - List of container objects from Docker CLI.
 */
function renderContainers(containers) {
    containerList.innerHTML = '';
    loadingContainers.classList.add('hidden');

    containers.forEach(container => {
        const isRunning = container.Status.toLowerCase().includes('up');
        const card = document.createElement('div');
        card.className = 'container-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="container-name">${container.Names}</div>
                <div class="status-badge ${isRunning ? 'status-running' : 'status-exited'}">${container.State || (isRunning ? 'running' : 'exited')}</div>
            </div>
            <div class="card-details">
                <div class="detail-row"><span class="detail-label">Image</span><span class="detail-value">${container.Image}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${container.Status}</span></div>
                <div class="stats-row">
                    <div class="stat-item">
                        <span class="stat-label">CPU</span>
                        <div class="stat-bar-bg"><div id="cpu-${container.ID}" class="stat-bar" style="width: 0%"></div></div>
                        <span id="cpu-val-${container.ID}" class="stat-text">0%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">MEM</span>
                        <div class="stat-bar-bg"><div id="mem-${container.ID}" class="stat-bar" style="width: 0%"></div></div>
                        <span id="mem-val-${container.ID}" class="stat-text">0%</span>
                    </div>
                </div>
            </div>
            <div class="card-actions">
                ${isRunning 
                    ? `<button class="btn btn-secondary" onclick="containerAction(event, 'stop', '${container.ID}')">Stop</button>`
                    : `<button class="btn btn-primary" onclick="containerAction(event, 'start', '${container.ID}')">Start</button>`
                }
                <button class="btn btn-secondary" onclick="showLogs('${container.ID}', '${container.Names}')">Logs</button>
                <button class="btn btn-danger" onclick="containerAction(event, 'rm', '${container.ID}')">Remove</button>
            </div>
        `;
        containerList.appendChild(card);
    });
}

/**
 * Fetches all local Docker images.
 */
function fetchImages() {
    loadingImages.classList.remove('hidden');
    
    cockpit.spawn(["docker", "images", "--format", "{{json .}}"])
        .done(output => {
            const lines = output.trim().split('\n').filter(l => l.trim() !== '');
            const images = lines.map(line => JSON.parse(line));
            renderImages(images);
        })
        .fail(err => showError("Failed to fetch images: " + err));
}

function renderImages(images) {
    imageList.innerHTML = '';
    loadingImages.classList.add('hidden');

    images.forEach(img => {
        const card = document.createElement('div');
        card.className = 'container-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="container-name">${img.Repository}</div>
                <div class="status-badge status-running">${img.Tag}</div>
            </div>
            <div class="card-details">
                <div class="detail-row"><span class="detail-label">ID</span><span class="detail-value">${img.ID}</span></div>
                <div class="detail-row"><span class="detail-label">Size</span><span class="detail-value">${img.Size}</span></div>
                <div class="detail-row"><span class="detail-label">Created</span><span class="detail-value">${img.CreatedAt}</span></div>
            </div>
            <div class="card-actions">
                <button class="btn btn-danger" onclick="imageAction(event, 'rmi', '${img.ID}')">Remove</button>
            </div>
        `;
        imageList.appendChild(card);
    });
}

/**
 * Performs a Docker container action (start, stop, rm).
 * @param {Event} event - The click event.
 * @param {string} action - The action to perform.
 * @param {string} id - The container ID.
 */
window.containerAction = function(event, action, id) {
    const btn = event.target;
    btn.disabled = true;
    cockpit.spawn(["docker", action, id]).done(() => fetchContainers()).fail(err => alert(err));
};

window.imageAction = function(event, action, id) {
    const btn = event.target;
    btn.disabled = true;
    cockpit.spawn(["docker", action, id]).done(() => fetchImages()).fail(err => alert(err));
};

// Logs
window.showLogs = function(id, name) {
    const modal = document.getElementById('logs-modal');
    const output = document.getElementById('log-output');
    document.getElementById('logs-title').textContent = `Logs: ${name}`;
    output.textContent = 'Loading logs...';
    modal.style.display = 'flex';
    modal.classList.remove('hidden');

    const fetchLogContent = () => {
        cockpit.spawn(["docker", "logs", "--tail", "200", id])
            .done(stdout => { 
                output.textContent = stdout; 
                output.scrollTop = output.scrollHeight; // Auto-scroll to bottom
            })
            .fail(err => { output.textContent = "Error: " + err; });
    };

    fetchLogContent();
    logInterval = setInterval(fetchLogContent, 2000); // Refresh every 2 seconds
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'none';
    modal.classList.add('hidden');
    if (logInterval) {
        clearInterval(logInterval);
        logInterval = null;
    }
};

// Close modal on background click
document.getElementById('logs-modal').addEventListener('click', (e) => {
    if (e.target.id === 'logs-modal') {
        closeModal('logs-modal');
    }
});

// Stats Logic
function fetchStats() {
    if (currentTab !== 'containers') return;

    cockpit.spawn(["docker", "stats", "--no-stream", "--format", "{{json .}}"])
        .done(output => {
            const lines = output.trim().split('\n').filter(l => l.trim() !== '');
            lines.forEach(line => {
                const stat = JSON.parse(line);
                const containerId = stat.ID;
                
                const cpuBar = document.getElementById(`cpu-${containerId}`);
                const cpuText = document.getElementById(`cpu-val-${containerId}`);
                const memBar = document.getElementById(`mem-${containerId}`);
                const memText = document.getElementById(`mem-val-${containerId}`);

                if (cpuBar) {
                    cpuBar.style.width = stat.CPUPerc;
                    cpuText.textContent = stat.CPUPerc;
                }
                if (memBar) {
                    memBar.style.width = stat.MemPerc;
                    memText.textContent = stat.MemPerc;
                }
            });
        });
}

refreshBtn.addEventListener('click', refreshData);

// Init
refreshData();
setInterval(refreshData, 10000);
setInterval(fetchStats, 5000);
