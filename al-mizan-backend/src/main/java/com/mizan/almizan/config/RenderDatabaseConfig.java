package com.mizan.almizan.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Render.com specific configuration.
 * Database connection is handled via application.yml render profile
 * using individual env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.
 */
@Configuration
@Profile("render")
public class RenderDatabaseConfig {
    // No custom beans needed — Spring Boot auto-configures from application.yml
}
