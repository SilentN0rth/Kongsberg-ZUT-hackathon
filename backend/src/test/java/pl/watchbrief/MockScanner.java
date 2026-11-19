package pl.watchbrief;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Mock skanera z kolejka offline: zbiera zgloszenia, a flush() wysyla je tak, jak zrobilby to klient
 * po powrocie sieci. Pozwala testowac ponowna wysylke (retry) i idempotentnosc po id.
 */
class MockScanner {
    private final List<String> queue = new ArrayList<>();

    /** Dodaje zgloszenie do kolejki (offline) i zwraca jego id. */
    String enqueue(String deviceId, String symptom, Priority priority, String note) {
        String id = "mock-" + UUID.randomUUID();
        queue.add("""
                {"id":"%s","deviceId":"%s","symptom":"%s","priority":"%s","note":%s}"""
                .formatted(id, deviceId, symptom, priority, note == null ? "null" : "\"" + note + "\""));
        return id;
    }

    int pending() { return queue.size(); }

    /** Wysyla cala kolejke; oczekuje 201 dla kazdego wpisu. Kolejka sie oproznia. */
    void flush(MockMvc mvc) throws Exception {
        send(mvc, queue);
        queue.clear();
    }

    /** Symuluje zerwanie lacznosci: wysyla tylko pierwsze n wpisow, a reszta zostaje w kolejce. */
    void flushPartially(MockMvc mvc, int n) throws Exception {
        List<String> head = new ArrayList<>(queue.subList(0, Math.min(n, queue.size())));
        send(mvc, head);
        queue.removeAll(head);
    }

    /** Wysyla jeszcze raz to, co juz poszlo (np. klient nie dostal odpowiedzi) - nie moze robic duplikatow. */
    void resend(MockMvc mvc, List<String> bodies) throws Exception {
        send(mvc, bodies);
    }

    List<String> snapshot() { return List.copyOf(queue); }

    private static void send(MockMvc mvc, List<String> bodies) throws Exception {
        for (String body : bodies)
            mvc.perform(post("/api/reports").contentType(MediaType.APPLICATION_JSON).content(body))
               .andExpect(status().isCreated());
    }
}
