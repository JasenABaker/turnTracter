package com.dnd.tracker.service;

import com.dnd.tracker.model.Combatant;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class BestiaryService {

    private static final Logger log = LoggerFactory.getLogger(BestiaryService.class);

    private final WebClient dnd5eWebClient;

    public BestiaryService(WebClient dnd5eWebClient) {
        this.dnd5eWebClient = dnd5eWebClient;
    }

    public Combatant fetchMonster(String name, Integer initiativeScore) {
        String index = name.trim().toLowerCase().replaceAll("\\s+", "-");

        JsonNode response;
        try {
            response = dnd5eWebClient.get()
                    .uri("/api/monsters/{index}", index)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new IllegalArgumentException("Monster not found: " + name);
        }

        if (response == null) {
            throw new IllegalArgumentException("Empty response for monster: " + name);
        }

        int hitPoints = response.path("hit_points").asInt(10);

        int armorClass = 10;
        JsonNode acNode = response.path("armor_class");
        if (acNode.isArray() && !acNode.isEmpty()) {
            armorClass = acNode.get(0).path("value").asInt(10);
        }

        String imageUrl = null;
        if (response.has("image") && !response.path("image").isNull()) {
            imageUrl = "https://www.dnd5eapi.co" + response.path("image").asText();
        }

        String monsterName = response.path("name").asText(name);
        int initiative = (initiativeScore != null) ? initiativeScore : 10;

        Combatant combatant = new Combatant();
        combatant.setName(monsterName);
        combatant.setImageUrl(imageUrl);
        combatant.setInitiativeScore(initiative);
        combatant.setHp(hitPoints);
        combatant.setCurrentHp(hitPoints);
        combatant.setArmorClass(armorClass);
        combatant.setIsMonster(true);
        return combatant;
    }
}
