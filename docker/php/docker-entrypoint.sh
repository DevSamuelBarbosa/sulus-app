#!/bin/sh
set -e

# storage/ and bootstrap/cache are bind-mounted from the host, so they're
# owned by the host user's UID — not php-fpm's www-data. Without this, any
# write (logs, cache, file uploads) fails with a permission error.
chmod -R 777 storage bootstrap/cache 2>/dev/null || true

exec "$@"
