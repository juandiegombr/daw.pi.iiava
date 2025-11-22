# Arquitectura de Despliegue en AWS

Este documento describe la infraestructura de despliegue en AWS para el Proyecto DAW, incluyendo alojamiento del frontend, servicios backend y flujos de despliegue continuo.

**[Read this in English](docs/AWS_DEPLOYMENT_EN.md)**

## Visión General de la Arquitectura

La aplicación está desplegada en AWS utilizando una arquitectura moderna y escalable:

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront                           │
│                                                             │
│  ┌──────────────────────┐    ┌─────────────────────────┐    │
│  │   /* (Frontend)      │    │   /api/* (Backend)      │    │
│  │   ↓                  │    │   ↓                     │    │
│  │   Bucket S3          │    │   Origen EC2            │────┼──────--------─┐
│  └────────┬─────────────┘    └───────────┬─────────────┘    │               |
└───────────┬──────────────────────────────┬──────────────────┘               |
            |                              |                                  |
    ┌───────┴─────────┐          ┌─────────┴──────────┐            ┌──────────┴─────────┐
    │  S3 (Bucket)    │          │  EC2 (Node Server) │            |   EC2 (MongoDB)    │
    │ Frontend: React │          │  Backend: Express  │            │   Base de Datos    │
    │                 │          │  Puerto: 3000      │            │   Puerto: 27017    │
    └───────┬─────────┘          └─────────┬──────────┘            └────────────────────┘
            |                              |
    ┌───────┴─────────┐          ┌─────────┴──────────┐
    │  GitHub Actions │          │  GitHub Actions    │
    │  (Frontend CD)  │          │  (Backend CD)      │
    └─────────────────┘          └────────────────────┘
```

**Beneficios Clave:**

- Origen único para frontend y backend (sin problemas de CORS)
- Distribución CDN global mediante CloudFront
- HTTPS/SSL automático
- Despliegues automatizados mediante GitHub Actions
- Invalidación de caché en actualizaciones

---

## Configuración Inicial para AWS

Antes de configurar GitHub Actions o crear entidades de AWS, es una buena práctica crear un usuario en lugar de crearlas con el usuario root. Para ello, necesitas crear un usuario IAM con acceso programático y asignar los permisos necesarios.

1. Crear Usuario IAM
2. Establecer Permisos
3. Crear Claves de Acceso y almacenarlas en un almacenamiento local.
   - **ID de clave de acceso**: Algo como `AKIAIOSFODNN7EXAMPLE`
   - **Clave de acceso secreta**: Algo como `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
4. Configurar la CLI de `aws` con `aws configure --profile mi-usuario`

## Infraestructura del Frontend

### **S3:**

- **Nombre del bucket**: `daw-pi-iava-frontend`
- **Propósito**: Alojamiento de sitio web estático para artefactos de compilación de React
- **Configuración:**
  - Alojamiento web estático habilitado
  - Política del bucket permite acceso de CloudFront
  - No accesible públicamente (solo CloudFront)

### Proceso de Despliegue

**Activador:** Automático al hacer push a la rama `main` cuando cambian archivos del frontend, o manual mediante `workflow_dispatch`

**Pasos:**

1. Checkout del repositorio
2. Configurar Node.js (v22)
3. Instalar dependencias (`npm ci`)
4. Compilar aplicación React (`npm run build`)
5. Configurar credenciales de AWS
6. Sincronizar artefactos de compilación al bucket S3 (con bandera `--delete` para eliminar archivos antiguos)
7. Invalidar caché de CloudFront para la ruta `/*`

**Secretos de GitHub Requeridos:**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

---

## Despliegue del Backend

### **Instancia EC2:**

- Propósito: Alojar API Node.js/Express
- Gestor de Procesos: PM2 (nombre del proceso: `api`)
- Ubicación del Repositorio: `~/daw.pi.iava/backend`
- Acceso: Autenticación basada en clave SSH

### Configuración de la Instancia EC2

#### Configuración Inicial de la Instancia

1. **Lanzar Instancia EC2:**

   - AMI: Amazon Linux 2 o Ubuntu 22.04
   - Tipo de Instancia: t2.micro o superior
   - Grupo de Seguridad: Permitir HTTP (80), HTTPS (443), SSH (22)
   - Par de Claves: Crear y descargar para acceso SSH

2. **Instalar Dependencias:**

```bash
ssh -i tu-clave.pem <UBUNTU_USER>@<EC2_PUBLIC_IP>

sudo apt update -y
sudo apt upgrade -y
sudo apt install -y curl git build-essential

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2
```

3. **Clonar Repositorio:**

```bash
cd ~
git clone <url-del-repositorio> daw.pi.iava
cd daw.pi.iava/backend
npm install
```

4. **Configurar PM2:**

```bash
pm2 start src/index.js --name api
pm2 startup
pm2 save
```

#### Configuración del Grupo de Seguridad

```
Reglas de Entrada:
- Tipo: SSH, Puerto: 22, Origen: Tu IP o 0.0.0.0/0
- Tipo: HTTP, Puerto: 80, Origen: 0.0.0.0/0
- Tipo: TCP Personalizado, Puerto: 3000, Origen: IPs de CloudFront (o grupo de seguridad)
```

### Proceso de Despliegue

**Activador:** Automático al hacer push a la rama `main` cuando cambian archivos del backend, o manual mediante `workflow_dispatch`

**Pasos:**

1. SSH a la instancia EC2
2. Navegar al directorio del backend (`~/daw.pi.iava/backend`)
3. Hacer pull del código más reciente de la rama `main`
4. Instalar/actualizar dependencias (`npm install`)
5. Reiniciar proceso PM2 (`pm2 restart api`)
6. Guardar configuración PM2 (`pm2 save`)
7. Invalidar caché de CloudFront para rutas `/api/*`

**Secretos de GitHub Requeridos:**

- `AWS_EC2_HOST` - IP pública/hostname de la instancia EC2
- `AWS_EC2_USER` - Usuario SSH (típicamente `ec2-user` o `ubuntu`)
- `AWS_EC2_SSH` - Clave SSH privada para autenticación
- `AWS_ACCESS_KEY_ID` - Para invalidación de CloudFront
- `AWS_SECRET_ACCESS_KEY` - Para invalidación de CloudFront
- `AWS_REGION` - Región de AWS

---

## Infraestructura de Base de Datos

### **Instancia EC2 MongoDB:**

- **Propósito**: Alojar base de datos MongoDB
- **AMI**: Ubuntu 22.04 LTS
- **Sistema de Gestión de Base de Datos**: MongoDB Community Edition
- **Conexión**: Acceso privado desde la instancia EC2 del backend

### Configuración de la Instancia MongoDB

#### Configuración Inicial de la Instancia

1. **Lanzar Instancia EC2:**

   - AMI: Ubuntu 22.04 LTS
   - Tipo de Instancia: t2.micro o superior (t2.small recomendado para producción)
   - Grupo de Seguridad: Permitir MongoDB (27017) solo desde IP del backend, SSH (22)
   - Par de Claves: Crear y descargar para acceso SSH
   - Almacenamiento: 20-30 GB mínimo (expandible según necesidades)

2. **Instalar MongoDB:**

```bash
ssh -i tu-clave.pem ubuntu@<MONGODB_EC2_PUBLIC_IP>

# Actualizar sistema
sudo apt update -y
sudo apt upgrade -y

# Importar clave pública de MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Crear archivo de lista para MongoDB
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Actualizar repositorios e instalar MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Iniciar servicio MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar estado
sudo systemctl status mongod
```

3. **Configurar MongoDB para Acceso Remoto:**

```bash
# Editar archivo de configuración
sudo nano /etc/mongod.conf

# Modificar la sección de red para permitir conexiones remotas:
# net:
#   port: 27017
#   bindIp: 0.0.0.0  # Cambiar de 127.0.0.1 a 0.0.0.0

# Reiniciar MongoDB para aplicar cambios
sudo systemctl restart mongod
```

4. **Crear Usuario Administrativo y Base de Datos:**

```bash
# Conectar a MongoDB
mongosh

# En el shell de MongoDB:
use admin
db.createUser({
  user: "admin",
  pwd: "TU_CONTRASEÑA_SEGURA",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Crear base de datos de aplicación y usuario
use app
db.createUser({
  user: "daw_app_user",
  pwd: "TU_CONTRASEÑA_APLICACION",
  roles: [ { role: "readWrite", db: "app" } ]
})

exit
```

5. **Habilitar Autenticación:**

```bash
# Editar archivo de configuración
sudo nano /etc/mongod.conf

# Añadir al final del archivo la sección de seguridad:
security:
  authorization: enabled

# Guardar y salir (Ctrl+O, Enter, Ctrl+X)

# Reiniciar MongoDB para aplicar cambios
sudo systemctl restart mongod
```

#### Configuración del Grupo de Seguridad

**Grupo de Seguridad de la Instancia MongoDB:**

```
Reglas de Entrada:
- Tipo: SSH, Puerto: 22, Origen: Tu IP
- Tipo: TCP Personalizado, Puerto: 27017, Origen: IP privada de la instancia EC2 del backend o su grupo de seguridad
```

**Nota de Seguridad:** NUNCA exponer el puerto 27017 a `0.0.0.0/0` (internet público). Solo permitir acceso desde las IPs o grupos de seguridad específicos que necesiten conectarse.

### Conexión desde el Backend

Para conectar el backend a MongoDB, actualizar el archivo `.env` en la instancia EC2 del backend:

```bash
# En la instancia EC2 del backend
cd ~/daw.pi.iava/backend
nano .env

# Añadir/actualizar la cadena de conexión:
MONGODB_URI=mongodb://{DATABASE_USER}:{DATABASE_USER_PASSWORD}@<MONGODB_PRIVATE_IP>:27017/{DATABASE_NAME}

# Reiniciar la aplicación
pm2 restart api
```

## Configuración de CloudFront

### Configuración de la Distribución

CloudFront sirve como punto de entrada unificado para frontend y backend, proporcionando:

- Dominio/origen único (elimina complejidad de CORS)
- Terminación HTTPS/SSL
- Caché global y CDN
- Protección DDoS

### Orígenes

**Origen 1: Bucket S3 (Frontend)**

- Dominio de Origen: `daw-pi-iava-frontend.s3.amazonaws.com`
- Acceso al Origen: Control de Acceso al Origen (OAC) recomendado
- Protocolo: Solo HTTPS

**Origen 2: Instancia EC2 (Backend)**

- Dominio de Origen: `<ec2-public-ip-o-dominio>`
- Protocolo de Origen: HTTP (puerto 3000)
- Encabezados Personalizados: Se pueden añadir encabezados de autenticación si es necesario

### Comportamientos

**Comportamiento Predeterminado (/):**

- Origen: Bucket S3
- Protocolo del Visualizador: Redirigir HTTP a HTTPS
- Métodos HTTP Permitidos: GET, HEAD
- Política de Caché: CachingOptimized o personalizada
- Comprimir Objetos: Sí

**Patrón de Ruta (/api/\*):**

- Origen: Instancia EC2
- Protocolo del Visualizador: Redirigir HTTP a HTTPS
- Métodos HTTP Permitidos: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- Política de Caché: CachingDisabled (para API) o personalizada con TTL corto
- Política de Solicitud de Origen: Reenviar todos los encabezados, cadenas de consulta, cookies según sea necesario

### Invalidación de Caché

Ambos flujos de despliegue invalidan automáticamente la caché de CloudFront:

- Frontend: Invalida `/*` (todos los archivos)
- Backend: Invalida `/api/*` (rutas API)

---

## Estimación de Costos

**Costos Mensuales de AWS (aproximados):**

- EC2 t2.micro (Backend): ~$8-10/mes
- EC2 t2.micro (MongoDB): ~$8-10/mes
- CloudFront: $0-5/mes (tráfico bajo)
- S3: <$1/mes (almacenamiento mínimo)
- EBS (Almacenamiento MongoDB): ~$2-4/mes (20-30 GB)
- Transferencia de Datos: Variable según el tráfico

**Total: ~$20-35/mes** para tráfico bajo a moderado

---
