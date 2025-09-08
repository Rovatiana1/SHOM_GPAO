Parfait, si tu es sous **Windows** avec **Laragon** ou **WampServer**, la gestion de Nginx est un peu différente de Linux, surtout en termes de chemins. Voici une documentation complète adaptée à ton environnement.

---

## 📘 **Documentation NGINX sous Windows avec Laragon (ou WampServer avec Nginx)**

---

## 🛠️ 1. Prérequis

* ✅ **Laragon** installé avec **NGINX**
* ✅ Ton backend (ex. : `Flask`, `Node.js`, `Express`, etc.) tourne sur `localhost:6000`
* ✅ Tu veux accéder à l'app via : `http://app.cbp.ged.openstack.local/ws`

---

## 📁 2. Trouver le dossier de config Nginx

Dans **Laragon** (chemin par défaut) :

```
C:\laragon\etc\nginx\sites-enabled\
```

Dans **WampServer** avec Nginx :

```
C:\wamp64\bin\nginx\nginx-version\conf\sites-enabled\
```

---

## 📄 3. Créer le fichier de configuration

### 🔧 Étapes :

1. Ouvre un éditeur de texte (ex : VS Code ou Notepad++)
2. Crée un fichier :
   **`app-cbp.conf`** dans `sites-enabled`
3. Colle le contenu suivant :

```nginx
server {
    listen 80;
    server_name app.cbp.ged.openstack.local;

    location / {
        proxy_pass http://localhost:6000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
	
    location /ws {
        proxy_pass http://localhost:6000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }

    location /ws-dev {
        proxy_pass http://localhost:6000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
	
    location /ws-test {
        proxy_pass http://localhost:6000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}
```

---

## 🔗 4. Activer le site

**Laragon** ou **WampServer** active automatiquement tout fichier dans `sites-enabled`. Tu n’as pas besoin de faire un lien symbolique.

---

## 🖥️ 5. Ajouter le domaine local dans `hosts`

### 📍 Fichier à modifier :

```
C:\Windows\System32\drivers\etc\hosts
```

### ➕ Ajoute cette ligne à la fin :

```
127.0.0.1    app.cbp.ged.openstack.local
```

🔒 **Important** : Ouvre Notepad++ ou ton éditeur **en tant qu'administrateur** pour pouvoir enregistrer ce fichier.

---

## ♻️ 6. Redémarrer Nginx

### Dans **Laragon** :

1. Clique-droit sur l’icône Laragon dans la barre de tâche
2. → `Restart` → `Nginx`

### Dans **WampServer** :

1. Clique sur l’icône verte de Wamp
2. → `Nginx` → `Restart Service`

---

## ✅ 7. Tester

Ouvre ton navigateur :

* [http://app.cbp.ged.openstack.local/ws](http://app.cbp.ged.openstack.local/ws)
* [http://app.cbp.ged.openstack.local/ws-test](http://app.cbp.ged.openstack.local/ws-test)

Tu devrais voir la réponse de ton backend tournant sur `localhost:6000`.

---

## 📦 Résumé des chemins sous Laragon

| Élément       | Chemin                                            |
| ------------- | ------------------------------------------------- |
| Config NGINX  | `C:\laragon\etc\nginx\sites-enabled\app-cbp.conf` |
| Fichier hosts | `C:\Windows\System32\drivers\etc\hosts`           |
| Redémarrage   | Via le menu de Laragon (Restart Nginx)            |

---

Souhaites-tu également activer le HTTPS en local avec **mkcert** sur Laragon ?
