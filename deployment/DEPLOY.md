# ClipperCartel — Deployment

Target: shared cPanel on Spaceship (`server39.shared.spaceship.host`,
SSH alias `hostingserver1`, user `iuewrgivrh`). First deploy lives at
**clippercartel.mgbah.dev**; the `.com` move is a later DNS flip.

The repo intentionally carries NO secrets. Everything secret lives in
the host's `.env`, created by hand on first deploy. See
[env.production.example](env.production.example) for the exact fields.

## Pre-flight (local)

```bash
# Clean tree, right branch, right commit.
git status                        # expect: nothing to commit
git log -1 --oneline              # confirm the SHA you intend to ship
git push origin main              # host doesn't track git; this is for the record
```

Compose a build-sentinel so you know what landed. The deploy itself
doesn't need it, but a `.sha` file on the host makes "what's running?"
answerable from a shell:

```bash
git rev-parse --short HEAD > .deploy-sha
```

## 1. Database (first deploy only)

cPanel's shell MySQL user is nobody — provisioning happens through UAPI.

```bash
ssh hostingserver1 '
  uapi Mysql create_database  name=iuewrgivrh_clippercartel
  uapi Mysql create_user      name=iuewrgivrh_cartel  password="$(openssl rand -base64 24)"
  uapi Mysql set_privileges_on_database \
       user=iuewrgivrh_cartel database=iuewrgivrh_clippercartel privileges=ALL
'
```

Capture the generated password; it goes into the host `.env` as `DB_PASS`.
If you lose it, re-run `set_password` with a new one.

## 2. Push the code

Keep this exclude list in sync with any folders you add that are
local-only or secret-bearing.

```bash
rsync -avz --delete \
  --exclude='.git/' \
  --exclude='.env' \
  --exclude='node_modules/' \
  --exclude='.deploy-sha' \
  --exclude='*.test.pem' \
  --exclude='*.test-key.pem' \
  --exclude='storage/logs/' \
  ./  hostingserver1:~/clippercartel.mgbah.dev/
```

Set the sentinel from a second rsync (or via ssh echo):

```bash
scp .deploy-sha hostingserver1:~/clippercartel.mgbah.dev/.deploy-sha
```

## 3. Host-side `.env`

```bash
ssh hostingserver1
cd ~/clippercartel.mgbah.dev
cp deployment/env.production.example .env
nano .env    # fill in DB_*, TELEGRAM_*, OWNER_EMAIL, APP_URL
chmod 600 .env
```

Minimum required:

```
APP_URL=https://clippercartel.mgbah.dev
APP_ENV=production
DB_HOST=localhost
DB_NAME=iuewrgivrh_clippercartel
DB_USER=iuewrgivrh_cartel
DB_PASS=<the password from step 1>
TELEGRAM_BOT_TOKEN=<from BotFather>
TELEGRAM_OWNER_CHAT_ID=<from bootstrap_telegram_chat.php>
OWNER_EMAIL=<owner's email>
```

Everything else (SMTP, Turnstile) can stay blank and the stack degrades
gracefully (email goes nowhere, Turnstile fails-open in dev / fails-closed
in production per `verifyTurnstile()`).

## 4. Schema + seed

```bash
ssh hostingserver1 '
  cd ~/clippercartel.mgbah.dev
  php database/migrate.php
  php database/seed.php
  php database/create_admin.php <owner@email> "<Owner Name>"
'
```

The migrator is idempotent; re-running on a redeploy is safe. The
seeder uses `INSERT IGNORE` / `ON DUPLICATE KEY UPDATE` — also safe.
`create_admin.php` with no password arg prints a random one once;
copy it, give it to the owner, delete it from your scrollback.

## 5. Telegram bootstrap (first deploy only)

```bash
ssh hostingserver1 'cd ~/clippercartel.mgbah.dev && php database/bootstrap_telegram_chat.php'
```

Have the owner DM the bot first (one tap on `t.me/<bot_username>`),
then run the script to grab his chat_id, paste it into the host
`.env` as `TELEGRAM_OWNER_CHAT_ID`.

## 6. Smoke test

```bash
# Shell works, serves the SPA shell:
curl -sI https://clippercartel.mgbah.dev/ | head -3

# Admin login page renders:
curl -sI https://clippercartel.mgbah.dev/admin/login | head -3

# API endpoint reachable (expect validation error, that proves it ran):
curl -s -X POST https://clippercartel.mgbah.dev/api/booking.php \
  -H 'Content-Type: application/json' -d '{}'

# Live-fire booking (expect owner's phone to ping):
curl -s -X POST https://clippercartel.mgbah.dev/api/booking.php \
  -H 'Content-Type: application/json' \
  -d '{"name":"Deploy test","phone":"+2340000000000","service":"Fade","date":"2030-01-01","time":"10:00"}'
```

Delete the deploy-test booking from the admin after.

## 7. Cron (if/when we need it)

**Nothing scheduled yet.** When we do add anything (daily backup,
reminders, cleanup), it is appended, never replaced:

```bash
ssh hostingserver1 '
  crontab -l > /tmp/ct
  echo "0 2 * * * cd ~/clippercartel.mgbah.dev && php database/backup.php"  >> /tmp/ct
  crontab /tmp/ct
  crontab -l | grep clippercartel        # confirm it is there
  crontab -l | wc -l                     # confirm NOTHING ELSE was lost
'
```

This host runs crons for other projects (acemail, ballersproleague,
africhart). **Never run `crontab <file>` with a file that only contains
your own entries** — it wipes the other sites' schedules silently.
See `~/.claude/CLAUDE.md` on this exact failure mode.

## Redeploys

Steps 2 and 6. Skip 1 (DB exists), 3 (`.env` stays), 4 (if no new
migrations/seeds), 5 (chat_id already set), 7 (crontab untouched).

If step 4 adds a new migration, back the DB up first:

```bash
ssh hostingserver1 '
  mysqldump --defaults-file=~/.my.cnf iuewrgivrh_clippercartel \
    > ~/backups/clippercartel-$(date +%Y%m%d-%H%M%S).sql
'
```

## Rollback

```bash
# Local
git checkout <previous-good-sha>
# Then re-run step 2 (rsync).

# For a bad schema change, restore the dump taken in the redeploy step.
```

## What's NOT in this procedure

- **No git on the host.** Code is pushed with rsync; `.git` is in the
  exclude list.
- **No composer/npm.** The repo already carries `vendor/` for PHPMailer;
  the frontend has no build step.
- **No DNS / cert work.** cPanel provisioned `clippercartel.mgbah.dev`
  on account creation; HTTPS is Spaceship AutoSSL.
- **No shared crontab destruction.** See step 7.
