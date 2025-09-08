Pour manipuler PostgreSQL en ligne de commande sous **Debian**, tu peux utiliser principalement deux outils :

* `psql` (le client en ligne de commande)
* `pg_ctl` (gestion du serveur PostgreSQL)

---

## 🔧 1. Se connecter à PostgreSQL

```bash
su postgres
psql -d ged_ws

or 
sudo -u postgres psql
```

> Cela te connecte à la base de données `postgres` avec l'utilisateur système `postgres`.

---

## 🗂️ 2. Commandes de base dans `psql`

Une fois connecté, tu peux utiliser :

| Commande                   | Description                        |
| -------------------------- | ---------------------------------- |
| `\l`                       | Liste les bases de données         |
| `\c nom_bdd`               | Se connecter à une base spécifique |
| `\dt`                      | Liste les tables                   |
| `\d nom_table`             | Affiche la structure d'une table   |
| `SELECT * FROM nom_table;` | Lire les données d'une table       |
| `\q`                       | Quitter `psql`                     |

---

## 🛠️ 3. Créer une base et un utilisateur

```bash
sudo -u postgres createdb nom_de_la_base
sudo -u postgres createuser nom_utilisateur --interactive
```

Tu peux aussi accorder des droits :

```bash
sudo -u postgres psql
# Puis dans psql :
GRANT ALL PRIVILEGES ON DATABASE nom_de_la_base TO nom_utilisateur;
```

---

## 🔑 4. Se connecter avec un utilisateur

```bash
psql -U nom_utilisateur -d nom_de_la_base -h localhost
```

---

## ⚙️ 5. Démarrer / arrêter / vérifier PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

---

## 📄 6. Exécuter un script SQL

```bash
psql -U nom_utilisateur -d nom_de_la_base -f chemin/vers/script.sql
```

---

## 💡 Astuce : utiliser un fichier `.pgpass`

Pour éviter de taper ton mot de passe à chaque fois, tu peux créer un fichier `~/.pgpass` :

```bash
localhost:5432:nom_de_la_base:nom_utilisateur:mot_de_passe
```

Et donner les bons droits :

```bash
chmod 600 ~/.pgpass
```

---

Souhaites-tu que je t’aide à créer une base + un utilisateur + une table avec des données de test ?



Voici un guide complet pour installer PostgreSQL sur Ubuntu et créer une base de données avec les paramètres de connexion que tu as fournis.

---

### ✅ 1. **Installer PostgreSQL**

Exécute ces commandes dans ton terminal Ubuntu :

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

---

### ✅ 2. **Créer l'utilisateur PostgreSQL**

PostgreSQL utilise son propre système d'utilisateurs. On va créer l’utilisateur `app_cbp` avec le mot de passe `G7kL9vQ2xW4m`.

```bash
sudo -u postgres psql
```

Puis dans le terminal PostgreSQL :

```sql
-- Créer l'utilisateur avec mot de passe
CREATE USER app_cbp WITH PASSWORD 'G7kL9vQ2xW4m';

-- Créer la base de données
CREATE DATABASE ged_ws OWNER app_cbp;

-- Donner les privilèges nécessaires à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE ged_ws TO app_cbp;

-- Quitter PostgreSQL
\q
```

---

### ✅ 3. **Autoriser les connexions locales**

Vérifie que le fichier `pg_hba.conf` autorise les connexions locales avec mot de passe.

Ouvre le fichier :

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Remplace (ou vérifie) cette ligne :

```
local   all             all                                     md5
```

---

### ✅ 4. **Configurer PostgreSQL pour écouter sur le bon port**

Vérifie le fichier `postgresql.conf` pour s’assurer que PostgreSQL écoute bien sur `localhost` et le port `5432`.

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Assure-toi que ces lignes ne sont pas commentées et ont ces valeurs :

```conf
listen_addresses = 'localhost'
port = 5432
```

---

### ✅ 5. **Redémarrer PostgreSQL pour appliquer les changements**

```bash
sudo systemctl restart postgresql
```

---

### ✅ 6. **Tester la connexion avec psql**

Depuis ton terminal, tu peux tester :

```bash
psql -h localhost -p 5432 -U app_cbp -d ged_ws
```

Il va te demander le mot de passe `G7kL9vQ2xW4m`.

---

### ✅ 7. **Connexion depuis une application (variables d’environnement)**

Tu peux définir dans ton `.env` :

```dotenv
DB_HOST_TEST=localhost
DB_PORT_TEST=5432
DB_NAME_TEST=ged_ws
DB_USER_TEST=app_cbp
DB_PASSWORD_TEST=G7kL9vQ2xW4m
```

Et connecter avec ces valeurs dans ton application (Python, Node.js, etc.).

---

Souhaites-tu que je t’aide à tester la connexion dans un script (Python, Node.js, etc.) ?

Ce message d'erreur signifie que le serveur PostgreSQL **n'est pas en cours d'exécution**, ou alors qu’il n’écoute pas sur le socket par défaut (`/var/run/postgresql/.s.PGSQL.5432`).

---

### 🔍 Étapes pour diagnostiquer et résoudre le problème :

---

#### ✅ 1. **Vérifie si PostgreSQL est installé**

```bash
dpkg -l | grep postgresql
```

S’il n’est pas listé, installe-le :

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

---

#### ✅ 2. **Démarre PostgreSQL manuellement**

```bash
sudo systemctl start postgresql
```

Puis vérifie son statut :

```bash
sudo systemctl status postgresql
```

Tu devrais voir un statut `active (running)`.

---

#### ✅ 3. **Redémarre PostgreSQL pour être sûr**

```bash
sudo systemctl restart postgresql
```

---

#### ✅ 4. **Vérifie que PostgreSQL écoute sur le bon port**

```bash
sudo netstat -nlp | grep 5432
```

Ou, si `netstat` n'est pas disponible :

```bash
sudo ss -tunlp | grep 5432
```

Tu devrais voir une ligne comme :

```
LISTEN  0  128  127.0.0.1:5432  ...
```

---

#### ✅ 5. **Re-tente la commande psql**

```bash
sudo -u postgres psql
```

---

### ⚠️ Si ça ne marche toujours pas :

1. **Logs de PostgreSQL** :
   Regarde ce fichier pour voir pourquoi PostgreSQL ne démarre pas :

   ```bash
   sudo journalctl -u postgresql
   ```

2. **Architecture WSL/Ubuntu Docker ?**
   Si tu es dans un conteneur Docker ou sous **WSL**, PostgreSQL peut ne pas démarrer automatiquement ou avoir un chemin de socket personnalisé. Indique-moi si tu es dans ce contexte.

---

Souhaites-tu que je t’aide à **forcer PostgreSQL à écouter sur TCP au lieu du socket** si tu es dans un environnement particulier (comme Docker ou WSL) ?

Parfait. Si tu travailles dans un environnement sans `systemd` (comme Docker, WSL, ou un service géré manuellement), tu dois lancer PostgreSQL **en mode service direct**.

---

### 🛠️ Étapes pour démarrer PostgreSQL sans `systemctl`

---

#### ✅ 1. **Vérifie l’installation**

Si PostgreSQL n’est pas encore installé :

```bash
sudo apt update
sudo apt install postgresql -y
```

---

#### ✅ 2. **Trouve le chemin des fichiers de configuration**

Généralement, les fichiers sont dans `/etc/postgresql/X.Y/main` (par exemple `/etc/postgresql/16/main`).

Tu peux vérifier :

```bash
ls /etc/postgresql/
```

---

#### ✅ 3. **Démarrer PostgreSQL manuellement avec `pg_ctl`**

D'abord, trouve le répertoire de données PostgreSQL. Par défaut, c’est souvent :

```bash
/var/lib/postgresql/X.Y/main
```

Remplace `X.Y` par ta version PostgreSQL (par exemple `16`).

Ensuite, lance le serveur :

```bash
sudo -u postgres pg_ctl -D /var/lib/postgresql/16/main start
```

> 🔁 Remplace `16` par ta version réelle.

---

#### ✅ 4. **Tester la connexion**

Une fois lancé, essaie :

```bash
sudo -u postgres psql
```

---

#### ✅ 5. **Si `pg_ctl` n’est pas trouvé**

Ajoute le chemin PostgreSQL à ton `$PATH` ou appelle-le directement :

```bash
sudo -u postgres /usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/16/main start
```

---

### 📌 (Optionnel) Créer un service personnalisé si tu veux automatiser ça

Tu peux créer un fichier `postgresql.service` dans `/etc/init.d/` ou utiliser un script de démarrage pour ton environnement Docker/WSL.

Souhaites-tu un exemple de script de démarrage automatique compatible avec ton environnement ? (précise s’il s’agit de WSL, Docker, ou un autre cas).


Parfait ! Tu peux exécuter ton fichier `table.sql` pour créer toutes les tables dans la base de données `ged_ws` en utilisant la commande `psql`.

---

### ✅ Étapes pour exécuter `table.sql` dans la base `ged_ws`

#### 1. **Assure-toi que la base existe déjà**

Tu as indiqué vouloir une base appelée `ged_ws`. Si ce n’est pas déjà fait :

```bash
sudo -u postgres createdb ged_ws
```

---

#### 2. **Exécuter le script SQL avec `psql`**

Si ton fichier s’appelle `/home/monuser/table.sql` (ou autre chemin), utilise :

```bash
psql -h localhost -p 5432 -U app_cbp -d ged_ws -f /chemin/vers/table.sql
```

Par exemple :

```bash
psql -h localhost -p 5432 -U app_cbp -d ged_ws -f /home/rovatiana/table.sql
```

Il te demandera le mot de passe : `G7kL9vQ2xW4m`

---

### ✅ Astuce : définir le mot de passe une fois

Pour éviter de saisir le mot de passe à chaque fois, tu peux utiliser un fichier `.pgpass` :

1. Crée le fichier (dans le **home de ton utilisateur** – pas root) :

```bash
nano ~/.pgpass
```

2. Mets-y ceci :

```
localhost:5432:ged_ws:app_cbp:G7kL9vQ2xW4m
```

3. Change les permissions :

```bash
chmod 600 ~/.pgpass
```

Maintenant, `psql` utilisera ce mot de passe automatiquement.

---

Souhaites-tu que je vérifie ou corrige le contenu de ton `table.sql` avant exécution ? Tu peux me le coller ici.



L'erreur indique clairement que l'utilisateur `app_cbp` **n’a pas les droits suffisants** pour insérer des données dans la table `storage_file` :

```
(psycopg2.errors.InsufficientPrivilege) permission denied for table storage_file
```

---

### ✅ Solution : Donner les bons droits à l'utilisateur `app_cbp`

Connecte-toi à PostgreSQL avec un utilisateur ayant les droits (ex : `postgres`) :

```bash
sudo -u postgres psql ged_ws
```

Puis exécute :

```sql
GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_cbp;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_cbp;
```

> Ces commandes donnent à `app_cbp` tous les droits nécessaires pour interagir avec les tables et séquences (auto-incrément) du schéma `public`.

---

### 🔁 Si des **nouvelles tables** sont créées ensuite (ex : avec `table.sql`), tu peux exécuter aussi :

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLES TO app_cbp;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_cbp;
```

---

### 🔍 Pour vérifier les droits actuels :

Tu peux voir les permissions avec :

```sql
\z storage_file
```

---

Dis-moi si tu veux un script complet pour appliquer tous ces droits automatiquement, ou si tu veux limiter les permissions à certaines tables seulement.
