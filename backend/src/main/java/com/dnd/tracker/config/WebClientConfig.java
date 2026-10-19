package com.dnd.tracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient dnd5eWebClient() {
        return WebClient.builder()
                .baseUrl("https://www.dnd5eapi.co")
                .build();
    }

    @Bean
    public WebClient dndBeyondWebClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                .build();
        return WebClient.builder()
                .baseUrl("https://character-service.dndbeyond.com")
                .exchangeStrategies(strategies)
                .build();
    }

    @Bean
    public WebClient dndBeyondMonsterWebClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
                .build();
        return WebClient.builder()
                .baseUrl("https://www.dndbeyond.com")
                .exchangeStrategies(strategies)
                .build();
    }
}
