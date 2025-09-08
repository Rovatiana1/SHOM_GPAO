Bien sûr ! Voici une **documentation claire et pratique pour utiliser `service` sous Ubuntu**, notamment utile **dans les environnements sans `systemd`**, comme WSL sans droits admin.

---

# 📘 **Guide : Utilisation de `service` sous Ubuntu**

## ✅ 1. **Vérifier le statut d’un service**

```bash
sudo service <nom_du_service> status
```

**Exemples :**

```bash
sudo service nginx status
sudo service ssh status
sudo service mysql status
```

---

## ▶️ 2. **Démarrer un service**

```bash
sudo service <nom_du_service> start
```

**Exemple :**

```bash
sudo service nginx start
```

---

## ⏹️ 3. **Arrêter un service**

```bash
sudo service <nom_du_service> stop
```

**Exemple :**

```bash
sudo service nginx stop
```

---

## 🔄 4. **Redémarrer un service**

```bash
sudo service <nom_du_service> restart
```

**Exemple :**

```bash
sudo service nginx restart
```

---

## 🔁 5. **Recharger un service (sans redémarrer totalement)**

Certains services prennent en charge une commande "reload" qui recharge les fichiers de configuration sans couper le service.

```bash
sudo service <nom_du_service> reload
```

**Exemple :**

```bash
sudo service nginx reload
```

---

## ❓ 6. **Lister les services disponibles**

```bash
service --status-all
```

Cela affiche une liste comme :

```
 [ + ]  cron
 [ - ]  nginx
 [ ? ]  apache2
```

* `[ + ]` : actif
* `[ - ]` : inactif
* `[ ? ]` : statut inconnu (souvent services personnalisés)

---

## 🛠️ 7. **Activer un service au démarrage (avec update-rc.d)**

Comme `systemctl enable` ne fonctionne pas sans `systemd`, on utilise :

```bash
sudo update-rc.d <nom_du_service> defaults
```

**Exemple :**

```bash
sudo update-rc.d nginx defaults
```

> Cela ajoute le service au démarrage du système (utile si tu exécutes un Ubuntu réel, pas juste WSL)

---

## 📦 8. **Créer un service personnalisé (`init.d`)**

Tu peux créer ton propre service pour une app Python ou Node.js :

```bash
sudo nano /etc/init.d/mon-service
```

Puis ajoute un script comme :

```bash
#!/bin/bash
### BEGIN INIT INFO
# Provides:          mon-service
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Mon script Python
### END INIT INFO

case "$1" in
  start)
    echo "Démarrage"
    nohup python3 /chemin/vers/script.py > /tmp/mon-service.log 2>&1 &
    echo $! > /tmp/mon-service.pid
    ;;
  stop)
    echo "Arrêt"
    kill $(cat /tmp/mon-service.pid)
    rm /tmp/mon-service.pid
    ;;
  restart)
    $0 stop
    $0 start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac

exit 0
```

Puis rends-le exécutable :

```bash
sudo chmod +x /etc/init.d/mon-service
```

Et active-le :

```bash
sudo update-rc.d mon-service defaults
```

---

## 📎 Récapitulatif des commandes `service`

| Action               | Commande                        |
| -------------------- | ------------------------------- |
| Démarrer             | `sudo service nom start`        |
| Arrêter              | `sudo service nom stop`         |
| Redémarrer           | `sudo service nom restart`      |
| Recharger config     | `sudo service nom reload`       |
| Vérifier statut      | `sudo service nom status`       |
| Lister les services  | `service --status-all`          |
| Ajouter au démarrage | `sudo update-rc.d nom defaults` |

---

Souhaites-tu que je t’envoie un modèle fonctionnel pour lancer une app Python comme service avec `service` + `init.d` ?



Parfait ! Tu as déjà un **fichier de service `systemd` complet et bien structuré**, comme on l’utiliserait normalement avec `systemctl`.

⚠️ **Mais comme tu es sous WSL sans `systemd` (et sans droits admin pour activer `systemd`)**, tu ne peux **pas** utiliser ce fichier directement avec `systemctl`. Il faut donc **adapter ce service en un script `init.d` compatible avec `service`**.

---

## ✅ Voici comment adapter ton `ged_ws_test.service` en script compatible `service`

### 📁 1. Créer le script d'init

```bash
sudo nano /etc/init.d/ged_ws_test
```

### 🧾 Contenu du fichier :

```bash
#!/bin/bash

### BEGIN INIT INFO
# Provides:          ged_ws_test
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Service de test - GED Web Service
### END INIT INFO

APP_DIR="/home/rovatiana/APPLI/GED-WS"
APP_EXEC="/home/rovatiana/APPLI/GED-WS/WEB_SERVICE/.venv/bin/python3"
APP_MODULE="WEB_SERVICE.app"
PIDFILE="/var/run/ged_ws_test.pid"
LOGFILE="/var/log/ged_ws_test.log"
FLASK_ENV="testing"

case "$1" in
  start)
    echo "Démarrage du service GED Web Service..."
    export FLASK_ENV=$FLASK_ENV
    cd "$APP_DIR"
    
    # Suppression du fichier de verrouillage si présent
    if [ -f ".startup.lock" ]; then
      echo "Suppression du fichier .startup.lock..."
      rm -f .startup.lock
    fi
    
    nohup $APP_EXEC -m $APP_MODULE >> "$LOGFILE" 2>&1 &
    echo $! > "$PIDFILE"
    ;;
  stop)
    echo "Arrêt du service GED Web Service..."
    if [ -f "$PIDFILE" ]; then
      kill $(cat "$PIDFILE")
      rm "$PIDFILE"
    else
      echo "PID file introuvable. Le service ne semble pas tourner."
    fi
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    if [ -f "$PIDFILE" ]; then
      PID=$(cat "$PIDFILE")
      if ps -p $PID > /dev/null; then
        echo "Le service tourne (PID: $PID)"
      else
        echo "Le service ne tourne pas, mais le fichier PID existe."
      fi
    else
      echo "Le service ne tourne pas."
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac

exit 0
```

---

### 🔐 2. Rends le script exécutable

```bash
sudo chmod +x /etc/init.d/ged_ws_test
```

---

### 🟢 3. Utilise le service avec les commandes classiques :

```bash
sudo service ged_ws_test start
sudo service ged_ws_test stop
sudo service ged_ws_test restart
sudo service ged_ws_test status
```

---

### 🔁 4. (Facultatif) Activer au démarrage (si en dehors de WSL)

```bash
sudo update-rc.d ged_ws_test defaults
```

⚠️ Sous WSL, le démarrage automatique ne se fait pas toujours, mais tu peux l’ajouter à ton `~/.bashrc` si besoin.

---

## ✅ Avantages de cette approche :

* Fonctionne **sans systemd**
* Gère **les logs**, **le redémarrage manuel**, **les PID**
* Se manipule avec la commande `service` comme un vrai service système

---

Souhaites-tu aussi qu’on ajoute un mécanisme de **redémarrage automatique en cas de plantage** (à la `Restart=always`) avec `supervisord` si jamais ?


Oui, exactement : comme tu peux le constater avec la sortie de `service --status-all`, la plupart des services sont **arrêtés (`[ - ]`)**, et seulement quelques-uns sont **actifs (`[ + ]`)**, notamment :

* `ged_ws_test`
* `nginx`

Cela signifie que **seuls ces deux services sont en cours d'exécution**, donc **il ne sert à rien de redémarrer les autres** s’ils sont déjà à l'arrêt.

---

### ✅ Tu peux redémarrer manuellement uniquement les services actifs :

```bash
sudo service ged_ws_test restart
sudo service nginx restart
```

---

### 🔁 Ou automatiquement, via une petite boucle bash (adaptée à ta situation) :

```bash
for service in $(service --status-all 2>&1 | grep '\[ + \]' | awk '{print $4}'); do
    echo "Restarting $service..."
    sudo service "$service" restart
done
```

Cela redémarre uniquement les services actuellement **en cours d’exécution**, comme `ged_ws_test` et `nginx`.

---

Souhaites-tu aussi **démarrer** ceux qui sont arrêtés (comme `cron`, `redis-server`, `postgresql`, etc.) ? Si oui, je peux te donner une commande pour ça aussi.


Parfait ! Si tu veux **(re)démarrer tous les services listés par `service --status-all`**, **même ceux arrêtés ou en état inconnu**, tu peux utiliser la commande suivante :

---

### ✅ Redémarrer **tous les services**, sans exception :

```bash
for service in $(service --status-all 2>&1 | awk '{print $4}'); do
    echo "→ Restarting $service..."
    sudo service "$service" restart || echo "⚠️ Failed to restart $service"
done
```

---

### 🔍 Ce que fait cette commande :

* Elle lit tous les noms de services (`awk '{print $4}'`).
* Elle tente de redémarrer **chacun**.
* Si un redémarrage échoue (ce qui peut arriver pour certains scripts), un message d’erreur s’affiche mais la boucle continue (`|| echo "⚠️ Failed..."`).

---

### 📌 Remarques :

* Certains services comme `apparmor`, `dbus`, `procps`, etc. ne redémarrent pas proprement ou n'ont pas de script `restart`. L’erreur est normale dans ce cas.
* Si un service ne supporte pas `restart`, tu peux tester `start` ou `force-reload` selon les cas.

---

### ✅ Alternative pour forcer les démarrages même si à l'arrêt :

```bash
for service in $(service --status-all 2>&1 | awk '{print $4}'); do
    echo "→ Restarting $service..."
    sudo service "$service" stop >/dev/null 2>&1
    sudo service "$service" start || echo "⚠️ Failed to start $service"
done
```

Cela garantit que chaque service est proprement stoppé, puis redémarré.

---

Souhaites-tu que je t’ajoute un script `.sh` que tu pourras exécuter à tout moment pour ça ?
