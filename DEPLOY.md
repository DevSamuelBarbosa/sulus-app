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
| Backend (Laravel/PHP) | VPS + **Docker Compose** (`prod-docker-compose.yml`) | ~US$6–12/mês |
| Banco (PostgreSQL) | Container no próprio VPS (início) → Managed DB depois | — |
| Cache/QR tokens (Redis) | Container no próprio VPS | — |
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

## 2. Backend (Laravel) — VPS + Docker Compose

### Recomendado: DigitalOcean (ou Hetzner) + `prod-docker-compose.yml`
Sem Forge: o próprio `prod-docker-compose.yml` do repo sobe nginx + PHP-FPM +
PostgreSQL + Redis + queue worker, cada um em um container, com `restart:
unless-stopped` — é o equivalente em produção do que o `dev-docker-compose.yml`
faz localmente, só que sem Mailpit, sem portas de banco/Redis expostas ao
host, e com volumes nomeados próprios (`postgres-data-prod`, `redis-data-prod`).

### Checklist do servidor
- [ ] Criar droplet (Ubuntu LTS), instalar Docker Engine + plugin
      `docker compose`.
- [ ] `git clone` do repo no droplet (ex.: `/srv/sulus-app`).
- [ ] Copiar `backend/.env.production` pro servidor e preencher **todos** os
      valores (`APP_KEY`, `DB_USERNAME`/`DB_PASSWORD`, `REDIS_PASSWORD`, R2,
      Resend — ver seção 6). Esse arquivo alimenta tanto os containers
      `app`/`queue` quanto as credenciais dos containers `postgres`/`redis`
      (ver comentário no topo do próprio arquivo).
- [ ] Subir a stack:
      ```bash
      docker compose -f prod-docker-compose.yml --env-file backend/.env.production up -d --build
      ```
- [ ] Rodar migrations + otimizações + link de storage:
      ```bash
      docker compose -f prod-docker-compose.yml exec app php artisan migrate --force
      docker compose -f prod-docker-compose.yml exec app php artisan config:cache route:cache event:cache
      docker compose -f prod-docker-compose.yml exec app php artisan storage:link
      ```
- [ ] Seed inicial **apenas** de dados canônicos: `db:seed --class=StateSeeder`,
      `CitySeeder`, `CategorySeeder`. **Não** rodar `DemoSeeder` em produção.
- [ ] SSL: ver seção 7 — sem Forge não há Let's Encrypt automático; usar
      Cloudflare Origin Certificate no nginx (modo Full strict) ou, como
      atalho inicial, Cloudflare em modo Flexible.
- [ ] **Queue worker obrigatório** (não é mais opcional): o convite de e-mail do
      funcionário (`App\Mail\EmployeeInviteMail`) é `ShouldQueue`, então sem um
      worker rodando o e-mail nunca sai — fica parado na tabela `jobs` pra
      sempre. Aqui isso já é o serviço `queue` do compose, com
      `restart: unless-stopped` — não precisa de Supervisor/Daemon separado.
- [ ] Redeploy em mudanças futuras: `git pull` no droplet seguido de
      `docker compose -f prod-docker-compose.yml --env-file backend/.env.production up -d --build`.

### DB e Redis
No início rodam como containers no próprio droplet (simples/barato, dados em
volumes Docker nomeados). Depois, se quiser backup automático e HA, trocar o
serviço `postgres` do compose por um **Managed Database** da DigitalOcean
(só muda `DB_HOST`/`DB_PORT`/`DB_SSLMODE` no `.env.production`, sem tocar no
código).

---

## 3. E-mail transacional — Resend

Usado hoje só para o convite de ativação do funcionário
(`App\Mail\EmployeeInviteMail`, enviado por `EmployeeActivationService`). Em
dev local isso cai no **Mailpit** (`dev-docker-compose.yml`, UI em
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
DB_HOST=postgres           # nome do serviço no prod-docker-compose.yml; host/IP se usar managed DB
DB_PORT=5432
DB_DATABASE=sulus
DB_USERNAME=...
DB_PASSWORD=...
# DB_SSLMODE=require        # exigido por alguns Postgres gerenciados (ex.: DO Managed DB)

CACHE_STORE=redis
REDIS_HOST=redis           # nome do serviço no prod-docker-compose.yml
REDIS_PASSWORD=...         # obrigatório — usado também pelo container redis (--requirepass)
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
- [ ] SSL/TLS mode: **Full (strict)**. Sem Forge não há Let's Encrypt
      automático — gerar um **Cloudflare Origin Certificate** (painel
      **SSL/TLS → Origin Server**), montar `cert.pem`/`key.pem` no container
      `nginx` (volume + bloco `listen 443 ssl` no `docker/nginx/default.conf`)
      e liberar a porta 443 no `prod-docker-compose.yml`. Enquanto o domínio
      não está pronto, dá pra começar em modo **Flexible** (sem cert no
      droplet) e trocar pra Full strict quando o Origin Certificate estiver
      instalado.
- [ ] Atenção ao limite de tamanho de upload do proxy (100 MB no free — ok para
      fotos de até 4 MB) e a timeouts de requisições longas.

---

## Ordem sugerida no dia do deploy
1. Provisionar VPS (Docker + `prod-docker-compose.yml`, seção 2).
2. Configurar R2 e validar um upload real (seção 1).
3. Configurar Resend (domínio verificado + SPF/DKIM) e subir o queue worker
   (seção 3) — sem isso o cadastro de funcionário fica sem enviar convite.
4. Subir env de produção + deploy do backend + migrations + seeds canônicos.
5. DNS/proxy da API na Cloudflare + SSL.
6. Cloudflare Pages para o frontend com `VITE_API_URL` de produção.
7. Teste E2E em produção: login de cada papel → fluxo do QR → foto aparecendo
   → cadastrar um funcionário e confirmar que o e-mail de convite chegou.
