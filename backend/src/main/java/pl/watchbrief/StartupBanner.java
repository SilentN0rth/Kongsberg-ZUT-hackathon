package pl.watchbrief;

import java.net.Inet4Address;
import java.net.NetworkInterface;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Po starcie wypisuje adresy, pod ktorymi skanery moga dosiegnac backend w sieci lokalnej. */
@Component
public class StartupBanner {
    private static final Logger log = LoggerFactory.getLogger(StartupBanner.class);

    @Value("${server.port}")
    private int port;

    @EventListener(ApplicationReadyEvent.class)
    public void print() {
        log.info("WatchBrief backend dziala. Adresy w sieci lokalnej:");
        try {
            for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                if (!ni.isUp() || ni.isLoopback() || ni.isVirtual()) continue;
                for (var addr : Collections.list(ni.getInetAddresses()))
                    if (addr instanceof Inet4Address)
                        log.info("  http://{}:{}/api/health   ({})", addr.getHostAddress(), port, ni.getDisplayName());
            }
        } catch (Exception e) {
            log.warn("Nie udalo sie ustalic adresow sieciowych", e);
        }
    }
}
