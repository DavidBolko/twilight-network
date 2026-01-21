# Twilight Network – inštalácia

## Požiadavky
- Git
- Docker Desktop
- (Odporúčané) WSL2 (napr. Ubuntu)

## Spustenie projektu
V termináli / PowerShell:

```bash
git clone https://github.com/DavidBolko/twilight-network
cd twilight-network
docker compose up --build
```

## Ako sa dostať do aplikácie?
Frontend: http://localhost:5173
Backend API: http://localhost:9173


- Admin účet `elder@example.com` / `Admin123`

## Ukončenie
```bash
docker compose down
```

## Reinštálacia aplikácie (vymazanie dát)
```bash
docker compose down -v
docker compose up --build
```