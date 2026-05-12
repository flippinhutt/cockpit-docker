# Technical Reference: Cockpit Docker Module

This document outlines the technical implementation and the Docker CLI commands used by the module.

## Architecture

The module is a standard Cockpit package consisting of:
- `manifest.json`: Package metadata and menu registration.
- `index.html`: Main UI structure.
- `style.css`: Glassmorphic design system.
- `docker.js`: Interaction logic using the `cockpit.js` bridge.

## Docker CLI Commands

The module interacts with Docker via the following commands:

### Containers
| Action | Command | Purpose |
| :--- | :--- | :--- |
| List | `docker ps -a --format '{{json .}}'` | Fetches all containers in JSON format for parsing. |
| Start | `docker start <id>` | Starts a stopped container. |
| Stop | `docker stop <id>` | Stops a running container. |
| Remove | `docker rm <id>` | Deletes a container. |
| Logs | `docker logs --tail 200 <id>` | Fetches the last 200 lines of logs. |
| Stats | `docker stats --no-stream --format '{{json .}}'` | Fetches CPU/MEM usage snapshots. |

### Images
| Action | Command | Purpose |
| :--- | :--- | :--- |
| List | `docker images --format '{{json .}}'` | Fetches all local images in JSON format. |
| Remove | `docker rmi <id>` | Deletes a Docker image. |

## UI Components

### Glassmorphic Cards
Cards use `backdrop-filter: blur(16px)` and semi-transparent backgrounds to achieve a modern look.

### Real-time Stats
Stats are updated every 5 seconds using `setInterval`. The bars are rendered using CSS transitions on the `width` property for smooth movement.

### Terminal Logs
The log viewer uses a `<pre>` element styled as a dark terminal. It auto-scrolls to the bottom on every update and refreshes every 2 seconds when open.

## File Structure

```
cockpit-docker/
├── docs/
│   └── API.md
├── screenshots/
│   ├── dashboard.png
│   └── images.png
├── index.html
├── style.css
├── docker.js
├── manifest.json
├── Makefile
└── README.md
```
