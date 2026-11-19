package pl.watchbrief;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Neon/Render/Supabase podaja adres w formie postgres://user:haslo@host:5432/db?sslmode=require,
 * a JDBC wymaga jdbc:postgresql://host:5432/db?... + osobny user/haslo. Ten processor tlumaczy
 * jedno na drugie, wiec do DATABASE_URL mozna wkleic adres wprost od dostawcy.
 */
public class DatabaseUrlPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication app) {
        String url = env.getProperty("DATABASE_URL");
        Map<String, Object> props = convert(url);
        if (!props.isEmpty()) env.getPropertySources().addFirst(new MapPropertySource("databaseUrl", props));
    }

    static Map<String, Object> convert(String url) {
        Map<String, Object> out = new HashMap<>();
        if (url == null || !(url.startsWith("postgres://") || url.startsWith("postgresql://"))) return out;
        URI uri = URI.create(url);
        StringBuilder jdbc = new StringBuilder("jdbc:postgresql://").append(uri.getHost());
        if (uri.getPort() > 0) jdbc.append(':').append(uri.getPort());
        jdbc.append(uri.getPath());
        if (uri.getRawQuery() != null) jdbc.append('?').append(uri.getRawQuery());
        out.put("spring.datasource.url", jdbc.toString());
        if (uri.getUserInfo() != null) {
            String[] ui = uri.getUserInfo().split(":", 2);
            out.put("spring.datasource.username", ui[0]);
            if (ui.length > 1) out.put("spring.datasource.password", ui[1]);
        }
        return out;
    }
}
