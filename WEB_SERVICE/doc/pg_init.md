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
