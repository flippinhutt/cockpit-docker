# Cockpit Docker Module

A premium, modern Cockpit module for managing Docker containers.

## Installation

### 1. Install System-Wide (Recommended)
Run these commands on your Linux node:
```bash
git clone https://github.com/flippinhutt/cockpit-docker.git
cd cockpit-docker
sudo make install
```
This installs the module to `/usr/share/cockpit/cockpit-docker`.

### 2. Verify Installation
Check if Cockpit sees the package:
```bash
cockpit-bridge --packages | grep cockpit-docker
```
If you don't see it, try restarting Cockpit:
```bash
sudo systemctl restart cockpit
```

### 3. Permissions
Ensure the user you log in with has permission to run `docker` commands.
You can add your user to the `docker` group:
```bash
sudo usermod -aG docker $USER
```
*Note: You may need to log out and back in for this to take effect.*

## Troubleshooting
- **Not appearing in sidebar?** Run `cockpit-bridge --packages` to see if it's listed. If not, check that `manifest.json` is in `/usr/share/cockpit/docker/`.
- **Permission denied?** Ensure the `docker` service is running and your user has access to `/var/run/docker.sock`.
- **White screen?** Open the browser console (F12) and look for errors. Ensure `cockpit.js` is loading correctly.

## Requirements
- `cockpit` >= 120
- `docker`
