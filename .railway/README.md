# Railway-Konfiguration

Die Infrastruktur steht in [`railway.ts`](railway.ts): App aus GitHub `main`, Dockerfile-Build, PostgreSQL, Healthcheck und Migration vor dem Deployment. Der Railway-SDK ist als Entwicklungsabhängigkeit im Hauptprojekt enthalten.

```sh
npm ci
railway link  # das vorhandene Projekt on7-challenge und production wählen
railway config plan
```

Der Plan ändert noch keine Ressourcen. Vor dem Anwenden prüfen, dass keine Datenbank oder Volumes gelöscht werden und vorhandene Geheimnisse erhalten bleiben. Geprüfte Änderungen an der Infrastruktur anwenden:

```sh
railway config apply
```

Der laufende App-Service verwendet den Migrationsrunner `node scripts/migrate.mjs` vor GitHub-Deployments. Migrationen mit Fehlern stoppen das Deployment. Der erste Datenbankaufbau wurde aus einem lokalen Docker-Image ausgeführt; weitere Deployments verwenden die generierten Migrationen aus dem Repository.

`preserve()` hält Origin und Auth-Secret ausschließlich in Railway. `DATABASE_URL` verweist auf die private PostgreSQL-Verbindung. Generierte Domains und Zugangsdaten werden nicht in dieser Datei hinterlegt. Für ein anderes Projekt dessen Namen, GitHub-Quelle, Variablen und Volume-Konfiguration anpassen und einen neuen Plan prüfen.
