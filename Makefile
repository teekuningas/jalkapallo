# Makefile for Jaakon Seikkailut

# Use bash as the shell
SHELL := /bin/bash

# The command to run npm via nix
NPM_CMD = nix shell nixpkgs\#nodejs --command npm

.PHONY: install watch build format

install:
	@echo "Installing dependencies..."
	@$(NPM_CMD) install

watch:
	@echo "Starting development server..."
	@$(NPM_CMD) run dev

build:
	@echo "Building for production..."
	@$(NPM_CMD) run build

format:
	@echo "Formatting code..."
	@$(NPM_CMD) run format