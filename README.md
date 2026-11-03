# Mini-Jobboard

**[Live-Demo auf Railway](https://jobboard-production-bd0e.up.railway.app)** · [Repository](https://github.com/dscheucher/on7-challenge) · [Technische Dokumentation](docs/TECHNICAL.md)

Ein kleines Jobboard mit einem öffentlichen Bewerbungsbereich und einem geschützten Recruiter-Bereich. Recruiter verwalten ihre Stellen und Bewerbungen; Bewerber benötigen kein Konto.

## Setup

Voraussetzung: Docker mit Docker Compose.

```sh
docker compose up --build -d --wait
```

Die Anwendung läuft unter [localhost:4173](http://localhost:4173/jobs). PostgreSQL und die Migrationen werden automatisch gestartet. Über „Recruiter-Login → Registrieren“ lässt sich ein eigenes Konto erstellen; anschließend ist man direkt angemeldet. Eine Bestätigung per E-Mail ist nicht erforderlich.

Optional lassen sich Beispieldaten anlegen:

```sh
docker compose run --rm migrate npm run db:seed
```

Weitere Startvarianten, Umgebungsvariablen und Testbefehle stehen in der [technischen Dokumentation](docs/TECHNICAL.md).

## Datenmodell

- **Recruiter:** Benutzer, Zugangsdaten und Sessions werden über Better Auth verwaltet.
- **Stelle:** Titel, Beschreibung und Status `open` / `closed`; gehört genau einem Recruiter.
- **Bewerbung:** Name, E-Mail, Nachricht und Status `new` / `invited` / `rejected`; gehört genau einer Stelle. Der zuständige Recruiter ergibt sich über diese Stelle.

Ein Datenbank-Constraint verhindert mehr als eine Bewerbung pro normalisierter E-Mail-Adresse und Stelle. Beim Bewerben wird die Stelle in einer Transaktion gesperrt und ihr Status geprüft. So werden auch gleichzeitige Bewerbungen beziehungsweise das gleichzeitige Schließen einer Stelle berücksichtigt. Zugriffsrechte werden serverseitig geprüft.

## Wichtigste Entscheidungen

- **SvelteKit mit integriertem tRPC:** Eine gemeinsame Anwendung für UI und Backend, ohne separaten API-Service. Server-Loads und Form-Actions verwenden denselben typisierten Router.
- **PostgreSQL und Drizzle:** Explizites Schema, generierte SQL-Migrationen im Repository und Datenbank-Constraints für die zentralen Regeln.
- **Better Auth:** Authentifizierung und Session-Verwaltung werden nicht selbst implementiert. Die zusätzliche Recruiter-Registrierung erleichtert das Testen der Anwendung, obwohl ursprünglich nur ein Login verlangt war.
- **Desktop- und Mobile-UI:** Beide Ansichten orientieren sich am Pencil-Design und verwenden gemeinsame Komponenten, Farben, Typografie und Abstände.
- **Funktionale Tests:** PostgreSQL-Integrationstests und Playwright-Abläufe prüfen die Regeln und UI auf Desktop und Mobile. GitHub Actions führt zusätzlich Lint, Typprüfung und den Docker-Build aus. Visuelle Regressionstests sind nicht Teil des Projekts.

## Was noch offen ist

- Passwort zurücksetzen, einschließlich des dafür nötigen E-Mail-Versands.
- Kontoeinstellungen, insbesondere E-Mail-Adresse ändern.
- Account-Verifikation per E-Mail. Sie ist im aktuellen Ablauf bewusst nicht vorgeschrieben.
- Lokalisierung von Frontend und Validierungsmeldungen: Texte zentralisieren und weitere Sprachen unterstützen.
- no plain css

## Wo die AI danebenlag und wie es aufgefallen ist

Die folgenden Beispiele stammen aus der Umsetzung und können für die persönliche Einordnung angepasst werden:

- **Formulare liefen zunächst lokal nicht im Produktions-Build:** SvelteKit nahm ohne explizite Origin-Konfiguration HTTPS an, während die lokale Anwendung HTTP verwendete. Die Formularanfragen wurden dadurch mit 403 abgewiesen. Aufgefallen ist das durch die fehlgeschlagenen Browser-Tests für Login und Bewerbung. Behoben wurde die tatsächliche Origin-Konfiguration; die Schutzprüfung blieb aktiv.
- **Die Formatierung der Stellenbeschreibung war zu implizit:** Die erste Zeile jedes mehrzeiligen Absatzes wurde automatisch als Überschrift interpretiert. Das fiel bei der Frage auf, warum gerade die „Frontend Developer“-Anzeige anders aussah. Jetzt werden nur explizite `## Überschriften` formatiert; normale Zeilenumbrüche bleiben Text. Ein Browser-Test prüft das unabhängig vom Stellentitel.

## Deployment

Die Anwendung wird auf Railway mit einer getrennten PostgreSQL-Instanz betrieben. Die Infrastrukturkonfiguration steht in [`.railway/railway.ts`](.railway/railway.ts); Details zu GitHub-Anbindung und Migrationen stehen in der [technischen Dokumentation](docs/TECHNICAL.md#railway). Die Live-URL steht oben.
