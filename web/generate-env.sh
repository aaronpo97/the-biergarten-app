#!/usr/bin/env bash
#
# generate_env.sh
#
# Generates a Biergarten App environment file with freshly randomized
# secrets (DB password, JWT signing secrets, SMTP credentials), based on
# the .env.example template. Non-secret configuration values are left
# untouched so the file still matches the documented template structure.
#
# Usage:
#   ./generate_env.sh [output_file] [template_file]
#
#   output_file    Path to write the generated env file to (default: .env)
#   template_file  Path to the source template (default: .env.example)

#!/usr/bin/env bash

set -euo pipefail

OUTPUT_FILE="${1:-.env}"
TEMPLATE_FILE="${2:-.env.example}"

if ! command -v openssl >/dev/null 2>&1; then
    echo "Error: openssl is required but was not found on PATH." >&2
    exit 1
fi

if [[ ! -f "$TEMPLATE_FILE" ]]; then
    echo "Error: template file '$TEMPLATE_FILE' not found." >&2
    echo "Pass the template path explicitly: ./generate_env.sh <output> <template>" >&2
    exit 1
fi

if [[ -f "$OUTPUT_FILE" ]]; then
    read -r -p "Warning: '$OUTPUT_FILE' already exists. Overwrite? [y/N] " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Aborted. No file was written."
        exit 1
    fi
fi

gen_jwt_secret() {
    openssl rand -base64 32 | tr -d '\n'
}

gen_password() {
    printf '%s!' "$(openssl rand -hex 24)"
}

gen_username() {
    openssl rand -hex 6
}

DB_PASSWORD_VAL=$(gen_password)
ACCESS_TOKEN_SECRET_VAL=$(gen_jwt_secret)
REFRESH_TOKEN_SECRET_VAL=$(gen_jwt_secret)
CONFIRMATION_TOKEN_SECRET_VAL=$(gen_jwt_secret)
SMTP_USERNAME_VAL="smtp_$(gen_username)"
SMTP_PASSWORD_VAL=$(gen_password)
SEAWEEDFS_ACCESS_KEY_ID_VAL=$(gen_username)
SEAWEEDFS_SECRET_ACCESS_KEY_VAL=$(gen_password)

cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

TMP_FILE="$(mktemp)"
sed \
    -e "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD_VAL}|" \
    -e "s|^ACCESS_TOKEN_SECRET=.*|ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET_VAL}|" \
    -e "s|^REFRESH_TOKEN_SECRET=.*|REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET_VAL}|" \
    -e "s|^CONFIRMATION_TOKEN_SECRET=.*|CONFIRMATION_TOKEN_SECRET=${CONFIRMATION_TOKEN_SECRET_VAL}|" \
    -e "s|^SMTP_USERNAME=.*|SMTP_USERNAME=${SMTP_USERNAME_VAL}|" \
    -e "s|^SMTP_PASSWORD=.*|SMTP_PASSWORD=${SMTP_PASSWORD_VAL}|" \
    -e "s|^SEAWEEDFS_ACCESS_KEY_ID=.*|SEAWEEDFS_ACCESS_KEY_ID=${SEAWEEDFS_ACCESS_KEY_ID_VAL}|" \
    -e "s|^SEAWEEDFS_SECRET_ACCESS_KEY=.*|SEAWEEDFS_SECRET_ACCESS_KEY=${SEAWEEDFS_SECRET_ACCESS_KEY_VAL}|" \
    "$OUTPUT_FILE" > "$TMP_FILE"
mv "$TMP_FILE" "$OUTPUT_FILE"

chmod 600 "$OUTPUT_FILE"

echo "Generated '$OUTPUT_FILE' with fresh random secrets (file permissions set to 600)."
echo "Reminder: SMTP_USERNAME/SMTP_PASSWORD were randomized as dev placeholders."
echo "For staging/production, replace them with real credentials from your SMTP provider."
