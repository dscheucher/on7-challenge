# Mini-Jobboard

SvelteKit 3 / Svelte 5, tRPC 11 innerhalb SvelteKit, Better Auth, PostgreSQL 17 und Drizzle ORM. Gemeinsame UI-Komponenten und Design-Tokens übernehmen die Pencil-Vorlage. Manrope wird lokal ausgeliefert.

## Lokal mit Docker

```sh
docker compose up --build -d --wait
# Optional: Demodaten aus dem Design
docker compose run --rm migrate npm run db:seed
```

Öffnen: [localhost:4173/jobs](http://localhost:4173/jobs). Compose wartet auf PostgreSQL, spielt die generierten Migrationen ein und startet danach die Anwendung. `docker compose down` stoppt die Dienste; Daten bleiben im Volume erhalten.

Recruiter registrieren sich unter [localhost:4173/register](http://localhost:4173/register), erreichbar über „Registrieren“ auf der Login-Seite. Nach der Registrierung sind sie sofort angemeldet, ohne E-Mail-Verifikation und ohne Mailserver. Name, E-Mail-Adresse und ein Passwort mit 8 bis 128 Zeichen sind erforderlich.

Die optionalen Demo-Konten `lea@beispiel.de` und `tom@beispiel.de` verwenden beide `JobboardDemo2026!`. Seeding überschreibt keine vorhandenen Konten oder Stellen; die Konto-Hilfsfunktion dient ausschließlich Demodaten und Test-Fixtures.

Standardports: App 4173, PostgreSQL 55434. Änderungen über `APP_PORT` und `POSTGRES_PORT` in `.env`, danach neu bauen. Die App wird unter `/` betrieben. SvelteKit 3 benötigt die kanonische Origin beim Build: `PUBLIC_ORIGIN` bzw. Docker-Build-Argument `APP_ORIGIN`. Compose setzt sie passend zum App-Port. Für externen Betrieb eine eigene Origin und ein eigenes `BETTER_AUTH_SECRET` konfigurieren; die Compose-Vorgaben dienen ausschließlich lokaler Entwicklung.

## Native Entwicklung

Node.js 24 und Docker:

```sh
cp .env.example .env
npm ci
docker compose up -d db
npm run db:migrate
npm run db:seed
npm run dev
```

`npm run build` erzeugt den Node-Server; `PORT=4173 npm run start` startet ihn.

## Datenmodell und Backend

- Better Auth verwaltet `user`, `account`, `session`, `verification`. Die standardmäßige Verification-Tabelle bleibt Teil des Auth-Schemas; Bestätigungs-E-Mails werden weder benötigt noch versendet.
- `jobs`: UUID, Eigentümer über `recruiter_id`, Titel, Beschreibung, `open`/`closed`, Zeitstempel.
- `applications`: UUID, Stelle über `job_id`, Name, E-Mail, Nachricht, `new`/`invited`/`rejected`, Zeitstempel. Kein Bewerberkonto und keine redundante Recruiter-ID.
- E-Mails werden getrimmt und kleingeschrieben. Unique Constraint `(job_id,email)` und Normalisierungs-Check verhindern Duplikate auch bei parallelen Anfragen.
- Eine Bewerbung sperrt die Stelle innerhalb einer Transaktion mit `SELECT … FOR UPDATE`. Schließen benötigt dieselbe Zeilensperre. Die Commit-Reihenfolge bestimmt, ob die Bewerbung noch angenommen wird. Nach dem Schließen werden keine neuen Bewerbungen angenommen.
- Jede geschützte Abfrage und Mutation prüft Eigentümerschaft anhand der Session. Keine vom Client übernommenen Recruiter-IDs. Fremde und fehlende Datensätze ergeben dieselbe 404-Antwort.
- Zod validiert im tRPC-Router und an der Service-Grenze. PostgreSQL sichert Fremdschlüssel, Enums, Längen und Eindeutigkeit.
- Stellen sortieren nach letzter Änderung, Bewerbungen nach Eingangszeit, jeweils absteigend.

Der Fetch-Adapter läuft unter `/api/trpc/[...trpc]`. SvelteKit-Loads und Form-Actions verwenden denselben Router über `createCaller` ohne HTTP-Umweg. Form-Actions übersetzen Ergebnisse in Formularzustände und funktionieren auch ohne JavaScript. `src/lib/trpc.ts` stellt zusätzlich den typisierten HTTP-Client bereit. Better Auth verwendet seine eigenen `/api/auth/*`-Endpunkte.

Stellenbeschreibungen verwenden Leerzeilen für Absätze. Optionale Überschriften werden explizit mit `## ` am Zeilenanfang markiert. Normale Zeilenumbrüche erzeugen keine Überschrift; dieselbe Darstellung gilt unabhängig vom Stellentitel. HTML wird als Text ausgegeben.

## Migrationen

```sh
npm run db:generate  # drizzle-kit erzeugt SQL und Snapshot
npm run db:migrate  # generierte Migrationen anwenden
```

SQL und Metadaten liegen unter `drizzle/` im Repository. Kein `drizzle-kit push` beim Start. Schemaänderungen werden im Drizzle-Schema umgesetzt und anschließend als neue Migration generiert.

## Tests und CI

```sh
npm run lint
npm run check
# Einmalig eigene Testdatenbank erstellen:
docker compose exec db createdb -U jobboard jobboard_test
DATABASE_URL=postgres://jobboard:local-development-only@localhost:55434/jobboard_test npm run db:migrate
TEST_DATABASE_URL=postgres://jobboard:local-development-only@localhost:55434/jobboard_test npm run test:integration
npx playwright install chromium
npm run test:e2e -- --project=desktop --project=mobile
```

Tests erzeugen eigene Recruiter und entfernen nur deren Datensätze. Browser-Tests starten bei Bedarf den gebauten Server. [Interaktionskatalog](docs/playwright-interactions.md).

[GitHub Actions](.github/workflows/ci.yml) läuft bei jedem Push und Pull Request: Lint, Typprüfung, Migrationen, echte PostgreSQL-Integrationstests, Desktop-/Mobile-Browsertests und Docker-Image-Build. Fehlerberichte und Traces werden als Artefakte gespeichert.

## Pencil-Design

Tokens: `src/lib/styles/tokens.css`. Wiederverwendbare Komponenten: `src/lib/components/`. [Originale Designreferenzen](docs/design/README.md). Die Umsetzung wird manuell mit Pencil abgeglichen; es gibt keine visuellen Regressionstests.
