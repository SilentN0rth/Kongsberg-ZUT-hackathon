package pl.watchbrief;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

/** Osobna baza w pamieci (nie wspoldzielona z ApiTest), a kazdy test zaczyna od czystego scenariusza. */
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:scenarios")
@AutoConfigureMockMvc
class DemoScenariosTest {
    @Autowired MockMvc mvc;

    @BeforeEach
    void clean() throws Exception {
        mvc.perform(post("/api/demo/scenarios/quiet")).andExpect(status().isOk());
    }

    @Test
    void listsScenarios() throws Exception {
        mvc.perform(get("/api/demo/scenarios")).andExpect(status().isOk())
           .andExpect(jsonPath("$.length()").value(4));
    }

    @Test
    void quietHasNoReportsAndCalmBrief() throws Exception {
        mvc.perform(get("/api/reports")).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/api/handover/brief")).andExpect(jsonPath("$.text").value(containsString("spokojna")));
    }

    @Test
    void busyHasEighteenReports() throws Exception {
        mvc.perform(post("/api/demo/scenarios/busy")).andExpect(status().isOk());
        mvc.perform(get("/api/reports")).andExpect(jsonPath("$.length()").value(18));
        // deterministyczne: ten sam wynik po ponownym zaladowaniu
        mvc.perform(post("/api/demo/scenarios/busy")).andExpect(status().isOk());
        mvc.perform(get("/api/reports")).andExpect(jsonPath("$.length()").value(18));
    }

    @Test
    void criticalScenarioFeedsBrief() throws Exception {
        mvc.perform(post("/api/demo/scenarios/critical")).andExpect(status().isOk());
        mvc.perform(post("/api/handover/brief"))
           .andExpect(jsonPath("$.text").value(containsString("krytyczne: 6")));
    }

    @Test
    void unknownScenarioIsBadRequest() throws Exception {
        mvc.perform(post("/api/demo/scenarios/nie-ma")).andExpect(status().isBadRequest());
    }

    @Test
    void simulateAddsRequestedNumberOfReports() throws Exception {
        mvc.perform(post("/api/demo/scenarios/basic")).andExpect(status().isOk());
        mvc.perform(post("/api/demo/simulate?count=3")).andExpect(status().isOk())
           .andExpect(jsonPath("$.length()").value(3));
        mvc.perform(get("/api/reports")).andExpect(jsonPath("$.length()").value(8));
        mvc.perform(post("/api/demo/simulate?count=0")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/demo/simulate?count=21")).andExpect(status().isBadRequest());
    }

    @Test
    void resetReturnsToBasic() throws Exception {
        mvc.perform(post("/api/demo/scenarios/busy")).andExpect(status().isOk());
        mvc.perform(post("/api/demo/reset")).andExpect(status().isOk());
        mvc.perform(get("/api/reports")).andExpect(jsonPath("$.length()").value(5));
        mvc.perform(post("/api/handover/brief")).andExpect(jsonPath("$.text").value(not(containsString("spokojna"))));
    }

    @Test
    void mockScannerOfflineQueueSyncIsIdempotent() throws Exception {
        mvc.perform(post("/api/demo/scenarios/quiet")).andExpect(status().isOk());
        MockScanner scanner = new MockScanner();
        scanner.enqueue("pompa-01", "Wyciek", Priority.CRITICAL, "offline 1");
        scanner.enqueue("ster-01", "Brak odpowiedzi", Priority.CRITICAL, null);
        scanner.enqueue("winda-01", "Drgania", Priority.LOW, "offline 3");
        java.util.List<String> all = scanner.snapshot();

        scanner.flushPartially(mvc, 2);            // lacznosc zerwana po 2 wpisach
        org.junit.jupiter.api.Assertions.assertEquals(1, scanner.pending());
        scanner.resend(mvc, all);                   // klient wysyla wszystko jeszcze raz po powrocie sieci
        scanner.flush(mvc);                         // i jeszcze raz resztke kolejki

        mvc.perform(get("/api/reports")).andExpect(jsonPath("$.length()").value(3));
    }
}
