# Playwright: User Interactions

Diese Abläufe sind in `tests/e2e/jobboard.spec.ts` für Desktop (1440 px) und Mobile (390 px) implementiert. Echte Formulare, Better Auth, tRPC und PostgreSQL; keine gemockte Fach-API.

| Nr. | Interaktion                                                                                | Erwartetes Ergebnis                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Stellenliste öffnen, offene Stelle anklicken                                               | Offene Stellen sichtbar, geschlossene fehlen; korrekte Detailseite und Formular öffnen sich.                                              |
| 2   | Geschützte URL ohne Session aufrufen, Passwort einblenden, einloggen, neu laden, ausloggen | Login-Weiterleitung; Passwort umschaltbar; Session bleibt nach Neuladen erhalten und ist nach Logout ungültig. Kein Verifikationsschritt. |
| 3   | Falsches Passwort eingeben                                                                 | Verständliche Fehlermeldung; E-Mail bleibt erhalten.                                                                                      |
| 4   | Stelle erstellen, bearbeiten, schließen, filtern und wieder öffnen                         | Änderungen gespeichert; geschlossen kein Bewerbungsformular; nach Öffnen wieder nutzbar.                                                  |
| 5   | Leeres Stellenformular absenden, weiteren Entwurf abbrechen                                | Serverseitige Feldfehler; Abbrechen speichert nichts.                                                                                     |
| 6   | Ohne Login bewerben und dieselbe E-Mail in anderer Großschreibung erneut verwenden         | Erst Erfolg, dann Duplikatfehler; Nachricht bleibt erhalten; genau eine Bewerbung gespeichert.                                            |
| 7   | Leeres Bewerbungsformular und ungültige E-Mail absenden                                    | Feldfehler sichtbar; keine Bewerbung gespeichert.                                                                                         |
| 8   | Formular ausfüllen, währenddessen Stelle schließen, absenden                               | Geschlossen-Hinweis ersetzt Formular; nichts gespeichert.                                                                                 |
| 9   | Bewerbung lesen, einladen, neu laden, ablehnen, nach „Neu“ filtern                         | Status persistent; Speichern bestätigt; verständlicher leerer Filter. Mobile öffnet eigenes Detail.                                       |
| 10  | Fremde Stellen- und Bewerbungs-URLs direkt aufrufen                                        | Einheitliche 404; keine fremden Bewerberdaten.                                                                                            |
| 11  | Leere Bewerbungsliste und zentrale Seiten auf Mobile öffnen                                | Klarer Leerzustand; kein horizontales Scrollen.                                                                                           |
| 12  | Netzwerk beim Absenden unterbrechen und erneut versuchen                                   | Fehlerhinweis, Inhalte bleiben erhalten; erneutes Senden gelingt.                                                                         |

Zusätzlich prüft `tests/integration/jobboard.test.ts` Nebenläufigkeit, Eigentümerschaft, Validierung und Datenbank-Constraints gegen PostgreSQL.

```sh
npm run test:e2e -- --project=desktop --project=mobile
npx playwright show-report
```
