# Arquitectura de Despliegue en Azure

Este documento describe la infraestructura actual de despliegue en Azure para el Proyecto DAW, incluyendo alojamiento del frontend en Vercel, servicios backend en Azure App Service y base de datos en Azure MySQL.

**[Read in English](AZURE_DEPLOYMENT_EN.md)**

## Visión General de la Arquitectura

La aplicación está desplegada utilizando una arquitectura cloud moderna que combina servicios de Azure y Vercel:

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel CDN                           │
│                    (Frontend - Next.js)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓ (Llamadas API a)
┌──────────────────────────────────────────────────────────────┐
│           Azure App Service (Web App)                        │
│          (Backend - API Node.js Express)                     │
│   pi-backend-ahdch5g9ghajbjh3.spaincentral-01.azure...      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓ (Conexión a base de datos)
┌──────────────────────────────────────────────────────────────┐
│        Azure Database for MySQL (Instancia Administrada)     │
│               (Base de Datos de Producción)                  │
│          projecte-db.mysql.database.azure.com                │
└──────────────────────────────────────────────────────────────┘
```

## Componentes Desplegados

| Componente | Plataforma | URL | Estado |
|-----------|-----------|-----|--------|
| **Frontend** | Vercel | [https://daw-pi-iiava.vercel.app](https://daw-pi-iiava.vercel.app) | ✅ Producción |
| **Backend** | Azure App Service | [https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net](https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net) | ✅ Producción |
| **Base de Datos** | Azure MySQL | `projecte-db.mysql.database.azure.com` | ✅ Producción |

**Beneficios Clave:**

- Distribución CDN global mediante Vercel
- HTTPS/SSL automático
- Base de datos administrada con copias de seguridad automáticas
- Despliegues automatizados mediante GitHub Actions
- Escalado serverless para frontend
- Monitorización y logs integrados

---

## Requisitos Previos

Antes de iniciar el proceso de despliegue, asegúrate de tener:

- [Cuenta de Azure](https://azure.microsoft.com/) con suscripción activa
- [Cuenta de Vercel](https://vercel.com/) (el nivel gratuito funciona)
- [Cuenta de GitHub](https://github.com/) con acceso al repositorio
- [Azure CLI](https://docs.microsoft.com/es-es/cli/azure/install-azure-cli) instalado (opcional, para operaciones manuales)

---

## Configuración de Base de Datos (Azure MySQL)

### Paso 1: Crear Servidor Flexible Azure MySQL

1. **Ir al Portal de Azure** → Buscar "Azure Database for MySQL"
2. **Clic en "Crear"** → Seleccionar "Servidor flexible"
3. **Configurar Ajustes Básicos:**
   - **Suscripción**: Elige tu suscripción
   - **Grupo de recursos**: Crear nuevo o usar existente
   - **Nombre del servidor**: `projecte-db` (o el nombre que prefieras)
   - **Región**: Spain Central (o la región más cercana)
   - **Versión MySQL**: 8.0
   - **Tipo de carga de trabajo**: Desarrollo (para proyectos pequeños)
   - **Proceso + Almacenamiento**: Burstable B1ms (1-2 vCores)

4. **Autenticación:**
   - **Nombre de usuario admin**: `juandiegombr` (o tu nombre de usuario)
   - **Contraseña**: Crear una contraseña segura
   - ⚠️ **Importante**: Guarda estas credenciales de forma segura

5. **Redes:**
   - **Método de conectividad**: Acceso público
   - **Reglas de firewall**:
     - ✅ Permitir que los servicios de Azure accedan
     - Añadir tu IP local para desarrollo

6. **Clic en "Revisar + Crear"** → Esperar al despliegue (5-10 minutos)

### Paso 2: Configurar Conexión a Base de Datos

```bash
# Conectar a Azure MySQL
mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p

# Crear base de datos
CREATE DATABASE mydatabase;

# Verificar conexión
SHOW DATABASES;
```

### Paso 3: Configurar Reglas de Firewall

En Portal de Azure → Tu Servidor MySQL → Redes:

1. **Añadir Regla de Firewall** para tu IP local de desarrollo
2. **Habilitar "Permitir acceso público desde cualquier servicio de Azure"** (para App Service)
3. **Guardar cambios**

⚠️ **Nota de Seguridad**: Para producción, restringe las reglas de firewall a IPs específicas o usa integración VNet.

---

## Despliegue del Backend (Azure App Service)

### Paso 1: Crear Azure App Service

1. **Ir al Portal de Azure** → Buscar "App Services"
2. **Clic en "Crear"** → "Aplicación web"
3. **Configurar Ajustes Básicos:**
   - **Suscripción**: Elige tu suscripción
   - **Grupo de recursos**: El mismo que MySQL
   - **Nombre**: `pi-backend` (se convierte en pi-backend.azurewebsites.net)
   - **Publicar**: Código
   - **Pila de entorno de ejecución**: Node 22 LTS
   - **Sistema operativo**: Linux
   - **Región**: Spain Central (igual que la base de datos)

4. **Plan de Precios:**
   - **Plan**: Basic B1 o Free F1 (para desarrollo)
   - El nivel gratuito tiene limitaciones pero funciona para proyectos pequeños

5. **Clic en "Revisar + Crear"** → Esperar al despliegue

### Paso 2: Configurar Variables de Entorno

En Portal de Azure → Tu App Service → Configuración → Configuración de aplicación:

Añadir las siguientes variables de entorno:

```env
MYSQL_HOST=projecte-db.mysql.database.azure.com
MYSQL_PORT=3306
MYSQL_USER=juandiegombr
MYSQL_PASSWORD=tu_contraseña_mysql
MYSQL_DATABASE=mydatabase
PORT=8080
NODE_ENV=production
```

⚠️ **Importante**: Azure App Service usa el puerto 8080 por defecto para aplicaciones Node.js.

Clic en **"Guardar"** después de añadir todas las variables.

### Paso 3: Configurar Despliegue con GitHub Actions

1. **En Portal de Azure** → Tu App Service → Centro de implementación
2. **Origen**: GitHub
3. **Autorizar GitHub** y seleccionar:
   - **Organización**: Tu nombre de usuario de GitHub
   - **Repositorio**: daw.pi.iiava
   - **Rama**: main

4. Azure creará automáticamente un archivo de flujo de trabajo de GitHub Actions

### Paso 4: Actualizar Flujo de Trabajo de GitHub Actions

El flujo de trabajo autogenerado necesita ajustes para la estructura de subdirectorios:

**Archivo**: `.github/workflows/main_pi-backend.yml`

```yaml
name: Build and deploy Node.js app to Azure Web App - pi-backend

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js version
        uses: actions/setup-node@v3
        with:
          node-version: '22.x'

      - name: npm install and build
        run: |
          cd backend
          npm install
          npm run build --if-present

      - name: Zip artifact for deployment
        run: |
          cd backend
          zip -r ../release.zip . -x "node_modules/*" -x ".git/*"

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: release.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: Unzip artifact for deployment
        run: unzip release.zip

      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'pi-backend'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_XXX }}
          package: .
```

### Paso 5: Verificar Despliegue del Backend

Después de hacer push a main, verificar:

```bash
# Probar endpoint de API
curl https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net/api/sensors

# Respuesta esperada (con tus datos)
{
  "data": {
    "sensors": [...]
  }
}
```

**Ver Logs**: Portal de Azure → Tu App Service → Secuencia de registro

---

## Despliegue del Frontend (Vercel)

### Paso 1: Conectar Repositorio de GitHub a Vercel

1. **Ir a** [vercel.com](https://vercel.com)
2. **Iniciar sesión** con GitHub
3. **Clic en "Add New Project"**
4. **Importar Repositorio Git**: Seleccionar `daw.pi.iiava`
5. **Configurar Proyecto**:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Directorio raíz**: `frontend`
   - **Comando de compilación**: `npm run build` (predeterminado)
   - **Directorio de salida**: `.next` (predeterminado)

### Paso 2: Configurar Variables de Entorno

En Vercel → Tu Proyecto → Settings → Environment Variables:

Añadir la siguiente variable:

| Nombre | Valor |
|------|-------|
| `API_URL` | `https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net` |

**Nota**: Esto se usa para llamadas API del lado del servidor. Las llamadas del lado del cliente usan la configuración de reescritura en `next.config.js`.

### Paso 3: Desplegar

Vercel despliega automáticamente en:
- Cada push a la rama `main`
- Cada pull request (despliegues de vista previa)

**URL de Producción**: `https://daw-pi-iiava.vercel.app`

### Paso 4: Verificar Despliegue del Frontend

1. Visitar: [https://daw-pi-iiava.vercel.app](https://daw-pi-iiava.vercel.app)
2. Verificar que los sensores se cargan correctamente
3. Probar crear/editar/eliminar sensores

**Ver Logs**: Panel de Vercel → Tu Proyecto → Deployments → Clic en despliegue → Function Logs

---

## Flujo de Trabajo de Despliegue Continuo

### Despliegues Automáticos

Tanto el frontend como el backend se despliegan automáticamente cuando haces push a `main`:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Tu mensaje de commit"
git push origin main

# Backend: GitHub Actions compila y despliega a Azure App Service
# Frontend: Vercel compila y despliega automáticamente
```

### Activadores Basados en Rutas

- **Despliegue Backend**: Solo se activa cuando cambian archivos en `backend/`
- **Despliegue Frontend**: Se activa con cualquier cambio (predeterminado de Vercel)

### Despliegue Manual

**Backend (Azure)**:
- GitHub → Actions → Seleccionar flujo de trabajo → "Run workflow"

**Frontend (Vercel)**:
- Panel de Vercel → Tu Proyecto → Deployments → "Redeploy"

---

## Monitorización y Solución de Problemas

### Monitorización del Backend (Azure App Service)

**Ver Logs:**
```bash
# Portal de Azure → App Service → Secuencia de registro
# O usar Azure CLI
az webapp log tail --name pi-backend --resource-group tu-grupo-recursos
```

**Problemas Comunes:**

1. **La Aplicación No Inicia**
   - Verificar que las variables de entorno están configuradas correctamente
   - Verificar que PORT está establecido en 8080
   - Revisar logs para mensajes de error

2. **Fallo de Conexión a Base de Datos**
   - Verificar que el firewall de MySQL permite servicios de Azure
   - Comprobar que MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD son correctos
   - Probar conexión desde Azure Cloud Shell:
     ```bash
     mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p
     ```

3. **Errores 502/503**
   - La aplicación se bloqueó o no responde
   - Revisar logs para errores
   - Reiniciar App Service: Portal de Azure → Información general → Reiniciar

### Monitorización del Frontend (Vercel)

**Ver Logs:**
- Panel de Vercel → Proyecto → Deployments → Seleccionar despliegue → Logs

**Problemas Comunes:**

1. **Fallan las Llamadas API**
   - Verificar que la variable de entorno API_URL está configurada
   - Comprobar que el backend responde: `curl https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net/api/sensors`
   - Revisar la consola del navegador para errores CORS

2. **Fallos de Compilación**
   - Revisar logs de compilación en el Panel de Vercel
   - Verificar que todas las dependencias están en package.json
   - Probar compilación localmente: `cd frontend && npm run build`

3. **Se Muestra Contenido Antiguo**
   - Vercel cachea agresivamente
   - Forzar redespliegue desde el Panel de Vercel
   - Limpiar caché del navegador

### Monitorización de Base de Datos (Azure MySQL)

**Comprobar Estado de Base de Datos:**
- Portal de Azure → Tu Servidor MySQL → Supervisión → Métricas

**Conectar a Base de Datos:**
```bash
mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p mydatabase
```

**Problemas Comunes:**

1. **Tiempo de Espera de Conexión Agotado**
   - Firewall no configurado correctamente
   - Añadir tu IP: Portal de Azure → Servidor MySQL → Redes

2. **Acceso Denegado**
   - Verificar formato de nombre de usuario (debe ser solo `juandiegombr`, no `juandiegombr@projecte-db`)
   - Verificar que la contraseña es correcta

3. **Errores SSL**
   - Azure MySQL requiere SSL por defecto
   - La configuración de Sequelize incluye ajustes SSL (ya configurado)

---

## Estimación de Costos

### Costos de Azure (Mensuales)

| Servicio | Nivel | Costo Estimado |
|---------|------|----------------|
| App Service | Basic B1 | ~$13/mes |
| Azure Database for MySQL | Burstable B1ms | ~$12-15/mes |
| Almacenamiento | 20-32 GB | ~$2-3/mes |
| **Total Azure** | | **~$27-31/mes** |

### Costos de Vercel

| Nivel | Costo | Límites |
|------|------|---------|
| Hobby (Gratuito) | $0/mes | 100 GB ancho de banda, proyectos ilimitados |
| Pro | $20/mes | 1 TB ancho de banda, características avanzadas |

**Costo Total del Proyecto**: **~$27-31/mes** (usando nivel gratuito de Vercel)

### Consejos para Optimización de Costos

1. **Usar Niveles Gratuitos**: Vercel Hobby es suficiente para proyectos pequeños
2. **Reducir Escala**: Usar nivel Burstable para MySQL durante desarrollo
3. **Apagado Automático**: Detener App Service durante horas sin uso (manual)
4. **Monitorizar Uso**: Revisar regularmente Azure Cost Management

---

## Mejores Prácticas de Seguridad

### 1. Seguridad de Base de Datos

- ✅ Habilitar conexiones SSL (ya configurado)
- ✅ Restringir firewall a IPs específicas
- ✅ Usar contraseñas fuertes
- ✅ Copias de seguridad regulares habilitadas (predeterminado de Azure)
- ⚠️ Nunca hacer commit de credenciales de base de datos a Git

### 2. Seguridad de Aplicación

- ✅ Usar variables de entorno para secretos
- ✅ Mantener dependencias actualizadas: `npm audit`
- ✅ Habilitar solo HTTPS (predeterminado de Azure/Vercel)
- ⚠️ Implementar limitación de tasa para APIs
- ⚠️ Añadir autenticación/autorización si es necesario

### 3. Secretos de GitHub

Almacenar datos sensibles en GitHub Secrets:
- Perfiles de publicación de Azure
- Contraseñas de base de datos
- Claves API

**Nunca** codificar secretos en el código o hacer commit de ellos al repositorio.

---

## Copia de Seguridad y Recuperación ante Desastres

### Copias de Seguridad de Base de Datos (Azure MySQL)

**Copias de Seguridad Automáticas:**
- Azure MySQL hace copias de seguridad automáticas de tu base de datos
- Retención: 7 días (predeterminado) hasta 35 días
- Restauración a un punto en el tiempo disponible

**Copia de Seguridad Manual:**
```bash
mysqldump -h projecte-db.mysql.database.azure.com -u juandiegombr -p mydatabase > backup.sql
```

**Restaurar desde Copia de Seguridad:**
- Portal de Azure → Servidor MySQL → Copia de seguridad y restauración
- O restaurar desde copia de seguridad manual:
  ```bash
  mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p mydatabase < backup.sql
  ```

### Recuperación de Aplicación

**Backend:**
- Código almacenado en GitHub (control de versiones)
- Redesplegar desde cualquier commit mediante GitHub Actions
- Configuración de App Service respaldada en Azure

**Frontend:**
- Código almacenado en GitHub
- Vercel mantiene historial de despliegues
- Revertir a despliegue anterior en Panel de Vercel

---

## Recursos Adicionales

### Documentación Oficial

- [Documentación de Azure App Service](https://docs.microsoft.com/es-es/azure/app-service/)
- [Documentación de Azure MySQL](https://docs.microsoft.com/es-es/azure/mysql/)
- [Documentación de Vercel](https://vercel.com/docs)
- [Despliegue de Next.js](https://nextjs.org/docs/deployment)

### Comandos Útiles

**Azure CLI:**
```bash
# Iniciar sesión en Azure
az login

# Listar App Services
az webapp list --output table

# Ver logs de App Service
az webapp log tail --name pi-backend --resource-group tu-rg

# Reiniciar App Service
az webapp restart --name pi-backend --resource-group tu-rg
```

**MySQL:**
```bash
# Conectar a base de datos
mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p

# Listar bases de datos
SHOW DATABASES;

# Usar base de datos
USE mydatabase;

# Mostrar tablas
SHOW TABLES;
```

---

## Soporte

Para problemas o preguntas:

1. Consultar la sección de [Solución de Problemas](#monitorización-y-solución-de-problemas)
2. Revisar logs de despliegue en Portal de Azure o Panel de Vercel
3. Abrir un issue en el repositorio de GitHub
4. Consultar la documentación oficial enlazada arriba

---

**Última Actualización**: Febrero 2026
**Mantenido Por**: Juan Diego Martín-Blas Ramos
