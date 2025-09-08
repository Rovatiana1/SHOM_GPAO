Voici une documentation complète et claire pour manipuler **Nginx** en partant de la configuration que tu as donnée. L’objectif est de te guider à travers :

1. 📁 **Création du fichier de configuration Nginx**
2. ⚙️ **Explication ligne par ligne de la config**
3. 🛠️ **Activation du site**
4. ✅ **Test & redémarrage Nginx**
5. 🔍 **Vérification du fonctionnement**

---

## 1. 📁 Créer le fichier de configuration

### 📌 Emplacement recommandé :

Sous Debian/Ubuntu, les configurations des sites sont placées dans `/etc/nginx/sites-available/` et liées dans `/etc/nginx/sites-enabled/`.

### 🧾 Commandes :

```bash
sudo nano /etc/nginx/sites-available/app-cbp
```

### 📝 Contenu du fichier :

```nginx
server {
    listen 80;
    server_name app.cbp.ged.openstack.local;
    
    location /ws/socket/ {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:6000;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
    
    location /ws-test/socket/ {
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_pass http://localhost:6002;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
	
    location /ws {
        proxy_pass http://localhost:6000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }    
	
    location /ws-test {
        root /home/rovatiana/APPLI/GED-WS/MONITORING/build

        index index.html;
        try_files $uri $uri/ /ws-test/index.html;

        proxy_pass http://localhost:6002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}

```

---

## 2. ⚙️ Explication de la configuration

| Directive                                  | Explication                                                 |
| ------------------------------------------ | ----------------------------------------------------------- |
| `listen 80;`                               | Nginx écoute sur le port HTTP 80                            |
| `server_name app.cbp.ged.openstack.local;` | Nom de domaine de ton application                           |
| `location /ws`                             | Toute requête vers `/ws` sera redirigée vers un backend     |
| `proxy_pass http://localhost:6000;`        | Redirige vers le backend tournant sur le port 6000 en local |
| `proxy_set_header ...`                     | Définit les en-têtes HTTP à transmettre au backend          |
| `client_max_body_size 100M;`               | Permet l'envoi de fichiers jusqu’à 100 Mo                   |

---

## 3. 🔗 Activer le site

Créer un lien symbolique pour activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/app-cbp /etc/nginx/sites-enabled/
```

---

## 4. ✅ Vérifier la configuration et redémarrer Nginx

### 🔍 Tester la config :

```bash
sudo nginx -t
```

Tu dois obtenir :

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 🔄 Redémarrer Nginx :

```bash
sudo systemctl restart nginx
```

Ou :

```bash
sudo service nginx restart
```

---

## 5. 🔍 Vérification finale

### 🧪 Tester avec curl :

```bash
curl http://app.cbp.ged.openstack.local/ws
curl http://app.cbp.ged.openstack.local/ws-test
```

### 🖥️ Ou dans un navigateur :

Accède à :

* `http://app.cbp.ged.openstack.local/ws`
* `http://app.cbp.ged.openstack.local/ws-test`

---

## 🛡️ Bonus : Ajouter dans `/etc/hosts` (si domaine local)

Si tu accèdes depuis la machine locale :

```bash
sudo nano /etc/hosts
```

Ajoute :

```
127.0.0.1    app.cbp.ged.openstack.local
```

---

## 📂 Résumé des fichiers créés

| Fichier                              | Rôle                                 |
| ------------------------------------ | ------------------------------------ |
| `/etc/nginx/sites-available/app-cbp` | Fichier principal de config          |
| `/etc/nginx/sites-enabled/app-cbp`   | Lien symbolique pour activer le site |

---

Souhaites-tu aussi une version **HTTPS (avec certificat SSL via Let's Encrypt)** pour ce site ?


server {
    listen 80;
    server_name app.cbp.ged.openstack.local;
    #server_name searchcaressolution-cbp.be-ys.com;

    location /ws {
        proxy_pass http://localhost:6000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
    location /ws-test {
        proxy_pass http://localhost:6001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}

