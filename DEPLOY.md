# Deploy — Sulus Benefícios

Guia de referência para colocar o projeto em produção. **Nada aqui bloqueia o
desenvolvimento local** (que roda no Docker / disco `public`); é a configuração
da fase final de deploy.

---

## Visão geral da arquitetura

A Cloudflare **não executa PHP** (o compute dela é Workers/JS). Por isso o
Laravel roda em um servidor próprio e a Cloudflare fica **na frente** como
DNS + proxy/CDN + SSL.

```
Cloudflare Pages ───────────────▶  Frontend (React/PWA — build estático)
Cloudflare DNS/proxy ─▶ api.seudominio.com ─▶ VPS (DigitalOcean/Hetzner)
                                               └─ Laravel + MySQL + Redis
Cloudflare R2 ──────────────────▶  Fotos dos funcionários (bucket privado)
```

| Peça | Onde vai | Serviço |
|------|----------|---------|
| Frontend (estático) | Cloudflare **Pages** | grátis |
| Backend (Laravel/PHP) | VPS + **Laravel Forge** | ~US$6–12/mês + Forge US$12/mês |
| Banco (MySQL) | No próprio VPS (início) → Managed DB depois | — |
| Cache/QR tokens (Redis) | No próprio VPS | — |
| Storage de fotos | Cloudflare **R2** | 10 GB grátis |
| DNS / CDN / SSL | Cloudflare | grátis |

---

## 1. Storage — Cloudflare R2

O código já está pronto: o disco `r2` (driver S3-compatível) e o
`config/media.php` chaveiam por variável de ambiente. Em produção basta
apontar para o R2 — **zero mudança de código**.

### Passos
1. No painel Cloudflare → **R2** → criar bucket **privado** (ex.: `sulus-media`).
2. **R2 → Manage API Tokens** → criar um token com permissão de objeto
   (Read & Write) no bucket. Anote `Access Key ID` e `Secret Access Key`.
3. O endpoint é `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
4. Preencher no `.env` de produção:

```env
FILESYSTEM_DISK=r2
MEDIA_DISK=r2
R2_ACCESS_KEY_ID=<access key do token>
R2_SECRET_ACCESS_KEY=<secret do token>
R2_DEFAULT_REGION=auto
R2_BUCKET=sulus-media
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_USE_PATH_STYLE_ENDPOINT=true
# R2_URL só se usar domínio público custom; para fotos privadas, deixar vazio.
```

As fotos de funcionário são **privadas** e servidas por **URL assinada de
curta duração** (`Employee::photoUrl()` usa `temporaryUrl`, que o R2 suporta).
TTL configurável em `MEDIA_SIGNED_URL_TTL` (minutos, default 10).

### ⚠️ Gotchas do R2 (validar cedo)
- **Checksums do AWS SDK**: versões recentes mandam headers `x-amz-checksum`
  que o R2 já aceita; se um upload falhar com erro de assinatura/checksum, é
  aqui. Manter o `league/flysystem-aws-s3-v3` atualizado.
- **Region** tem que ser `auto`; **endpoint** é o do R2 (não o da AWS);
  **path-style** ligado.
- **CORS**: para exibir a foto num `<img>` não precisa; se o front fizer
  `fetch()` na URL assinada, configurar CORS do bucket para o domínio do front.

### Como validar
Com as credenciais no `.env`, o smoke test do upload:
```bash
# logar como empresa e enviar uma foto real via POST /company/employees/{id}/photo
# a resposta deve trazer photo_url apontando para o endpoint R2 assinado.
```

---

## 2. Backend (Laravel) — VPS + Forge

### Recomendado: DigitalOcean (ou Hetzner) + Laravel Forge
O Forge provisiona nginx + PHP-FPM + MySQL + Redis + SSL (Let's Encrypt) e faz
deploy por `git push`. É o equivalente em produção do que o `docker-compose`
faz localmente.

### Checklist do servidor
- [ ] Criar droplet (Ubuntu LTS) e conectar no Forge.
- [ ] Site apontando para `api.seudominio.com`, raiz em `backend/public`.
- [ ] PHP 8.3, extensões: `pdo_mysql`, `redis`, `intl`, `bcmath`, `zip`.
- [ ] Banco MySQL criado + usuário/senha.
- [ ] Redis ativo (QR tokens + cache).
- [ ] Variáveis de ambiente de produção (ver seção 4).
- [ ] Deploy script: `composer install --no-dev`, `php artisan migrate --force`,
      `php artisan config:cache route:cache event:cache`, `php artisan storage:link`.
- [ ] Seed inicial **apenas** de dados canônicos: `db:seed --class=StateSeeder`,
      `CitySeeder`, `CategorySeeder`. **Não** rodar `DemoSeeder` em produção.
- [ ] SSL emitido; forçar HTTPS.
- [ ] Queue worker (se/quando usar filas) e scheduler via cron.

### DB e Redis
No início rodam no próprio droplet (simples/barato). Depois, se quiser backup
automático e HA, migrar o MySQL para um **Managed Database** da DigitalOcean.

---

## 3. Frontend — Cloudflare Pages

- [ ] Conectar o repositório no Cloudflare Pages.
- [ ] Build: raiz `frontend/`, comando `npm run build`, saída `dist/`.
- [ ] Variável de build `VITE_API_URL=https://api.seudominio.com/api`.
- [ ] Domínio custom (ex.: `app.seudominio.com`) apontado no Pages.
- [ ] PWA: o `vite-plugin-pwa` já gera `sw.js`/manifest no build.

---

## 4. Variáveis de ambiente de produção (backend)

Diferenças em relação ao local:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.seudominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1          # ou host do managed DB
DB_DATABASE=sulus
DB_USERNAME=...
DB_PASSWORD=...

CACHE_STORE=redis
REDIS_HOST=127.0.0.1
QUEUE_CONNECTION=redis     # quando usar filas

# Storage R2 — ver seção 1
FILESYSTEM_DISK=r2
MEDIA_DISK=r2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_DEFAULT_REGION=auto
R2_BUCKET=sulus-media
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_USE_PATH_STYLE_ENDPOINT=true

# CORS / Sanctum — domínio do frontend
FRONTEND_URL=https://app.seudominio.com
SANCTUM_STATEFUL_DOMAINS=app.seudominio.com
```

Lembrar de ajustar `config/cors.php` (`allowed_origins` via `FRONTEND_URL`).

---

## 5. Cloudflare na frente do backend

- [ ] DNS de `api.seudominio.com` → IP do droplet, **proxy ligado** (nuvem laranja).
- [ ] SSL/TLS mode: **Full (strict)** (SSL válido no droplet via Forge).
- [ ] Atenção ao limite de tamanho de upload do proxy (100 MB no free — ok para
      fotos de até 4 MB) e a timeouts de requisições longas.

---

## Ordem sugerida no dia do deploy
1. Provisionar VPS (Forge) + MySQL + Redis.
2. Configurar R2 e validar um upload real (seção 1).
3. Subir env de produção + deploy do backend + migrations + seeds canônicos.
4. DNS/proxy da API na Cloudflare + SSL.
5. Cloudflare Pages para o frontend com `VITE_API_URL` de produção.
6. Teste E2E em produção: login de cada papel → fluxo do QR → foto aparecendo.
