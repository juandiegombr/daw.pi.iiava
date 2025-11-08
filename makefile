COMPOSE=docker compose

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: dev-build dev-up dev-upf dev-down dev-rebuild logs-dev-backend seed
.PHONY: prod-build prod-up prod-upf prod-down prod-rebuild logs-prod-backend
.PHONY: test-frontend test-backend

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-backend: ## Run backend tests
	cd backend && npm test

dev-build: ## Build development Docker containers
	$(COMPOSE) -f docker-compose.dev.yml build --no-cache

dev-up: ## Start development environment (detached)
	$(COMPOSE) -f docker-compose.dev.yml up -d

dev-upf: ## Start development environment (foreground)
	$(COMPOSE) -f docker-compose.dev.yml up

dev-down: ## Stop development environment
	$(COMPOSE) -f docker-compose.dev.yml down

dev-rebuild: dev-build dev-up ## Rebuild and restart development environment

logs-dev-backend: ## View backend logs in development
	$(COMPOSE) -f docker-compose.dev.yml logs -f backend

seed: ## Populate database with sample sensors
	$(COMPOSE) -f docker-compose.dev.yml exec backend npm run seed

prod-build: ## Build production Docker containers
	$(COMPOSE) -f docker-compose.yml build --no-cache

prod-up: ## Start production environment (detached)
	$(COMPOSE) -f docker-compose.yml up -d

prod-upf: ## Start production environment (foreground)
	$(COMPOSE) -f docker-compose.yml up

prod-down: ## Stop production environment
	$(COMPOSE) -f docker-compose.yml down

prod-rebuild: prod-build prod-up ## Rebuild and restart production environment

logs-prod-backend: ## View backend logs in production
	$(COMPOSE) -f docker-compose.yml logs -f backend
