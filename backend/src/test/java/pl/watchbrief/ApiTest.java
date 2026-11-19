package pl.watchbrief;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:test")
@AutoConfigureMockMvc
class ApiTest {
    @Autowired MockMvc mvc;

    @Test
    void offlineSyncFlowIsIdempotentAndFeedsBrief() throws Exception {
        mvc.perform(get("/api/devices")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(10));
        String body = """
            {"id":"u-1","deviceId":"pompa-01","symptom":"Wyciek","priority":"CRITICAL","note":"test"}""";
        for (int i = 0; i < 2; i++)
            mvc.perform(post("/api/reports").contentType(MediaType.APPLICATION_JSON).content(body))
               .andExpect(status().isCreated());
        mvc.perform(get("/api/reports")).andExpect(jsonPath("$.length()").value(6));
        mvc.perform(post("/api/handover/brief")).andExpect(status().isOk())
           .andExpect(jsonPath("$.text").value(org.hamcrest.Matchers.containsString("KRYTYCZNE")));
        mvc.perform(post("/api/reports").contentType(MediaType.APPLICATION_JSON)
           .content("{\"id\":\"x\",\"deviceId\":\"nie-ma\",\"symptom\":\"a\",\"priority\":\"LOW\"}"))
           .andExpect(status().isBadRequest());
    }
}
