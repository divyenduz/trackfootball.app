#!/bin/bash

# Generate environment configuration file from environment variables
# Usage: ./generate-env-config.sh

# Output file
OUTPUT_FILE="packages/rw-app/.dev.vars"

# Function to resolve environment variable or show placeholder
resolve_env() {
    local var_name="$1"
    local value="${!var_name}"
    if [ -n "$value" ]; then
        echo "$var_name=$value"
    else
        echo "$var_name=<$var_name not set in environment>"
    fi
}

# Generate the configuration file
cat > "$OUTPUT_FILE" << EOF
# Environment Configuration
# Generated on $(date)

$(resolve_env "BACKEND_API")
$(resolve_env "DATABASE_URL")
$(resolve_env "COOKIE_DOMAIN")
$(resolve_env "MAPBOX_API_TOKEN")
$(resolve_env "STRAVA_CLIENT_ID")
$(resolve_env "STRAVA_CLIENT_SECRET")
$(resolve_env "HOMEPAGE_URL")
$(resolve_env "NO_COLOR")
$(resolve_env "AUTH0_SECRET")
$(resolve_env "AUTH0_BASE_URL")
$(resolve_env "AUTH0_ISSUER_BASE_URL")
$(resolve_env "AUTH0_CLIENT_ID")
$(resolve_env "AUTH0_CLIENT_SECRET")
$(resolve_env "DISCORD_TRACKFOOTBALL_APPLICATION_EVENTS_WEBHOOK")
$(resolve_env "UNSAFE_AUTH_BYPASS_USER")
$(resolve_env "STRAVA_WEBHOOK_VERIFY_TOKEN")
EOF

echo "Environment configuration generated in $OUTPUT_FILE"