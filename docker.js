const listElement = document.getElementById('container-list');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const refreshBtn = document.getElementById('refresh-btn');

function showError(msg) {
    errorText.textContent = msg;
    errorElement.classList.remove('hidden');
    loadingElement.classList.add('hidden');
    listElement.classList.add('hidden');
}

function fetchContainers() {
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
    
    cockpit.spawn(["docker", "ps", "-a", "--format", "{{json .}}"])
        .done(output => {
            const lines = output.trim().split('\n').filter(l => l.trim() !== '');
            const containers = lines.map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    console.error("Failed to parse JSON:", line);
                    return null;
                }
            }).filter(c => c !== null);
            
            renderContainers(containers);
        })
        .fail(err => {
            let msg = "Failed to fetch containers.";
            if (err.message && err.message.includes("not found")) {
                msg = "Docker command not found. Please install Docker on the host.";
            } else if (err.exit_status === 1) {
                msg = "Permission denied. Is the user in the 'docker' group?";
            }
            showError(msg + " (" + err + ")");
        });
}

function renderContainers(containers) {
    listElement.innerHTML = '';
    loadingElement.classList.add('hidden');
    listElement.classList.remove('hidden');

    if (containers.length === 0) {
        listElement.innerHTML = '<div class="empty-state">No containers found.</div>';
        return;
    }

    containers.forEach(container => {
        const card = document.createElement('div');
        card.className = 'container-card';
        
        const isRunning = container.Status.toLowerCase().includes('up');
        const statusClass = isRunning ? 'status-running' : 'status-exited';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="container-name">${container.Names}</div>
                <div class="status-badge ${statusClass}">${container.State || (isRunning ? 'running' : 'exited')}</div>
            </div>
            <div class="card-details">
                <div class="detail-row">
                    <span class="detail-label">Image</span>
                    <span class="detail-value">${container.Image}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${container.Status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">ID</span>
                    <span class="detail-value">${container.ID.substring(0, 12)}</span>
                </div>
            </div>
            <div class="card-actions">
                ${isRunning 
                    ? `<button class="btn btn-secondary" onclick="containerAction('stop', '${container.ID}')">Stop</button>`
                    : `<button class="btn btn-primary" onclick="containerAction('start', '${container.ID}')">Start</button>`
                }
                <button class="btn btn-danger" onclick="containerAction('rm', '${container.ID}')">Remove</button>
            </div>
        `;
        listElement.appendChild(card);
    });
}

window.containerAction = function(action, id) {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;

    cockpit.spawn(["docker", action, id])
        .done(() => {
            fetchContainers();
        })
        .fail(err => {
            alert(`Action failed: ${err}`);
            btn.textContent = originalText;
            btn.disabled = false;
        });
};

refreshBtn.addEventListener('click', fetchContainers);

// Initial fetch
fetchContainers();
setInterval(fetchContainers, 10000); // Refresh every 10 seconds
