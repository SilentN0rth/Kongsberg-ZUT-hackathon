package pl.watchbrief;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** CORS potrzebny tylko gdy front wola backend bezposrednio; przez rewrite Next (/api/*) niepotrzebny. */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${watchbrief.cors-origins}")
    private String[] origins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET", "POST", "PATCH", "OPTIONS");
    }
}
