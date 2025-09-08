Pour créer un **service systemd de test** (`ged_ws_test.service`) qui utilise l'environnement `FLASK_ENV=testing` avant d'exécuter ton application avec `python3 -m WEB_SERVICE.app`, tu peux suivre ce modèle :

---

### ✅ Fichier : `/etc/systemd/system/ged_ws_test.service`

```ini
[Unit]
Description=Service de test - GED Web Service
After=network.target

[Service]
User=root
WorkingDirectory=/home/debian/appli/ged_ws/GED-WS/

# Export de la variable d'environnement
Environment=FLASK_ENV=production

# Supprimer le fichier lock avant de lancer l'app
ExecStartPre=/bin/rm -rf /home/debian/appli/ged_ws/GED-WS/.startup.lock

# Exécution du module Python
ExecStart=/home/debian/appli/ged_ws/GED-WS/WEB_SERVICE/ged_ws/bin/python3 -m WEB_SERVICE.app

# Redémarrage automatique en cas d'échec
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

### 🔄 Étapes pour activer et démarrer ce service :

```bash
# 1. Recharger les unités systemd
sudo systemctl daemon-reexec
sudo systemctl daemon-reload

# 2. Activer le service au démarrage
sudo systemctl enable ged_ws_test.service

# 3. Démarrer le service manuellement
sudo systemctl start ged_ws_test.service

# 4. Vérifier le statut
sudo systemctl status ged_ws_test.service

# 5. Voir les logs
journalctl -u ged_ws_test.service -f
```

---

### 💡 Remarques :

* Tu peux créer ce fichier dans `/etc/systemd/system/` ou `/lib/systemd/system/` selon la distribution.
* Tu n’as **pas besoin** de faire manuellement `export FLASK_ENV=testing` dans un terminal si tu utilises `Environment=` dans le service.
* Si ton app a besoin d'autres variables d’environnement (`DATABASE_URL`, `SECRET_KEY`, etc.), tu peux les ajouter :

  ```ini
  Environment=FLASK_ENV=testing
  Environment=SECRET_KEY=123456
  ```

---

Souhaites-tu aussi un service pour `FLASK_ENV=development` ou `production` ?
