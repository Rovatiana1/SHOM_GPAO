Parfait. Voici comment tu peux faire un **test comparatif de latence avec `curl`** pour vérifier la différence entre `localhost:1234` (direct) et `app.ged.test` (via Nginx) :

---

### ✅ 1. **Commande `curl` avec mesure de temps (`-w`)**

```bash
curl -o /dev/null -s -w "\n[localhost]\nDNS: %{time_namelookup}s\nConnect: %{time_connect}s\nStartTransfer: %{time_starttransfer}s\nTotal: %{time_total}s\n" http://localhost:1234
```

```bash
curl -o /dev/null -s -w "\n[nginx - app.ged.test]\nDNS: %{time_namelookup}s\nConnect: %{time_connect}s\nStartTransfer: %{time_starttransfer}s\nTotal: %{time_total}s\n" http://app.ged.test
```

> 📌 Explication :
>
> * `-o /dev/null` : ignore le contenu HTML
> * `-s` : mode silencieux
> * `-w` : format personnalisé pour afficher les temps :
>
>   * `time_namelookup` : durée de résolution DNS
>   * `time_connect` : temps pour établir la connexion TCP
>   * `time_starttransfer` : délai avant que le premier octet ne soit reçu (backend)
>   * `time_total` : durée totale de la requête

---

### ✅ 2. **Exemple de sortie attendue**

```txt
[localhost]
DNS: 0.000001s
Connect: 0.001200s
StartTransfer: 0.003800s
Total: 0.004200s

[nginx - app.ged.test]
DNS: 0.009800s
Connect: 0.020300s
StartTransfer: 0.500000s
Total: 0.510000s
```

> Si `StartTransfer` ou `Total` sont très élevés sur `app.ged.test`, cela confirme une latence introduite par Nginx ou un problème DNS/proxy local.

---

### ✅ 3. **Optionnel : tester les WebSocket ou endpoints spécifiques**

Si ton app utilise par exemple `/socket.io/` ou `/api/xyz`, tu peux tester :

```bash
curl -o /dev/null -s -w "\nTotal: %{time_total}s\n" http://app.ged.test/socket.io/?EIO=4&transport=polling
```

---

### Tu peux maintenant me coller les résultats ici.

Je t’aiderai à les analyser pour te dire si c’est un souci :

* de DNS local,
* de configuration Nginx,
* ou de backend lent uniquement via le proxy.

Souhaite-tu aussi que je t’écrive un petit script bash qui répète ces tests 5 fois pour avoir une moyenne ?
