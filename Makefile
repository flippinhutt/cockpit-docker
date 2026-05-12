DESTDIR ?= ~/.local/share/cockpit
MOD_NAME = docker

install:
	mkdir -p $(DESTDIR)/$(MOD_NAME)
	cp manifest.json index.html docker.js style.css $(DESTDIR)/$(MOD_NAME)/

uninstall:
	rm -rf $(DESTDIR)/$(MOD_NAME)

.PHONY: install uninstall
