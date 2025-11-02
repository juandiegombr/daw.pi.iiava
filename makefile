COMPOSE=docker compose

prod-build:
	$(COMPOSE) -f docker-compose.yml build --no-cache

prod-up:
	$(COMPOSE) -f docker-compose.yml up -d

prod-upf:
	$(COMPOSE) -f docker-compose.yml up

prod-down:
	$(COMPOSE) -f docker-compose.yml down

logs-prod-backend:
	$(COMPOSE) -f docker-compose.yml logs -f backend

prod-rebuild: prod-build prod-up

dev-build:
	$(COMPOSE) -f docker-compose.dev.yml build --no-cache

dev-up:
	$(COMPOSE) -f docker-compose.dev.yml up -d

dev-upf:
	$(COMPOSE) -f docker-compose.dev.yml up

dev-down:
	$(COMPOSE) -f docker-compose.dev.yml down

logs-dev-backend:
	$(COMPOSE) -f docker-compose.dev.yml logs -f backend

dev-rebuild: dev-build dev-up
