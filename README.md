---
title: WEB SERVICE
emoji: 🚀
colorFrom: indigo
colorTo: green
sdk: docker
pinned: false
---

# GED WEB SERVICE API

Secure Flask API for file handling with React monitoring interface.

## Features
- File upload endpoint with validation
- MD5 hash generation
- Environment-specific security
- PostgreSQL integration
- React/Vite monitoring dashboard
- Gzip compression & CORS support

## Prerequisites
- Python 3.7+
- Node 22+
- PostgreSQL
- Docker (optional)

## Installation
```bash
# Clone repository
git clone https://gitlab.byos.mg/swisslife/ged-ws.git

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd MONITORING
yarn install
```

## Configuration
### Backend (.env)
```ini
# Chemin de depôt des fichiers
UPLOAD_FOLDER_JPG_LOCAL=./uploads/jpg
UPLOAD_FOLDER_JPG_DEPOT_TEST=/Depot2
UPLOAD_FOLDER_JPG_DEPOT=/Depot
UPLOAD_FOLDER_PDF=./uploads/pdf

# Chemin des fichiers de rapport
REPORT_FOLDER=./report
MD5_LIST_FILE=md5_list.txt
LOG_FILE=actions.log

# X-API-Key
API_KEY_PROD=prod_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_KEY_DEV=dev_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_KEY_TEST=test_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENCRYPTION_KEY=us2yBfctCgGxxxxxxxxxxxxxxxxxxxxxxxxxxx=

# PORT 
PORT_PROD=6003
PORT_DEV=6001
PORT_TEST=6002

# valeur par defaut
FACTURE_PAR_DEFAUT = FACTURE_TEST
PS_PAR_DEFAUT = PS_TEST

# Configuration base de données
DB_HOST_TEST=localhost
DB_PORT_TEST=5432
DB_NAME_TEST=base_test
DB_USER_TEST=user_test
DB_PASSWORD_TEST=pass_test

DB_HOST_DEV=localhost
DB_PORT_DEV=5432
DB_NAME_DEV=base_dev
DB_USER_DEV=user_dev
DB_PASSWORD_DEV=pass_dev

DB_HOST_PROD=localhost
DB_PORT_PROD=5432
DB_NAME_PROD=base_prod
DB_USER_PROD=user_prod
DB_PASSWORD_PROD=pass_prod
```
### Frontend (Environment Variables)
```ini
cd MONITORING

mkdir .env.dev
# .env.dev
VITE_API_URL=http://localhost:6001
VITE_PREFIXE_URL=/ws-dev
VITE_API_KEY=dev_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

mkdir .env.test
# .env.test
VITE_API_URL=http://app.cbp.ged.openstack.local
VITE_PREFIXE_URL=/ws-test
VITE_API_KEY=test_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

mkdir .env.prod
# .env.prod
VITE_API_URL=http://app.cbp.ged.openstack.local
VITE_PREFIXE_URL=/ws
VITE_API_KEY=prod_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

```


## Running the Application
### Backend
```bash
# Development mode
bash start_dev.sh

# Production mode
bash start_prod.sh

# Testing mode
bash start_test.sh
```

### Frontend Monitoring
```bash
cd MONITORING

# Start dev server
yarn dev

# Build for environments
yarn build:dev    # → build/ for development
yarn build:test   # → build/ for testing
yarn build:prod   # → build/ for production

# Preview build
yarn start
```


## API Endpoints

### Upload File
`POST /ws/api/file/upload_received`

**Headers:**
- `X-API-Key: [ENVIRONMENT_API_KEY]`
- `Content-Type: multipart/form-data`

**Body:**
| Field          | Type       | Required | Description                                  |
|----------------|------------|----------|----------------------------------------------|
| file           | File (PDF) | Yes      | PDF file to upload                           |
| filename       | String     | Yes      | Original filename                            |
| md5            | String     | Yes      | MD5 checksum of the file                     |
| num_facture    | String     | Yes      | Invoice number                               |
| num_ps         | String     | Yes      | Internal reference code                      |
| nni            | String     | Optional | User identification number                   |
| date_reception | String     | Yes      | Reception date (format: `YYYYMMDD`)          |
| project_id     | String     | Yes      | Project ID (e.g., `NE0101` for SE project)        |


**Response:**
```json
{
  "message": "File successfully received, validated and stored",
  "filename": "example.pdf",
  "md5": "d41d8cd98f00b204e9800998ecf8427e",
  "size_bytes": 132489,
  "num_facture": "INV-202507",
  "num_ps": "PS-9999",
  "nni": "1234567890123456",
  "date_reception": "20250715",
  "file_path": "/var/www/files/2025-07-15/example.pdf",
  "conversion_job_id": "1721724849.678021",
  "conversion_status": "queued"
}
```

## Security
API endpoints are protected by environment-specific keys:
- Production: `API_KEY_PROD` from .env
- Development: `API_KEY_DEV` from .env
- Testing: `API_KEY_TEST` from .env

Include the appropriate key in `X-API-Key` header for all requests to `/ws/api/` endpoints.

## Error Handling
**401 Unauthorized:**
```json
{"error": "Unauthorized: Invalid or missing X-API-Key."}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "Full traceback here..."
}
```

## Docker Deployment
```bash
# Build frontend
docker build -t ged-monitoring -f monitoring.Dockerfile .

# Run backend
docker run -p 6001:6001 --env-file .env ged-backend

# Run frontend
docker run -p 5173:5173 ged-monitoring
```

## Environment Management
### Backend Environments
| Environment | Port  | API Key Variable |
|-------------|-------|------------------|
| Development | 6001  | `API_KEY_DEV`    |
| Testing     | 6002  | `API_KEY_TEST`   |
| Production  | 6003  | `API_KEY_PROD`   |

### Frontend Builds
```bash
# Development build (localhost)
yarn build:dev

# Test build (staging)
yarn build:test

# Production build (live)
yarn build:prod
```

## Monitoring Interface Features
- Real-time conversion status
- File processing metrics
- API health checks
- Environment switcher (dev/test/prod)
- Error rate visualization
- Download converted files

Access dashboard at: `http://localhost:3000` (dev) after running `yarn dev`