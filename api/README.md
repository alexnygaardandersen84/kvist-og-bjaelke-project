# Python SQLite API

Et lille REST API bygget med FastAPI og SQLite. API'et kan oprette brugere og
kontrollere loginoplysninger.

> **Advarsel:** Denne undervisningsversion gemmer med vilje passwords i
> klartekst i kolonnen `password`. Det må ikke bruges i produktion eller med
> rigtige passwords.

## Kom i gang

Kræver Python 3.9 eller nyere.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

API'et kører nu på <http://127.0.0.1:8000>. Den interaktive Swagger-side findes
på <http://127.0.0.1:8000/docs>.

SQLite-filen oprettes automatisk som `data/app.db`. En anden placering kan
vælges med miljøvariablen `DATABASE_PATH`.

## Password og bcrypt

API'et gemmer værdien fra requestens `password` direkte i SQLite-kolonnen
`password`. Den separate fil `app/bcrypt_integration.py` indeholder funktionerne
`hash_password()` og `verify_password()` til en senere bcrypt-integration. Filen
er med vilje tilføjet til `.gitignore` og bliver derfor ikke versionsstyret.

## Endpoints

| Metode | Sti | Beskrivelse |
|---|---|---|
| `POST` | `/register` | Opret bruger |
| `POST` | `/login` | Log ind med brugernavn og password |

Eksempel på oprettelse:

```bash
curl -X POST http://127.0.0.1:8000/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"ada","email":"ada@example.com","password":"meget-hemmeligt"}'
```

Eksempel på login:

```bash
curl -X POST http://127.0.0.1:8000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"ada","password":"meget-hemmeligt"}'
```

## Tests

```bash
python -m pip install -r requirements-dev.txt
pytest
```
