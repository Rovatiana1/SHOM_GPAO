Parfait 👌
Je vais te préparer un **document technique bien expliqué** qui couvre :

1. **Connexion LDAP**
2. **API LDT (Start, End, Next étape, Update Lot, etc.)**
3. **Requêtes SQL utiles**
4. **Insertion d’un nouveau lot**
5. **Exemple d’utilisation côté C# (Entity Framework)**
6. **Workflow complet**

---

# 📘 Documentation Technique – Gestion des Lots et Étapes

## 1. Connexion LDAP (Authentification)

**Endpoint :**

```
POST http://10.128.130.17:5000/api/Auth/ldaps
```

**Paramètres JSON :**

```json
{
  "login": "string",
  "password": "string"
}
```

**But :**

* Authentifier un utilisateur via LDAP.
* Retourne un **token** qui servira à sécuriser toutes les autres requêtes API.

---

## 2. API LDT (Lot de Travail)

### a) Démarrer un LDT (StartNewLdt)

**Endpoint :**

```
POST http://10.128.130.17:5000/api/Ldt/start
```

**Paramètres JSON :**

```json
{
  "_idDossier": "int",
  "_idEtape": "int",
  "_idPers": "int",
  "_idLotClient": "int",
  "_idLot": "int",
  "_idTypeLdt": "int"
}
```

**Explication :**

* Initialise un nouveau lot de travail pour une étape donnée.
* Met le lot en **cours de traitement**.

---

### b) Terminer un LDT (EndLdt)

**Endpoint :**

```
POST http://10.128.130.17:5000/api/Ldt/end
```

**Paramètres JSON :**

```json
{
  "_idDossier": "int",
  "_idEtape": "int",
  "_idPers": "int",
  "_idLotClient": "int",
  "_idLot": "int",
  "_idTypeLdt": "int",
  "_commentaire": "string"
}
```

**Explication :**

* Termine un lot en cours.
* Permet d’ajouter un **commentaire** (exemple : anomalie, validation, etc.).
* Change l’état du lot en **terminé (id\_etat = 3)**.

---

### c) Étape suivante (Next Etape)

**Endpoint :**

```
POST http://10.128.130.17:5000/api/Lot/inject-next-etape
```

**Paramètres JSON :**

```json
{
  "_idDossier": "int",
  "_idEtape": "int",
  "_idLotClient": "int",
  "_libelle": "string",
  "_qte": "string"
}
```

**Explication :**

* Permet de créer/injecter le même lot dans l’étape suivante du workflow.
* Utile après un **EndLdt** réussi.

---

### d) Mise à jour d’un lot (UpdateLot)

**Endpoint :**

```
POST http://10.128.130.17:5000/api/Lot/update-lot
```

**Paramètres JSON :**

```json
{
  "_idLot": "int",
  "_idEtat": "int",
  "_qte": "int"
}
```

**Explication :**

* Met à jour la **quantité** et l’**état** d’un lot.
* Exemple : passer d’"en cours" (1) à "terminé" (3).

---

### e) Récupérer le prochain lot (GetLot)

**Endpoint :**

```
POST http://10.128.130.17:5000/api/Lot/get-lot
```

**Paramètres JSON :**

```json
{
  "_idDossier": "int",
  "_idEtape": "int",
  "_idPers": "int",
  "_idLotClient": "int"
}
```

**Explication :**

* Retourne le **prochain lot disponible** pour un utilisateur donné.
* Utilisé pour chaîner **GetLot → StartNewLdt**.

---

## 3. Requêtes SQL utiles

### a) Sélection d’un lot par son ID

```sql
SELECT * FROM p_lot WHERE id_lot IN (46109788);
```

### b) Sélection des lots par dossier et lot client

```sql
SELECT * FROM p_lot 
WHERE id_dossier = 918
  AND id_lotclient = 30752;
```

### c) Sélection des lots disponibles pour une étape

```sql
SELECT * FROM p_lot 
WHERE id_etat = 0         -- état : disponible
  AND id_etape = 4673     -- étape : saisie
  AND id_dossier = 918
ORDER BY priority DESC;
```

---

## 4. Insertion d’un nouveau lot

```sql
INSERT INTO p_lot (id_dossier, id_lotclient, id_etape, libelle, id_etat)
VALUES (918, 30752, 14248, 'libelle_2', 0);
```

* `id_etat = 0` → disponible
* `id_etat = 1` → en cours
* `id_etat = 3` → terminé

---

## 5. Exemple C# (Entity Framework Core)

```csharp
// Sélection du prochain lot disponible
var nouveauLot = await masterContext.Lot
    .FromSqlRaw(@"
        SELECT * FROM ""p_lot"" 
        WHERE id_dossier = {1}
          AND ""id_etat"" = 0
          AND id_etape = {0}
        ORDER BY ""priority"" DESC
        LIMIT 1 
        FOR UPDATE",
        idEtape, idDossier, idLotClient
    ).FirstOrDefaultAsync();

if (nouveauLot != null)
{
    // Mettre à jour l'état du lot en "en cours"
    nouveauLot.IdEtat = 1;
    nouveauLot.IdPers = idPers;
    await transaction.CommitAsync();
}
```

**Explication :**

* On sélectionne le **lot disponible** (`id_etat = 0`) avec la priorité la plus haute.
* On verrouille la ligne (`FOR UPDATE`) pour éviter les collisions.
* On passe l’état en **en cours (1)** et on affecte le lot à un utilisateur.

---

## 6. Workflow complet (cas d’usage classique)

1. **Connexion LDAP** → obtenir un token.
2. **GetLot** → récupérer un lot disponible pour l’étape en cours.
3. **StartNewLdt** → démarrer le lot.
4. **Travail effectué par l’opérateur**.
5. **EndLdt** → terminer le lot (optionnel : commentaire).
6. **InjectNextEtape** → envoyer le lot à l’étape suivante.
7. **UpdateLot** → mettre à jour état/quantité si nécessaire.
8. Retour à l’étape 2 pour continuer le traitement.

---

👉 Est-ce que tu veux que je te génère ce document directement en **Word (.docx)** bien formaté (titres, tableaux, code en blocs), ou tu préfères garder ce format texte/Markdown ?
