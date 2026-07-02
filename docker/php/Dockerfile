FROM php:8.3-fpm-alpine

# System deps
RUN apk add --no-cache \
    bash \
    git \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    $PHPIZE_DEPS

# PHP extensions required by the API (MySQL + intl + zip + bcmath)
RUN docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) pdo_mysql intl zip bcmath

# Redis extension (QR token TTL / cache)
RUN pecl install redis \
    && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
