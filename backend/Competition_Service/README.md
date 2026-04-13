# Competition Service - Microservice de Gestion des Compétitions Sportives

## 📋 Description
Microservice Spring Boot pour la gestion complète des compétitions sportives avec un CRUD REST complet.

## 🛠️ Stack Technique
- **Spring Boot** 4.0.3
- **Java** 21
- **Maven**
- **MySQL**
- **Spring Data JPA** (Hibernate)
- **Lombok**
- **Jakarta Validation**

## 📁 Architecture
```
src/main/java/com/FTTT/Competition_Service/
├── controllers/         # Contrôleurs REST
├── dto/                 # Data Transfer Objects
├── entities/            # Entités JPA
├── repositories/        # Repositories Spring Data
└── services/            # Services métier
    └── impl/           # Implémentations des services
```

## 🚀 Démarrage

### Prérequis
- Java 21
- Maven 3.8+
- MySQL 8.0+

### Configuration MySQL
1. Créer la base de données (optionnel, elle sera créée automatiquement) :
```sql
CREATE DATABASE competition_db;
```

2. Modifier les credentials dans `application.properties` si nécessaire :
```properties
spring.datasource.username=root
spring.datasource.password=root
```

### Lancer l'application
```bash
mvnw spring-boot:run
```

L'application démarre sur le port **8081**.

## 📡 API Endpoints

### Base URL
```
http://localhost:8081/api/competitions
```

### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/competitions` | Créer une compétition |
| GET | `/api/competitions` | Récupérer toutes les compétitions |
| GET | `/api/competitions/{id}` | Récupérer une compétition par ID |
| PUT | `/api/competitions/{id}` | Mettre à jour une compétition |
| DELETE | `/api/competitions/{id}` | Supprimer une compétition |

## 📬 Exemples de Requêtes

### POST - Créer une compétition
```json
POST http://localhost:8081/api/competitions
Content-Type: application/json

{
  "name": "Ligue 1",
  "description": "Championnat national de football",
  "location": "Tunisie",
  "startDate": "2026-03-01T10:00:00",
  "endDate": "2026-06-01T18:00:00",
  "status": "UPCOMING",
  "category": "CHAMPIONNAT"
}
```

### GET - Récupérer toutes les compétitions
```
GET http://localhost:8081/api/competitions
```

### GET - Récupérer une compétition par ID
```
GET http://localhost:8081/api/competitions/1
```

### PUT - Mettre à jour une compétition
```json
PUT http://localhost:8081/api/competitions/1
Content-Type: application/json

{
  "name": "Ligue 1 - Saison 2026",
  "description": "Championnat national de football - Édition 2026",
  "location": "Tunisie",
  "startDate": "2026-03-01T10:00:00",
  "endDate": "2026-06-01T18:00:00",
  "status": "ONGOING",
  "category": "CHAMPIONNAT"
}
```

### DELETE - Supprimer une compétition
```
DELETE http://localhost:8081/api/competitions/1
```

## 📊 Modèle de Données

### Entité Competition
| Champ | Type | Description |
|-------|------|-------------|
| id | Long | Identifiant unique (auto-généré) |
| name | String | Nom de la compétition (obligatoire) |
| description | String | Description |
| location | String | Lieu |
| startDate | LocalDateTime | Date de début |
| endDate | LocalDateTime | Date de fin |
| status | Enum | Statut (UPCOMING, ONGOING, FINISHED) |
| category | Enum | Catégorie (CHAMPIONNAT, COUPE, AMICAL, TOURNOI) |
| createdAt | LocalDateTime | Date de création (auto-généré) |

## ✅ Validations
- `name` : obligatoire, non vide
- `status` : obligatoire
- `category` : obligatoire

## 🔧 Codes HTTP
- **200 OK** : Succès (GET, PUT)
- **201 CREATED** : Ressource créée (POST)
- **204 NO CONTENT** : Suppression réussie (DELETE)
- **400 BAD REQUEST** : Erreur de validation
- **404 NOT FOUND** : Ressource non trouvée
- **500 INTERNAL SERVER ERROR** : Erreur serveur

## 📝 Logs
Les logs sont configurés au niveau DEBUG pour le package de l'application et les requêtes SQL sont affichées.

## 🧪 Tests
Pour tester l'API, vous pouvez utiliser :
- Postman
- cURL
- IntelliJ HTTP Client
- Swagger (à ajouter si nécessaire)

## 👨‍💻 Auteur
FTTT - Competition Service
