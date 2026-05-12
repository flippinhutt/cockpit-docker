# Cockpit Docker Module

A premium, modern Cockpit module for managing Docker containers.

## Features
- List all containers (running and stopped)
- Start, stop, and remove containers
- Glassmorphic UI with dark mode support
- Automatic refresh every 10 seconds

## Installation

### Method 1: Automatic (Makefile)
If you have `make` installed on your Linux node:
```bash
git clone https://github.com/flippinhutt/cockpit-docker.git
cd cockpit-docker
sudo make install
```

### Method 2: Manual
1. Create the cockpit directory if it doesn't exist:
   ```bash
   mkdir -p ~/.local/share/cockpit
   ```
2. Link or copy this directory into the cockpit share folder:
   ```bash
   ln -s $(pwd) ~/.local/share/cockpit/docker
   ```
3. Refresh your Cockpit dashboard. The "Docker Containers" tool should now appear in the sidebar.

## Requirements
- `cockpit` installed and running
- `docker` installed and accessible by the user running Cockpit (usually `root` or a user in the `docker` group)
