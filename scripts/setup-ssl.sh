#!/bin/bash

# SSL Certificate Setup for MatTailor AI
# This script sets up SSL certificates using Let's Encrypt for production deployment

set -e

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <domain>"
    echo "Example: $0 mattailor.com"
    exit 1
fi

DOMAIN=$1
SSL_DIR="./nginx/ssl"

echo "Setting up SSL certificates for domain: $DOMAIN"

# Create SSL directory
mkdir -p $SSL_DIR

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    else
        echo "Please install certbot manually"
        exit 1
    fi
fi

# Stop nginx if running
docker-compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true

# Generate certificates
echo "Generating SSL certificates..."
sudo certbot certonly \
    --standalone \
    --email admin@$DOMAIN \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    -d monitoring.$DOMAIN

# Copy certificates to nginx SSL directory
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/

# Set proper permissions
sudo chown $USER:$USER $SSL_DIR/*.pem
chmod 644 $SSL_DIR/fullchain.pem
chmod 600 $SSL_DIR/privkey.pem

echo "SSL certificates generated successfully!"
echo "Certificates location: $SSL_DIR"

# Create renewal script
cat > ./scripts/renew-ssl.sh << EOF
#!/bin/bash
# SSL Certificate Renewal Script
sudo certbot renew --quiet
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/
sudo chown $USER:$USER $SSL_DIR/*.pem
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
EOF

chmod +x ./scripts/renew-ssl.sh

echo "Created renewal script: ./scripts/renew-ssl.sh"
echo "Add this to crontab for automatic renewal:"
echo "0 2 * * 0 /path/to/mattailor/scripts/renew-ssl.sh"