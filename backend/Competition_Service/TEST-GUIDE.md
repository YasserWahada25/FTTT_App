# 🧪 Guide de Test Complet - Competition Service

## 🚀 Démarrage de l'Application

### 1. Démarrer MySQL
Assurez-vous que MySQL est en cours d'exécution sur le port 3306.

### 2. Lancer l'application
```bash
.\mvnw.cmd spring-boot:run
```

Attendez le message :
```
Started CompetitionServiceApplication in X.XXX seconds
```

---

## 📬 PARTIE 1 : Tests CRUD Complets

### Test 1 : Créer une Compétition (POST)

**Requête :**
```bash
curl -X POST http://localhost:8081/api/competitions ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Ligue 1\",\"description\":\"Championnat national\",\"location\":\"Tunisie\",\"startDate\":\"2026-03-01T10:00:00\",\"endDate\":\"2026-06-01T18:00:00\",\"status\":\"SCHEDULED\",\"category\":\"CHAMPIONNAT\"}"
```

**Résultat attendu :** Code 201 CREATED
```json
{
  "id": 1,
  "name": "Ligue 1",
  "description": "Championnat national",
  "location": "Tunisie",
  "startDate": "2026-03-01T10:00:00",
  "endDate": "2026-06-01T18:00:00",
  "status": "SCHEDULED",
  "category": "CHAMPIONNAT",
  "createdAt": "2026-03-02T23:15:30.123456"
}
```

### Test 2 : Créer une Deuxième Compétition (POST)

**Requête :**
```bash
curl -X POST http://localhost:8081/api/competitions ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Coupe Nationale\",\"description\":\"Coupe de football\",\"location\":\"France\",\"startDate\":\"2026-04-10T15:00:00\",\"endDate\":\"2026-04-10T17:00:00\",\"status\":\"SCHEDULED\",\"category\":\"COUPE\"}"
```

### Test 3 : Créer une Troisième Compétition (POST)

**Requête :**
```bash
curl -X POST http://localhost:8081/api/competitions ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Tournoi Amical\",\"description\":\"Match amical\",\"location\":\"Maroc\",\"startDate\":\"2026-05-15T14:00:00\",\"endDate\":\"2026-05-15T16:00:00\",\"status\":\"SCHEDULED\",\"category\":\"AMICAL\"}"
```

### Test 4 : Récupérer Toutes les Compétitions (GET)

**Requête :**
```bash
curl http://localhost:8081/api/competitions
```

**Résultat attendu :** Code 200 OK avec liste de 3 compétitions

### Test 5 : Récupérer une Compétition par ID (GET)

**Requête :**
```bash
curl http://localhost:8081/api/competitions/1
```

**Résultat attendu :** Code 200 OK avec les détails de la Ligue 1

### Test 6 : Mettre à Jour une Compétition (PUT)

**Requête :**
```bash
curl -X PUT http://localhost:8081/api/competitions/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Ligue 1 - Saison 2026\",\"description\":\"Championnat national modifié\",\"location\":\"Tunisie\",\"startDate\":\"2026-03-01T10:00:00\",\"endDate\":\"2026-06-01T18:00:00\",\"status\":\"ONGOING\",\"category\":\"CHAMPIONNAT\"}"
```

**Résultat attendu :** Code 200 OK avec les données mises à jour

### Test 7 : Supprimer une Compétition (DELETE)

**Requête :**
```bash
curl -X DELETE http://localhost:8081/api/competitions/3
```

**Résultat attendu :** Code 204 NO CONTENT

---

## 📅 PARTIE 2 : Tests API Calendrier

### Test 8 : Récupérer Toutes les Compétitions pour Calendrier

**Requête :**
```bash
curl http://localhost:8081/api/competitions/calendar
```

**Résultat attendu :** Code 200 OK
```json
[
  {
    "name": "Ligue 1 - Saison 2026",
    "location": "Tunisie",
    "startDate": "2026-03-01T10:00:00",
    "category": "CHAMPIONNAT"
  },
  {
    "name": "Coupe Nationale",
    "location": "France", 
    "startDate": "2026-04-10T15:00:00",
    "category": "COUPE"
  }
]
```

### Test 9 : Filtrer par Catégorie

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?category=CHAMPIONNAT"
```

**Résultat attendu :** Seulement les compétitions de type CHAMPIONNAT

### Test 10 : Filtrer par Lieu

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?location=Tunisie"
```

**Résultat attendu :** Seulement les compétitions en Tunisie

### Test 11 : Filtrer par Lieu (Recherche Partielle)

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?location=tun"
```

**Résultat attendu :** Les compétitions contenant "tun" dans le lieu (insensible à la casse)

### Test 12 : Filtrer par Date de Début

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?startDate=2026-04-01T00:00:00"
```

**Résultat attendu :** Compétitions qui commencent après le 1er avril 2026

### Test 13 : Filtrer par Intervalle de Dates

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?startDate=2026-03-01T00:00:00&endDate=2026-04-01T00:00:00"
```

**Résultat attendu :** Compétitions entre mars et avril 2026

### Test 14 : Filtres Combinés

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?category=CHAMPIONNAT&location=Tunisie"
```

**Résultat attendu :** Championnats en Tunisie uniquement

### Test 15 : Vérifier le Tri par Date

**Requête :**
```bash
curl http://localhost:8081/api/competitions/calendar
```

**Vérification :** Les compétitions doivent être triées par startDate (ordre croissant)

---

## ❌ PARTIE 3 : Tests d'Erreurs

### Test 16 : Validation - Nom Manquant (400)

**Requête :**
```bash
curl -X POST http://localhost:8081/api/competitions ^
  -H "Content-Type: application/json" ^
  -d "{\"description\":\"Test\",\"status\":\"SCHEDULED\",\"category\":\"CHAMPIONNAT\"}"
```

**Résultat attendu :** Code 400 BAD REQUEST

### Test 17 : Ressource Non Trouvée (404)

**Requête :**
```bash
curl http://localhost:8081/api/competitions/999
```

**Résultat attendu :** Code 404 NOT FOUND

### Test 18 : Catégorie Invalide pour Calendrier

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?category=INVALID"
```

**Résultat attendu :** Code 400 BAD REQUEST

### Test 19 : Format Date Invalide

**Requête :**
```bash
curl "http://localhost:8081/api/competitions/calendar?startDate=invalid-date"
```

**Résultat attendu :** Code 400 BAD REQUEST

---

## 🎯 Valeurs Valides pour les ENUMs

### CompetitionStatus
- `SCHEDULED` - Programmée
- `ONGOING` - En cours
- `FINISHED` - Terminée
- `CANCELLED` - Annulée

### CompetitionCategory
- `CHAMPIONNAT` - Championnat
- `COUPE` - Coupe
- `AMICAL` - Match amical
- `TOURNOI` - Tournoi

---

## 📊 Comparaison des Deux APIs

| Aspect | `/competitions` | `/competitions/calendar` |
|--------|-----------------|-------------------------|
| **Objectif** | CRUD complet | Affichage calendrier |
| **Champs** | 8 champs complets | 4 champs essentiels |
| **Filtres** | Aucun | Category, location, dates |
| **Tri** | Pas de tri | Trié par startDate |
| **Usage** | Administration | Frontend calendrier |

---

## 📊 Vérification dans MySQL

### Se connecter à MySQL
```bash
mysql -u root -p
```

### Vérifier la base de données
```sql
USE Competition_Service_db;
SHOW TABLES;
SELECT * FROM competitions;
```

---

## 🔍 Vérification des Logs

Dans la console, vous devriez voir :
```
INFO  - Création d'une nouvelle compétition : Ligue 1
DEBUG - Hibernate: insert into competitions ...
INFO  - Compétition créée avec succès avec l'ID : 1
INFO  - Récupération du calendrier des compétitions avec filtres
```

---

## ✅ Checklist de Test Complète

### CRUD Tests
- [ ] POST /api/competitions retourne 201
- [ ] GET /api/competitions retourne 200
- [ ] GET /api/competitions/{id} retourne 200
- [ ] PUT /api/competitions/{id} retourne 200
- [ ] DELETE /api/competitions/{id} retourne 204

### Calendar Tests
- [ ] GET /api/competitions/calendar retourne 200
- [ ] Filtre par category fonctionne
- [ ] Filtre par location fonctionne
- [ ] Filtre par dates fonctionne
- [ ] Filtres combinés fonctionnent
- [ ] Tri par startDate fonctionne
- [ ] Recherche partielle location fonctionne

### Error Tests
- [ ] Validation fonctionne (400 si nom manquant)
- [ ] ResourceNotFoundException fonctionne (404)
- [ ] Paramètres invalides retournent 400

### Data Tests
- [ ] Les données sont persistées dans MySQL
- [ ] Les logs s'affichent correctement
- [ ] Le tri calendrier est correct

---

## 🎉 Test Complet Réussi

Si tous les tests passent, votre microservice avec fonctionnalité calendrier est **100% fonctionnel** !

**Fonctionnalités validées :**
- ✅ CRUD complet des compétitions
- ✅ API calendrier optimisée
- ✅ Filtrage avancé (catégorie, lieu, dates)
- ✅ Tri automatique par date
- ✅ Gestion d'erreurs robuste
- ✅ Validation des données

---

**Bon test ! 🚀**
