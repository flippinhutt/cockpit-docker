DESTDIR ?= /usr/share/cockpit
MOD_NAME = cockpit-docker

install:
	mkdir -p $(DESTDIR)/$(MOD_NAME)
	cp manifest.json index.html docker.js style.css $(DESTDIR)/$(MOD_NAME)/

uninstall:
	rm -rf $(DESTDIR)/$(MOD_NAME)

debug:
	cockpit-bridge --packages

.PHONY: install uninstall debug
