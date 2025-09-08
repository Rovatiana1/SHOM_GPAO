Tu as tout à fait raison : **Memurai** propose une version gratuite limitée, mais devient payant en production. Si tu veux **utiliser Redis gratuitement** sous Windows, voici **deux alternatives simples et gratuites** :

---

## ✅ OPTION 1 : Utiliser Redis via **WSL (Windows Subsystem for Linux)**

### 🔧 Étapes :

#### 1. Ouvre **PowerShell** ou **CMD** en mode administrateur et installe WSL (si ce n’est pas déjà fait) :

```bash
wsl --install
```

Redémarre ton PC si demandé.

#### 2. Installe une distribution Linux (ex: **Ubuntu**) depuis le Microsoft Store.

#### 3. Une fois Ubuntu lancé :

```bash
sudo apt update
sudo apt install redis-server
```

#### 4. Lance Redis dans WSL :

```bash
sudo service redis-server start
```

#### 5. Teste que Redis fonctionne :

```bash
redis-cli ping
```

✅ Tu dois voir : `PONG`

---

### 📌 Important pour Flask/Celery sous Windows :

Ton app Flask qui tourne sous Windows doit se connecter à Redis qui tourne dans WSL. Pour cela :

```python
# Dans celery_app.py
broker = 'redis://127.0.0.1:6379/0'
backend = 'redis://127.0.0.1:6379/0'
```

> Ça fonctionne parce que WSL expose les ports vers Windows.

---

## ✅ OPTION 2 : Utiliser Docker (recommandé si tu as déjà Docker Desktop)

### 🔧 Étapes :

#### 1. Lance ce conteneur Redis :

```bash
docker run --name redis-server -p 6379:6379 -d redis
```

#### 2. Vérifie que Redis fonctionne :

```bash
docker exec -it redis-server redis-cli ping
```

✅ Résultat attendu : `PONG`

#### 3. Configuration côté Python (même chose) :

```python
broker = 'redis://localhost:6379/0'
backend = 'redis://localhost:6379/0'
```

---

## 🎁 BONUS : Docker Compose prêt à l’emploi

> Tu peux créer un fichier `docker-compose.yml` si tu veux Redis + Flower ensemble :

```yaml
version: '3.8'

services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  flower:
    image: mher/flower
    command: flower --broker=redis://redis:6379/0
    ports:
      - "5555:5555"
    depends_on:
      - redis
```

Lance tout :

```bash
docker-compose up -d
```

---

## 👉 Conclusion

**Ma recommandation :** utilise **WSL + Redis** (si tu n’as pas Docker) — c’est léger, simple, et 100% gratuit.

Souhaites-tu que je t’aide à configurer Redis avec WSL étape par étape sur ta machine ?


Pas de panique ! Si tu utilises **WSL (Ubuntu sous Windows)** et que tu ne connais pas (ou as oublié) le mot de passe de l'utilisateur WSL, tu peux **le réinitialiser** facilement **depuis Windows**. Voici comment faire :

---

## ✅ 🔄 **Méthode pour réinitialiser le mot de passe WSL (Ubuntu)**

---

### 🧩 Étape 1 : Trouver le nom de ta distribution WSL

Dans PowerShell ou CMD, tape :

```bash
wsl -l -v
```

Tu verras un résultat comme :

```
  NAME      STATE           VERSION
* Ubuntu    Running         2
```

---

### 🛠 Étape 2 : Lancer un shell root temporaire

Si ta distribution s'appelle `Ubuntu`, exécute ceci dans **PowerShell (en mode admin)** :

```bash
wsl -d Ubuntu -u root
```

---

### 🧑‍🔧 Étape 3 : Réinitialiser le mot de passe utilisateur WSL

Une fois dans le shell `root`, tape :

```bash
passwd rovatiana
```

Il va te demander de définir un **nouveau mot de passe** pour l’utilisateur `rovatiana`.

> Tape-le 2 fois, il ne s'affichera pas (c'est normal).

---

### 🔁 Étape 4 : Fermer et relancer ta session

Tu peux maintenant quitter :

```bash
exit
```

Puis relancer Ubuntu normalement (`wsl` ou via terminal VS Code), et utiliser ton nouveau mot de passe avec `sudo`.

---

## 🚨 Si tu ne connais pas ton nom d'utilisateur WSL

Tu peux aussi le voir avec :

```bash
wsl -d Ubuntu -u root
cat /etc/passwd | grep /home
```

Tu verras une ligne comme :

```
rovatiana:x:1000:1000:Rovatiana:/home/rovatiana:/bin/bash
```

---

Souhaites-tu que je t’aide à automatiser ça avec un script si tu veux le refaire rapidement plus tard ?
