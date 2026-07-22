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
                                               └─ Laravel + PostgreSQL + Redis
Cloudflare R2 ──────────────────▶  Fotos dos funcionários (bucket privado)
```

| Peça | Onde vai | Serviço |
|------|----------|---------|
| Frontend (estático) | Cloudflare **Pages** | grátis |
| Backend (Laravel/PHP) | VPS + **Laravel Forge** | ~US$6–12/mês + Forge US$12/mês |
| Banco (PostgreSQL) | No próprio VPS (início) → Managed DB depois | — |
| Cache/QR tokens (Redis) | No próprio VPS | — |
| Storage de fotos | Cloudflare **R2** | 10 GB grátis |
| E-mail transacional | **Resend** | 3.000 e-mails/mês grátis |
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
O Forge provisiona nginx + PHP-FPM + PostgreSQL + Redis + SSL (Let's Encrypt) e faz
deploy por `git push`. É o equivalente em produção do que o `docker-compose`
faz localmente.

### Checklist do servidor
- [ ] Criar droplet (Ubuntu LTS) e conectar no Forge.
- [ ] Site apontando para `api.seudominio.com`, raiz em `backend/public`.
- [ ] PHP 8.3, extensões: `pdo_pgsql`, `redis`, `intl`, `bcmath`, `zip`.
- [ ] Banco PostgreSQL criado + usuário/senha.
- [ ] Redis ativo (QR tokens + cache).
- [ ] Variáveis de ambiente de produção (ver seção 6).
- [ ] Deploy script: `composer install --no-dev`, `php artisan migrate --force`,
      `php artisan config:cache route:cache event:cache`, `php artisan storage:link`.
- [ ] Seed inicial **apenas** de dados canônicos: `db:seed --class=StateSeeder`,
      `CitySeeder`, `CategorySeeder`. **Não** rodar `DemoSeeder` em produção.
- [ ] SSL emitido; forçar HTTPS.
- [ ] **Queue worker obrigatório** (não é mais opcional): o convite de e-mail do
      funcionário (`App\Mail\EmployeeInviteMail`) é `ShouldQueue`, então sem um
      worker rodando o e-mail nunca sai — fica parado na tabela `jobs` pra
      sempre. No Forge: aba **Daemons** → adicionar
      `php artisan queue:work --tries=3 --sleep=1` (reinicia sozinho se cair).
      Sem Forge: `supervisor` rodando o mesmo comando.

### DB e Redis
No início rodam no próprio droplet (simples/barato). Depois, se quiser backup
automático e HA, migrar o PostgreSQL para um **Managed Database** da DigitalOcean.

---

## 3. E-mail transacional — Resend

Usado hoje só para o convite de ativação do funcionário
(`App\Mail\EmployeeInviteMail`, enviado por `EmployeeActivationService`). Em
dev local isso cai no **Mailpit** (`docker-compose.yml`, UI em
`localhost:8025`) — em produção precisa de um provedor de verdade.

O transporte `resend` já vem pronto no Laravel (`config/mail.php` +
`config/services.php`) e o pacote `resend/resend-php` já está no
`composer.json` — **zero mudança de código**, só variáveis de ambiente.

### Passos
1. Criar conta em [resend.com](https://resend.com) (free tier: 3.000
   e-mails/mês, 100/dia).
2. **Domains** → adicionar o domínio de envio (ex.: `seudominio.com`, ou um
   subdomínio dedicado como `mail.seudominio.com` — recomendado, isola a
   reputação de envio do domínio principal).
3. Resend mostra os registros DNS a criar: **SPF** (TXT), **DKIM** (TXT) e
   opcionalmente **DMARC**. Adicionar esses registros na zona DNS da
   Cloudflare (fora do proxy — só o registro DNS, sem nuvem laranja) e
   aguardar a verificação no painel do Resend. **Sem isso os e-mails caem em
   spam ou são rejeitados** — não pular esta etapa.
4. **API Keys** → criar uma chave (permissão de envio é suficiente).
5. Preencher no `.env` de produção:

```env
MAIL_MAILER=resend
RESEND_API_KEY=<chave gerada no painel>
MAIL_FROM_ADDRESS=naoresponda@seudominio.com   # no domínio verificado acima
MAIL_FROM_NAME="Sulus Benefícios"
```

`MAIL_HOST`/`MAIL_PORT`/`MAIL_USERNAME`/`MAIL_PASSWORD` (usados pelo SMTP do
Mailpit local) ficam sem efeito com `MAIL_MAILER=resend` — pode deixar como
estão ou remover.

### Como validar
Criar/readmitir um funcionário em produção e conferir, no painel do Resend
(**Logs**), que o e-mail foi entregue — e que chegou na caixa de entrada (não
spam) de um e-mail real de teste.

---

## 5. Frontend — Cloudflare Pages

- [ ] Conectar o repositório no Cloudflare Pages.
- [ ] Build: raiz `frontend/`, comando `npm run build`, saída `dist/`.
- [ ] Variável de build `VITE_API_URL=https://api.seudominio.com/api`.
- [ ] Domínio custom (ex.: `app.seudominio.com`) apontado no Pages.
- [ ] PWA: o `vite-plugin-pwa` já gera `sw.js`/manifest no build.

---

## 6. Variáveis de ambiente de produção (backend)

Diferenças em relação ao local:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.seudominio.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1          # ou host do managed DB
DB_PORT=5432
DB_DATABASE=sulus
DB_USERNAME=...
DB_PASSWORD=...
# DB_SSLMODE=require        # exigido por alguns Postgres gerenciados (ex.: DO Managed DB)

CACHE_STORE=redis
REDIS_HOST=127.0.0.1
QUEUE_CONNECTION=redis     # precisa do worker rodando — ver checklist da seção 2

# Storage R2 — ver seção 1
FILESYSTEM_DISK=r2
MEDIA_DISK=r2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_DEFAULT_REGION=auto
R2_BUCKET=sulus-media
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_USE_PATH_STYLE_ENDPOINT=true

# E-mail transacional — ver seção 3
MAIL_MAILER=resend
RESEND_API_KEY=...
MAIL_FROM_ADDRESS=naoresponda@seudominio.com
MAIL_FROM_NAME="Sulus Benefícios"

# CORS / Sanctum — domínio do frontend
FRONTEND_URL=https://app.seudominio.com
SANCTUM_STATEFUL_DOMAINS=app.seudominio.com
```

Lembrar de ajustar `config/cors.php` (`allowed_origins` via `FRONTEND_URL`).

---

## 7. Cloudflare na frente do backend

- [ ] DNS de `api.seudominio.com` → IP do droplet, **proxy ligado** (nuvem laranja).
- [ ] SSL/TLS mode: **Full (strict)** (SSL válido no droplet via Forge).
- [ ] Atenção ao limite de tamanho de upload do proxy (100 MB no free — ok para
      fotos de até 4 MB) e a timeouts de requisições longas.

---

## Ordem sugerida no dia do deploy
1. Provisionar VPS (Forge) + PostgreSQL + Redis.
2. Configurar R2 e validar um upload real (seção 1).
3. Configurar Resend (domínio verificado + SPF/DKIM) e subir o queue worker
   (seção 3) — sem isso o cadastro de funcionário fica sem enviar convite.
4. Subir env de produção + deploy do backend + migrations + seeds canônicos.
5. DNS/proxy da API na Cloudflare + SSL.
6. Cloudflare Pages para o frontend com `VITE_API_URL` de produção.
7. Teste E2E em produção: login de cada papel → fluxo do QR → foto aparecendo
   → cadastrar um funcionário e confirmar que o e-mail de convite chegou.
