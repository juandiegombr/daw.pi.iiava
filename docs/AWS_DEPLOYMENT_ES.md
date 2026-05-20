# Arquitectura de Despliegue en AWS

Este documento describe la infraestructura actual de despliegue en AWS del Proyecto DAW: frontend en S3 + CloudFront, backend ejecutándose en Docker sobre EC2 y base de datos MySQL gestionada en RDS.

**[Read in English](AWS_DEPLOYMENT_EN.md)**

## Visión General de la Arquitectura

La aplicación está desplegada íntegramente en AWS (región `eu-west-1`). CloudFront es el único punto de entrada público: sirve el frontend estático desde S3 y enruta las peticiones `/api/*` al backend que corre en EC2.

```
                       ┌─────────────────────────┐
                       │     CloudFront (CDN)    │
                       │  d12lcsgk45eqvv.cloudfront.net
                       │  Distribución: E8CAZK17RKQ5Z
                       └────────────┬────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        (comportamiento por defecto)             (comportamiento /api/*)
                │                                       │
                ↓                                       ↓
   ┌──────────────────────────┐         ┌─────────────────────────────┐
   │  S3 (alojamiento static) │         │   EC2 (contenedor Docker)   │
   │  daw-pi-iava-frontend    │         │   ec2-108-129-184-221       │
   │  (build del frontend)    │         │   .eu-west-1.compute...     │
   └──────────────────────────┘         │   Node.js / Express :80→3000│
                                        └──────────────┬──────────────┘
                                                       │
                                                       ↓
                                        ┌─────────────────────────────┐
                                        │     RDS MySQL 8.0           │
                                        │  daw.cjgqeq2gs0wl           │
                                        │  .eu-west-1.rds.amazonaws.com
                                        └─────────────────────────────┘
```

## Componentes Desplegados

| Componente | Servicio | Identificador / URL | Estado |
|-----------|----------|---------------------|--------|
| **CDN / Punto de entrada** | CloudFront | `https://d12lcsgk45eqvv.cloudfront.net` (distribución `E8CAZK17RKQ5Z`) | ✅ Producción |
| **Frontend (assets)** | S3 | `s3://daw-pi-iava-frontend` | ✅ Producción |
| **Backend** | EC2 + Docker | `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com` | ✅ Producción |
| **Base de datos** | RDS MySQL 8.0 | `daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com` | ✅ Producción |

**Beneficios clave:**

- Único origen público (CloudFront) — sin CORS entre frontend y API
- CDN global con caché en el edge para el frontend
- HTTPS terminado en CloudFront
- Base de datos gestionada con copias de seguridad automáticas (RDS)
- Despliegues automatizados con GitHub Actions
- Backend aislado en un contenedor Docker en EC2, reiniciable independientemente del host

---

## Requisitos Previos

Antes de reproducir este despliegue, asegúrate de tener:

- [Cuenta de AWS](https://aws.amazon.com/) con permisos sobre S3, CloudFront, EC2 y RDS
- [Cuenta de GitHub](https://github.com/) con acceso al repositorio
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) instalado (opcional, para operaciones manuales)
- Un par de claves SSH para acceder a EC2 (el proyecto usa `daw.pem`)

---

## Configuración de Base de Datos (Amazon RDS para MySQL)

### Paso 1: Crear la Instancia de RDS

1. **Abrir la consola de AWS** → RDS → "Create database"
2. **Motor**: MySQL 8.0
3. **Plantilla**: Free tier (para desarrollo) o Dev/Test
4. **Ajustes:**
   - **DB instance identifier**: `daw`
   - **Master username**: usuario admin (por ejemplo `admin`)
   - **Master password**: contraseña fuerte (guárdala de forma segura)
5. **Tipo de instancia**: `db.t3.micro` (elegible para free tier)
6. **Almacenamiento**: 20 GB gp3 (autoscaling opcional)
7. **Conectividad:**
   - **VPC**: por defecto (o la del proyecto)
   - **Acceso público**: Sí (desarrollo) / No + bastión (producción)
   - **Security group**: crear uno nuevo, p. ej. `daw-rds-sg`
   - **Zona de disponibilidad**: `eu-west-1a` (o la más cercana)
8. **Autenticación**: contraseña
9. **Configuración adicional**:
   - **Initial database name**: `mydatabase` (o el nombre que prefieras)
   - **Retención de backups**: 7 días
10. **Create database** → esperar 5-10 minutos.

### Paso 2: Abrir el Security Group hacia el Backend

En EC2 → Security Groups → `daw-rds-sg`, añadir una regla de entrada:

- **Tipo**: MYSQL/Aurora (3306/TCP)
- **Origen**: el security group de la instancia EC2 del backend (recomendado), o la IP pública de EC2

### Paso 3: Inicializar la Base de Datos

```bash
mysql -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p

# Verificar
SHOW DATABASES;
USE mydatabase;
```

Sequelize crea las tablas automáticamente al arrancar el backend por primera vez (`sync()`).

---

## Despliegue del Backend (EC2 + Docker)

El backend se ejecuta como un único contenedor Docker en una instancia EC2. El contenedor expone el puerto `3000` y EC2 mapea el puerto `80` del host al `3000` del contenedor, de modo que CloudFront pueda alcanzar el origen EC2 por HTTP.

### Paso 1: Lanzar la Instancia EC2

1. **EC2 → Launch instance**
2. **Nombre**: `daw-backend`
3. **AMI**: Amazon Linux 2023 (o Ubuntu 22.04)
4. **Tipo de instancia**: `t3.micro` (free tier) — escalar si hace falta
5. **Par de claves**: crear o reutilizar — el proyecto la guarda como `daw.pem` localmente
6. **Red:**
   - VPC: la misma que RDS
   - Security group: permitir entrada `22/tcp` desde tu IP y `80/tcp` desde el prefix list de CloudFront (`com.amazonaws.global.cloudfront.origin-facing`) — o `0.0.0.0/0` si no necesitas restringir
7. **Almacenamiento**: 8-16 GB gp3
8. **Launch instance** → anotar el DNS público (p. ej. `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com`).

### Paso 2: Preparar el Host

Conectar por SSH e instalar Docker + git:

```bash
ssh -i daw.pem ec2-user@ec2-108-129-184-221.eu-west-1.compute.amazonaws.com

# Amazon Linux 2023
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
# Cerrar y reabrir la sesión para que aplique el cambio de grupo

# Clonar el repositorio
git clone https://github.com/juandiegombr/daw.pi.iiava.git
cd daw.pi.iiava/backend
```

### Paso 3: Crear el `.env` del Backend en el Host EC2

En `~/daw.pi.iiava/backend/.env`:

```env
MYSQL_HOST=daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=admin
MYSQL_PASSWORD=tu_contraseña_rds
MYSQL_DATABASE=mydatabase
PORT=3000
NODE_ENV=production
JWT_SECRET=tu_jwt_secret
```

⚠️ Este archivo no está en git. Debe existir en el host EC2 para que el despliegue de GitHub Actions pueda usarlo vía `--env-file .env`.

### Paso 4: Configurar Secrets de GitHub Actions

En GitHub → repositorio → Settings → Secrets and variables → Actions, añadir:

| Secret | Valor |
|--------|-------|
| `AWS_EC2_HOST` | `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com` |
| `AWS_EC2_USER` | `ec2-user` (Amazon Linux) o `ubuntu` (Ubuntu) |
| `AWS_EC2_SSH` | contenido de la clave privada `.pem` |
| `AWS_ACCESS_KEY_ID` | usuario IAM con permiso de invalidación de CloudFront |
| `AWS_SECRET_ACCESS_KEY` | secret correspondiente |
| `AWS_REGION` | `eu-west-1` |

### Paso 5: El Workflow de Despliegue

`.github/workflows/backend-deploy.yml` se ejecuta al hacer push a `main` cuando cambia algo bajo `backend/**`. Hace:

1. SSH a EC2 usando los secrets anteriores.
2. `git pull` del último código.
3. Reconstruye la imagen Docker `backend` en el propio host (sin registry — la imagen queda local en la instancia EC2).
4. Sustituye el contenedor en ejecución, mapeando `host:80` → `contenedor:3000`.
5. Invalida `/api/*` en CloudFront para limpiar respuestas cacheadas.

```yaml
script: |
  cd ~/daw.pi.iiava/backend
  git pull origin main
  docker stop backend-container || true
  docker rm backend-container || true
  docker rmi backend || true
  docker build -t backend .
  docker run -d \
    -p 80:3000 \
    --name backend-container \
    --env-file .env \
    --restart unless-stopped \
    backend
```

### Paso 6: Verificar

```bash
# Directo a EC2 (origen)
curl http://ec2-108-129-184-221.eu-west-1.compute.amazonaws.com/api/sensors

# A través de CloudFront (camino público)
curl https://d12lcsgk45eqvv.cloudfront.net/api/sensors
```

---

## Despliegue del Frontend (S3 + CloudFront)

### Paso 1: Crear el Bucket de S3

1. **S3 → Create bucket**
2. **Nombre**: `daw-pi-iava-frontend`
3. **Región**: `eu-west-1`
4. **Block all public access**: dejar habilitado — CloudFront accede al bucket vía OAC, no por lectura pública.
5. **Create bucket**

### Paso 2: Crear la Distribución de CloudFront

1. **CloudFront → Create distribution**
2. **Origen por defecto**: el bucket S3 anterior (configurar Origin Access Control para que CloudFront lo lea).
3. **Comportamiento por defecto**:
   - Viewer protocol policy: Redirect HTTP → HTTPS
   - Default root object: `index.html`
4. **Añadir un segundo origen** apuntando a EC2:
   - **Origin domain**: `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com`
   - **Protocolo**: HTTP only, puerto 80
5. **Añadir un behavior** con path pattern `/api/*` → ese origen EC2
   - Cache policy: `CachingDisabled` (las respuestas del API no deben cachearse)
   - Métodos permitidos: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - Origin request policy: `AllViewer` (reenvía cabeceras, cookies y query strings)
6. **Custom error responses** (para que las rutas SPA resuelvan):
   - 403 → `/index.html` (200)
   - 404 → `/index.html` (200)
7. **Create distribution** → anotar el dominio (p. ej. `d12lcsgk45eqvv.cloudfront.net`) y el ID (`E8CAZK17RKQ5Z`).

### Paso 3: Workflow de GitHub Actions

`.github/workflows/frontend-deploy.yml` se ejecuta al hacer push a `main` cuando cambia algo bajo `frontend/**`:

1. Construye el frontend con `npm run build`.
2. Sincroniza `frontend/dist/` con `s3://daw-pi-iava-frontend/` usando `--delete`.
3. Invalida `/*` en CloudFront.

Necesita los mismos secrets `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` que el workflow del backend. El usuario IAM necesita `s3:*` sobre el bucket y `cloudfront:CreateInvalidation` sobre la distribución.

### Paso 4: Verificar

Visita [https://d12lcsgk45eqvv.cloudfront.net](https://d12lcsgk45eqvv.cloudfront.net) y comprueba:

- La SPA carga correctamente.
- Las llamadas a `/api/sensors` resuelven en el mismo dominio (sin CORS).

---

## Flujo de Despliegue Continuo

### Despliegues Automáticos

Tanto frontend como backend se despliegan al hacer push a `main`:

```bash
git add .
git commit -m "Tu mensaje de commit"
git push origin main

# Frontend: GitHub Actions construye, sincroniza con S3 e invalida CloudFront
# Backend:  GitHub Actions hace SSH a EC2, reconstruye la imagen Docker, reinicia el contenedor e invalida /api/* en CloudFront
```

### Activadores por Ruta

- El workflow **frontend** se dispara solo cuando cambian archivos en `frontend/`.
- El workflow **backend** se dispara solo cuando cambian archivos en `backend/`.

### Despliegue Manual

Ambos workflows pueden lanzarse desde **GitHub → Actions → seleccionar workflow → "Run workflow"**.

---

## Monitorización y Solución de Problemas

### Backend (EC2 + Docker)

```bash
# Conectar por SSH
ssh -i daw.pem ec2-user@ec2-108-129-184-221.eu-west-1.compute.amazonaws.com

# Estado del contenedor
docker ps -a
docker logs -f backend-container

# Reiniciar el contenedor
docker restart backend-container

# Reconstruir a mano
cd ~/daw.pi.iiava/backend
git pull
docker build -t backend .
docker rm -f backend-container
docker run -d -p 80:3000 --name backend-container --env-file .env --restart unless-stopped backend
```

**Problemas comunes:**

1. **El contenedor no arranca** — `docker logs backend-container`. Normalmente falta el `.env` en el host o las credenciales de RDS son incorrectas.
2. **No se llega a RDS** — comprueba que el security group de RDS permite tráfico desde el security group de EC2 en `3306`.
3. **502 de CloudFront** — el origen no responde. Conéctate por SSH y comprueba que el contenedor está activo y escuchando en `:80`.

### Frontend (S3 + CloudFront)

- **Build fallido** — lee el log de GitHub Actions; reproduce localmente con `cd frontend && npm ci && npm run build`.
- **Contenido antiguo** — caché de CloudFront. El deploy invalida `/*` automáticamente; si hace falta, hazlo a mano:
  ```bash
  aws cloudfront create-invalidation --distribution-id E8CAZK17RKQ5Z --paths "/*"
  ```
- **404 en una ruta SPA** — verifica que las custom error responses mapean 403/404 → `/index.html` (200) en la distribución.

### Base de Datos (RDS)

```bash
# Conectar desde cualquier origen permitido por el security group
mysql -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p

# Inspeccionar
SHOW DATABASES;
USE mydatabase;
SHOW TABLES;
```

**Problemas comunes:**

1. **Timeout de conexión** — el security group no permite tu origen en `3306`.
2. **Access denied** — usuario o contraseña incorrectos. Revisa el `.env` del backend en EC2.
3. **SSL** — RDS admite SSL; si lo obligas, apunta Sequelize al [bundle CA combinado de RDS](https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem).

---

## Estimación de Costos (eu-west-1, mensual)

| Servicio | Nivel | Costo Estimado |
|----------|-------|----------------|
| EC2 `t3.micro` (24/7) | Free tier 12 meses, luego ~$8/mes | ~$0-8 |
| RDS `db.t3.micro` MySQL | Free tier 12 meses, luego ~$15/mes | ~$0-15 |
| Almacenamiento S3 + peticiones | < 1 GB | < $1 |
| CloudFront | < 50 GB de salida | < $5 |
| Salida de datos | Variable | $1-5 |
| **Total** | | **~$2-35/mes** |

Consejos:
- Aprovecha el free tier de AWS durante el desarrollo.
- Apaga la instancia EC2 y la de RDS cuando no las uses.
- Controla los costos con AWS Budgets.

---

## Notas de Seguridad

### Base de Datos

- ✅ En producción, RDS en subnet privada
- ✅ Restringir el security group al security group del backend
- ✅ Contraseña maestra fuerte; rotar periódicamente
- ✅ Backups automáticos (7 días por defecto)
- ⚠️ Nunca subas las credenciales — viven en el `.env` del host EC2 y en GitHub Secrets

### Aplicación

- ✅ Secrets en GitHub Actions / `.env` de EC2, nunca en el código
- ✅ HTTPS terminado en CloudFront
- ✅ `restart: unless-stopped` en el contenedor, para que el backend se recupere de fallos
- ⚠️ Plantéate rate limiting y un CORS más estricto en la capa Express
- ⚠️ La clave privada `daw.pem` no debe subirse nunca (está en gitignore)

### IAM

- El usuario IAM de despliegue solo necesita:
  - `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` sobre el bucket del frontend
  - `cloudfront:CreateInvalidation` sobre la distribución
- El rol de la instancia EC2 (si lo hay) debe seguir el principio de mínimo privilegio.

---

## Backup y Recuperación

### Base de Datos (RDS)

- **Backups automáticos**: 7 días de retención por defecto (configurable hasta 35).
- **Point-in-time restore** disponible desde la consola de RDS.
- **Snapshot manual**:
  ```bash
  aws rds create-db-snapshot \
    --db-instance-identifier daw \
    --db-snapshot-identifier daw-manual-$(date +%Y%m%d)
  ```
- **Backup con `mysqldump`**:
  ```bash
  mysqldump -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p mydatabase > backup.sql
  ```

### Aplicación

- **Código**: GitHub es la fuente de verdad. Vuelve a desplegar cualquier commit re-ejecutando el workflow.
- **EC2**: el host es reemplazable — basta con bootstrap (Docker + git clone + `.env`) y que el workflow reconstruya el contenedor.
- **Frontend**: S3 puede versionar builds previos si activas versioning; si no, vuelve a ejecutar el workflow desde un commit etiquetado.

---

## Comandos Útiles

**AWS CLI:**

```bash
# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E8CAZK17RKQ5Z --paths "/*"

# Sincronizar el frontend a mano
aws s3 sync frontend/dist/ s3://daw-pi-iava-frontend/ --delete

# Ver la consola del sistema de EC2
aws ec2 get-console-output --instance-id <i-id> --output text
```

**EC2 / Docker:**

```bash
# Logs del contenedor
docker logs -f backend-container

# Inspeccionar el contenedor en ejecución
docker inspect backend-container

# Uso de disco
df -h
docker system df
```

---

**Última Actualización**: Mayo 2026
**Mantenido Por**: Juan Diego Martín-Blas Ramos
