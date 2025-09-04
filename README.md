# 📋 Projects Microservice

## 🎯 **Vue d'Ensemble**

Ce microservice gère l'écosystème de projets de Nexus avec **2 entités principales** :
- **📋 Projets** - Création, suivi et gestion des ressources (PDF)
- **👥 Affectations** - Relations many-to-many entre projets et étudiants

Le service offre des **fonctionnalités avancées** : upload de fichiers PDF, toggle de statuts, filtrage par créateur/statut, et gestion complète du cycle de vie des projets.

---

## ⚙️ **Configuration & Variables d'Environnement**

### 🔧 Fichier de Configuration

Copiez le fichier de configuration exemple et adaptez-le :

```bash
cp .env.example .env
```

### 📝 Variables Disponibles

| Variable | Description | Valeur Exemple | Obligatoire |
|----------|-------------|----------------|-------------|
| `PORT` | Port d'écoute du service | `3003` | ❌ |
| `NODE_ENV` | Environnement d'exécution | `development` | ✅ |
| `SUPABASE_URL` | URL de votre instance Supabase | `https://xxx.supabase.co` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé de service Supabase (admin) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `FRONTEND_URL` | URL du frontend pour CORS | `http://localhost:3000` | ✅ |
| `JWT_SECRET` | Token JWT pour authentification login | `jwtsecrethere` | ✅ |

### 🔐 **Configuration Supabase**

```bash
# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

> ⚠️ **Important** : Utilisez la **Service Role Key** pour les opérations backend, pas la clé publique !

### 🌐 **Configuration CORS**

```bash
# Frontend URL pour CORS
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 **Démarrage Rapide**

### 📦 Installation

```bash
# Installation des dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# ✏️ Éditez le fichier .env avec vos valeurs

# Démarrage du service
npm start
```

### 🌐 Accès au Service

- **Service** : http://localhost:3003
- **Documentation API** : http://localhost:3003/api-docs 📖

---

## 📋 **API Endpoints**

### 📋 **Routes Project**

<details>
<summary><strong>🔽 Gestion des Projets (10 endpoints)</strong></summary>

| Méthode | Endpoint | Description | Codes Retour |
|---------|----------|-------------|--------------|
| 🔍 `GET` | `/projects` | Récupérer tous les projets | `200` |
| 🔍 `GET` | `/projects/:id` | Récupérer un projet par ID | `200`, `404` |
| 🔍 `GET` | `/projects/creator/:id_creator` | Projets par créateur | `200` |
| 🔍 `GET` | `/projects/status/:status` | Projets par statut (active/inactive) | `200` |
| ➕ `POST` | `/projects` | Créer un nouveau projet | `201`, `400`, `409` |
| ✏️ `PATCH` | `/projects/:id` | Modifier les détails d'un projet | `200`, `400`, `404` |
| 🔄 `PATCH` | `/projects/toggle/:id` | Basculer le statut actif/inactif | `200`, `404` |
| ❌ `DELETE` | `/projects/:id` | Supprimer un projet | `200`, `404` |
| 📎 `POST` | `/projects/resource/:id` | Upload fichier PDF comme ressource | `201`, `400`, `404` |
| 📎 `GET` | `/projects/resource/:id` | Télécharger la ressource PDF | `200`, `404` |

</details>

### 👥 **Routes Project-Student**

<details>
<summary><strong>🔽 Gestion des Affectations (6 endpoints)</strong></summary>

| Méthode | Endpoint | Description | Codes Retour |
|---------|----------|-------------|--------------|
| 🔍 `GET` | `/project-students` | Toutes les associations projet-étudiant | `200` |
| 🔍 `GET` | `/project-students/project/:id_project` | Étudiants d'un projet spécifique | `200` |
| 🔍 `GET` | `/project-students/student/:id_student` | Projets d'un étudiant spécifique | `200` |
| ➕ `POST` | `/project-students` | Assigner un étudiant à un projet | `201`, `400`, `409` |
| ✏️ `PATCH` | `/project-students/:id` | Modifier une association | `200`, `400`, `404` |
| ❌ `DELETE` | `/project-students/:id` | Retirer un étudiant d'un projet | `200`, `404` |

</details>

---

## 🏗️ **Modèles de Données**

### 📋 **Project**
```json
{
  "id": "uuid",
  "title": "string (requis)",
  "description": "string",
  "status": "string (active/inactive)",
  "deadline": "ISO 8601 date",
  "is_active": "boolean",
  "id_creator": "uuid",
  "resource_url": "string (PDF path)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### 👥 **Project-Student**
```json
{
  "id": "uuid",
  "id_project": "uuid (requis)",
  "id_student": "uuid (requis)",
  "assigned_date": "timestamp",
  "role": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## ✨ **Fonctionnalités Avancées**

### 📎 **Gestion des Ressources**

| Fonctionnalité | Description | Endpoint |
|---------------|-------------|----------|
| **📄 Upload PDF** | Téléversement de fichiers PDF | `POST /projects/resource/:id` |
| **📥 Download PDF** | Téléchargement des ressources | `GET /projects/resource/:id` |
| **🔗 Stockage Sécurisé** | Gestion des chemins et permissions | - |

### 🔄 **Gestion des Statuts**

| Statut | Description | Toggle |
|--------|-------------|---------|
| **✅ Actif** | Projet visible et accessible | `PATCH /projects/toggle/:id` |
| **❌ Inactif** | Projet masqué temporairement | `PATCH /projects/toggle/:id` |
| **🔍 Filtrage** | Recherche par statut | `GET /projects/status/:status` |

### 🔍 **Fonctionnalités de Filtrage**

- **Par Créateur** : Projets d'un utilisateur spécifique
- **Par Statut** : Active/Inactive filtering
- **Par Étudiant** : Projets assignés à un étudiant
- **Par Projet** : Étudiants d'un projet donné

### 🛡️ **Validations & Sécurité**

| Type | Contrôle | Action |
|------|----------|--------|
| **🚫 Anti-Doublon** | Assignation unique étudiant-projet | HTTP 409 |
| **📋 Champs Requis** | Validation titre, IDs | HTTP 400 |
| **📎 Type de Fichier** | PDF uniquement pour resources | HTTP 400 |
| **🔗 Relations** | Vérification existence projet/étudiant | HTTP 404 |

---

## 📖 **Documentation Interactive**

### 🌐 **Swagger UI**

Explorez l'API de manière interactive :

**[📋 Documentation Swagger Complète](http://localhost:3003/api-docs)**

**Fonctionnalités disponibles :**
- 🧪 **Tests directs** des 16 endpoints
- 📋 **Schémas de données** détaillés
- 📎 **Upload de fichiers** testable
- 🔍 **Filtres** et paramètres expliqués
- 💡 **Exemples** de requêtes et réponses

---

## 🧪 **Tests**

### ▶️ Exécution des Tests

```bash
# Tests complets
npm test

# Tests spécifiques
npm test __tests__/projectRoutes.tests.js
npm test __tests__/projectStudentsRoutes.tests.js

# Tests avec coverage
npm run test:coverage
```

### 📊 **Couverture de Tests**

- ✅ **29 tests** au total
- ✅ **Project Routes** : 14 tests (dont upload/download)
- ✅ **Project-Students Routes** : 15 tests
- ✅ **Gestion fichiers** : Tests upload/download PDF
- ✅ **Toggle statuts** : Tests activation/désactivation
- ✅ **Cas d'erreur** et validations inclus

---

## 📎 **Gestion des Fichiers**

### 🔧 **Configuration Upload**

```javascript
// Multer configuration pour PDF
const storage = multer.diskStorage({
  destination: './uploads/projects/',
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}-${Date.now()}.pdf`)
  }
})
```

### 📝 **Restrictions**
- **Format** : PDF uniquement
- **Taille** : Limite configurable
- **Stockage** : Local avec chemin en base
- **Sécurité** : Validation type MIME

---

## 🚀 **Production & Déploiement**

### 🔧 **Variables Production**

```bash
NODE_ENV=production
PORT=3003
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
FRONTEND_URL=https://votre-domaine.com
```

### 🐳 **Docker**

Le service est inclus dans le `docker-compose.yml` principal du projet Nexus.

### 📁 **Volumes & Stockage**
```yaml
volumes:
  - ./uploads:/app/uploads  # Persistance des fichiers PDF
```

---

## 🔄 **Intégrations**

### 🌐 **Services Connectés**
- **Profile Service** : Validation créateurs et étudiants
- **Auth Service** : Authentification pour uploads
- **Frontend** : Interface de gestion des projets

### 📡 **APIs Externes**
- **Supabase Storage** : Alternative pour stockage cloud
- **File Validation** : Contrôle des types MIME

---

**📋 Projects Service** - *Part of Nexus Ecosystem*  

🔗 **[Retour au projet principal](https://github.com/T-YEP-Nexus/frontend)**
