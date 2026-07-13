package com.dnd.tracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient dnd5eWebClient() {
        return WebClient.builder()
                .baseUrl("https://www.dnd5eapi.co")
                .build();
    }
}
