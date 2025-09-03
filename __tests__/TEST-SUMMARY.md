# 📊 Résumé des Tests Backend – Project & ProjectStudents Service

## 🎯 Objectif

Valider le fonctionnement complet des endpoints Project et ProjectStudents dans le service backend project-service. La suite teste les routes CRUD pour les projets et pour les affectations projet-étudiant, en incluant les cas de succès et d'erreur ainsi que les fonctionnalités spécialisées (gestion des ressources, notation, échéances).

## 🏗️ Architecture des Tests

### Project Routes (10 suites principales)

| Suite | Nombre de tests | Description |
|-------|----------------|-------------|
| `GET /projects` | 1 | Récupération de tous les projets |
| `POST /projects` | 2 | Création réussie et champs manquants |
| `GET /projects/:id` | 2 | Récupération par ID valide et ID inexistant |
| `GET /projects/creator/:id_creator` | 1 | Récupération des projets par créateur |
| `GET /projects/promotion/:id_promotion` | 2 | Récupération par promotion valide et ID invalide |
| `GET /projects/active/list` | 1 | Récupération des projets actifs |
| `PATCH /projects/:id` | 2 | Mise à jour réussie et sans champs fournis |
| `Resources Management` | 2 | Ajout et récupération des ressources |
| `PATCH /projects/:id/toggle-active` | 1 | Activation/désactivation de l'état du projet |
| `DELETE /projects/:id` | 2 | Suppression réussie et tentative sur projet déjà supprimé |

**Total : 14 tests Project**

### ProjectStudents Routes (9 suites principales)

| Suite | Nombre de tests | Description |
|-------|----------------|-------------|
| `GET /project-students` | 1 | Récupération de toutes les affectations |
| `POST /project-students` | 3 | Création réussie, doublon, champs manquants |
| `GET /project-students/:id` | 2 | Récupération par ID valide et ID inexistant |
| `GET /project-students/student/:id_student` | 1 | Récupération des affectations par étudiant |
| `GET /project-students/project/:id_project` | 1 | Récupération des affectations par projet |
| `GET /project-students/due-soon/list` | 1 | Récupération des affectations avec échéance ≤7 jours |
| `PATCH /project-students/:id` | 2 | Mise à jour réussie et sans champs fournis |
| `PATCH /project-students/:id/grade` | 2 | Notation réussie et champs manquants |
| `DELETE /project-students/:id` | 2 | Suppression réussie et tentative sur affectation déjà supprimée |

**Total : 15 tests ProjectStudents**

**Grand total : 29 tests CRUD backend**

## 🔐 Couverture Fonctionnelle

### Project Routes

- **GET /projects** – Récupération de tous les projets
- **POST /projects** – Création réussie, champs manquants (400)
- **GET /projects/:id** – Récupération par ID valide / gestion du 404
- **GET /projects/creator/:id_creator** – Filtrage par créateur
- **GET /projects/promotion/:id_promotion** – Filtrage par promotion / ID invalide (400)
- **GET /projects/active/list** – Récupération des projets actifs uniquement
- **PATCH /projects/:id** – Mise à jour réussie / gestion 400 sans champs
- **Resources Management** – Ajout et récupération des ressources projet
- **PATCH /projects/:id/toggle-active** – Gestion de l'état actif/inactif
- **DELETE /projects/:id** – Suppression et gestion du 404

### ProjectStudents Routes

- **GET /project-students** – Récupération de toutes les affectations
- **POST /project-students** – Création, doublon (409), champs manquants (400)
- **GET /project-students/:id** – Récupération par ID valide / 404 si inexistant
- **GET /project-students/student/:id_student** – Affectations par étudiant
- **GET /project-students/project/:id_project** – Affectations par projet
- **GET /project-students/due-soon/list** – Affectations avec échéance proche (≤7 jours)
- **PATCH /project-students/:id** – Mise à jour réussie / gestion 400 sans champs
- **PATCH /project-students/:id/grade** – Notation (score + commentaire) / validation champs obligatoires
- **DELETE /project-students/:id** – Suppression et tentative sur affectation déjà supprimée

## 📁 Structure des Fichiers de Test

```
__tests__/
├── projectRoutes.tests.js          # Tests CRUD Projects
├── projectStudentsRoutes.tests.js  # Tests CRUD ProjectStudents
└── README.md                       # Documentation des tests
```

## 🚀 Scripts de Test Disponibles

```bash
npm test __tests__/projectRoutes.tests.js          # Tests Project
npm test __tests__/projectStudentsRoutes.tests.js  # Tests ProjectStudents
npm test                                           # Tous les tests
```

## ✅ Statut Actuel

⚠️ **Les tests dépendent d'une instance live du serveur project-service sur [http://localhost:3003](http://localhost:3003)**

💻 **Avec le serveur et la DB opérationnelle, tous les 29 tests passent (100%)**

🔄 **Les tests incluent les scénarios succès et erreurs pour chaque route**

## 🔍 Ce qui est Testé

### Project Routes
- Intégrité des créations, mises à jour et suppressions de projets
- Validation des champs requis pour la création
- Gestion des relations (créateur, promotion)
- **Fonctionnalités spécialisées** :
  - Gestion des ressources (ajout/récupération)
  - Toggle état actif/inactif
  - Filtrage par créateur et promotion
  - Liste des projets actifs
- Gestion des erreurs (400, 404)

### ProjectStudents Routes
- Intégrité des créations, mises à jour et suppressions d'affectations
- Validation des champs requis et gestion des doublons
- **Fonctionnalités spécialisées** :
  - Système de notation (score + commentaire)
  - Gestion des échéances (affectations dues ≤7 jours)
  - Relations projet-étudiant bidirectionnelles
- Gestion des erreurs (400, 404, 409)

### Spécificités du Project Service
- **Gestion des ressources** : Ajout et récupération de ressources liées aux projets
- **Système de notation** : Validation score/max_score et commentaires
- **Gestion des échéances** : Identification des projets dus bientôt
- **États des projets** : Toggle actif/inactif pour la gestion du cycle de vie

## 🎯 Avantages de cette Approche

- **Tests complets backend** – Vérifie tous les endpoints CRUD + fonctionnalités métier
- **Validation robuste** – Cas de succès et erreurs couvert
- **Fonctionnalités spécialisées** – Tests des features uniques (notation, échéances, ressources)
- **Relations complexes** – Validation des liens projet-étudiant-créateur-promotion
- **Maintenance facile** – Tests clairs et isolés par route

## 🚀 Utilisation Recommandée

### Pour le développement quotidien :
```bash
npm test __tests__/projectRoutes.tests.js
npm test __tests__/projectStudentsRoutes.tests.js
```

### Pour la validation complète :
```bash
npm test
```

### Tests par fonctionnalité :
```bash
# Tests de gestion des ressources
npm test __tests__/projectRoutes.tests.js --grep "Resources"

# Tests de notation
npm test __tests__/projectStudentsRoutes.tests.js --grep "grade"

# Tests d'échéances
npm test __tests__/projectStudentsRoutes.tests.js --grep "due-soon"
```

## 📝 Notes de Développement

- **Service spécialisé projet** avec fonctionnalités métier avancées
- Tests de validation des relations complexes (projet-étudiant-créateur-promotion)
- Gestion des échéances avec logique temporelle (≤7 jours)
- Système de notation complet avec score et commentaires
- **Dépendances** : serveur live et base de données opérationnelle