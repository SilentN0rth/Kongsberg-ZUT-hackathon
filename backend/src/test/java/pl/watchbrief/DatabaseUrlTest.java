package pl.watchbrief;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class DatabaseUrlTest {
    @Test
    void convertsProviderUrlToJdbc() {
        var p = DatabaseUrlPostProcessor.convert("postgres://u1:p%40ss@ep-x.neon.tech/neondb?sslmode=require");
        assertEquals("jdbc:postgresql://ep-x.neon.tech/neondb?sslmode=require", p.get("spring.datasource.url"));
        assertEquals("u1", p.get("spring.datasource.username"));
        assertEquals("p@ss", p.get("spring.datasource.password"));
    }

    @Test
    void leavesJdbcAndEmptyUntouched() {
        assertTrue(DatabaseUrlPostProcessor.convert("jdbc:postgresql://h/db").isEmpty());
        assertTrue(DatabaseUrlPostProcessor.convert(null).isEmpty());
    }
}
