Le message `status {'error': 'Job ID not found'}` que tu vois à la fin de ton exécution signifie que le `job_id` n'a pas encore été enregistré dans l'objet `active_jobs` de ton `AsyncJobSystem` lorsque tu fais l'appel à :

```python
status = job_system.get_job_status(job_id)
```

Voici les **raisons possibles** et les **solutions pour corriger cela** :

---

### ✅ 1. **Timing : le job est encore dans la file d'attente (`Queue`)**

Ton `job_func` n’a pas encore été traité par le thread `worker` au moment où tu fais `get_job_status(job_id)`, donc le `job_id` n’a pas encore été ajouté à `self.active_jobs`.

#### 💡 Solution :

Attendre un court instant avant d'interroger le statut ou mieux, ne pas appeler `get_job_status()` immédiatement après `add_job()`, ou bien ajouter un état `queued` dans `self.active_jobs` lors de l'ajout :

```python
def add_job(self, job_func, app, job_id):
    """Ajoute une tâche à la file d'exécution avec le contexte d'application"""
    app_context = app.app_context()
    self.active_jobs[job_id] = {"status": "queued", "start_time": datetime.now()}
    self.job_queue.put((job_id, job_func, app_context))
    return job_id
```

Ainsi, dès que tu appelles `get_job_status(job_id)`, tu obtiens au minimum :

```json
{"status": "queued", "start_time": "..."}
```

---

### ✅ 2. **Assurer la persistance du `job_id` entre ton `job_system` et ta base de données**

Ton `job_id` est d'abord défini avec :

```python
job_id = str(datetime.utcnow().timestamp())
```

Ensuite tu fais :

```python
job_id = job_system.add_job(async_pdf_conversion, current_app._get_current_object(), job_id)
status = job_system.get_job_status(job_id)
```

Ce qui est **logiquement correct**, mais attention si entre-temps tu as du code asynchrone ou des appels multiples : assure-toi que ce `job_id` reste bien le même dans toute ta chaîne d'exécution.

---

### ✅ 3. **Déboguer le système de job**

Pour mieux vérifier, ajoute quelques `print()` dans ton système :

```python
def add_job(self, job_func, app, job_id):
    print(f"Ajout du job {job_id} dans la file")
    app_context = app.app_context()
    self.active_jobs[job_id] = {"status": "queued", "start_time": datetime.now()}
    self.job_queue.put((job_id, job_func, app_context))
    return job_id

def _worker_loop(self):
    while True:
        job_id, job_func, app_context = self.job_queue.get()
        print(f"Exécution du job {job_id}")
        ...
```

---

### ✅ 4. **Tester que le front-end reçoit les notifications**

Utilise un client comme [Socket.IO Tester](https://amritb.github.io/socketio-client-tool/) ou un code JS minimal :

```javascript
const socket = io("http://localhost:5000/ws-dev");

socket.on("connect", () => {
  console.log("Connecté !");
  socket.emit("subscribe_to_job", { job_id: "1721920000.123456" });
});

socket.on("job_status_update", (data) => {
  console.log("Mise à jour reçue :", data);
});
```

Et vérifie bien que le `job_id` utilisé est celui généré (`job_id = str(datetime.utcnow().timestamp())`).

---

### ✅ 5. **Tester manuellement `notify_job_status`**

Dans un shell Python Flask :

```python
from WEB_SERVICE.utils.notifications import notify_job_status
notify_job_status('1721920000.123456', 'queued', progress=10)
```

Regarde si le front-end le reçoit.

---

### ✅ Résumé – Ce que tu peux faire maintenant

1. ✅ Dans `add_job`, ajoute immédiatement `active_jobs[job_id] = { status: "queued" }`.
2. ✅ Vérifie que `job_id` est bien transmis partout et reste cohérent.
3. ✅ Ajoute des logs pour voir l’évolution dans la file d’attente.
4. ✅ Ajoute une interface simple Socket.IO côté front pour vérifier les notifications en direct.

Souhaites-tu que je te génère un **petit front-end HTML/JS** de test pour voir les événements `job_status_update` ?
