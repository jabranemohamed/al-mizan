package com.mizan.almizan.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Converts Render's DATABASE_URL (postgres://user:pass@host:port/db)
 * to Spring Boot's JDBC format (jdbc:postgresql://host:port/db).
 */
@Configuration
@Profile("render")
public class RenderDatabaseConfig {

    @Bean
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties props = new DataSourceProperties();

        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && databaseUrl.startsWith("postgres")) {
            try {
                URI uri = new URI(databaseUrl);
                String jdbcUrl = "jdbc:postgresql://" + uri.getHost()
                        + ":" + uri.getPort()
                        + uri.getPath()
                        + "?sslmode=require";

                String[] userInfo = uri.getUserInfo().split(":");
                props.setUrl(jdbcUrl);
                props.setUsername(userInfo[0]);
                props.setPassword(userInfo[1]);
                props.setDriverClassName("org.postgresql.Driver");
            } catch (URISyntaxException e) {
                throw new RuntimeException("Invalid DATABASE_URL: " + databaseUrl, e);
            }
        }

        return props;
    }
}
