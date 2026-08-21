package com.dnd.tracker.service;

import com.dnd.tracker.dto.DndBeyondCharacterDto;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DndBeyondService {

    private static final Pattern CHARACTER_ID_PATTERN = Pattern.compile("characters/(\\d+)");

    private final WebClient dndBeyondWebClient;

    public DndBeyondService(WebClient dndBeyondWebClient) {
        this.dndBeyondWebClient = dndBeyondWebClient;
    }

    public DndBeyondCharacterDto fetchCharacterPreview(String urlOrId) {
        String characterId = extractCharacterId(urlOrId);

        JsonNode response;
        try {
            response = dndBeyondWebClient.get()
                    .uri("/character/v5/character/{id}", characterId)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new IllegalArgumentException(
                    "Couldn't load that character. Make sure it's set to Public under D&D Beyond privacy settings.");
        }

        if (response == null || !response.path("success").asBoolean(false)) {
            throw new IllegalArgumentException(
                    "Couldn't load that character. Make sure it's set to Public under D&D Beyond privacy settings.");
        }

        JsonNode data = response.path("data");

        String name = data.path("name").asText("Imported Character");
        String imageUrl = data.path("decorations").path("avatarUrl").asText(null);

        int maxHp;
        JsonNode overrideHp = data.path("overrideHitPoints");
        if (overrideHp.isInt()) {
            maxHp = overrideHp.asInt();
        } else {
            int base = data.path("baseHitPoints").asInt(1);
            JsonNode bonusHp = data.path("bonusHitPoints");
            int conMod = Math.floorDiv(effectiveStat(data, 3) - 10, 2);
            maxHp = base + (conMod * totalLevel(data)) + (bonusHp.isInt() ? bonusHp.asInt() : 0);
        }

        int dexScore = effectiveStat(data, 2);
        int dexMod = Math.floorDiv(dexScore - 10, 2);
        int armorClass = calculateArmorClass(data, dexMod);

        String classLevel = buildClassLevel(data);
        int strength = effectiveStat(data, 1);
        int constitution = effectiveStat(data, 3);
        int intelligence = effectiveStat(data, 4);
        int wisdom = effectiveStat(data, 5);
        int charisma = effectiveStat(data, 6);

        return new DndBeyondCharacterDto(name, imageUrl, maxHp, armorClass, classLevel,
                strength, dexScore, constitution, intelligence, wisdom, charisma);
    }

    private String buildClassLevel(JsonNode data) {
        List<String> parts = new ArrayList<>();
        for (JsonNode classNode : data.path("classes")) {
            String className = classNode.path("definition").path("name").asText(null);
            int level = classNode.path("level").asInt(0);
            if (className != null && level > 0) {
                parts.add(className + " " + level);
            }
        }
        return parts.isEmpty() ? null : String.join(" / ", parts);
    }

    private String extractCharacterId(String urlOrId) {
        if (urlOrId == null) {
            throw new IllegalArgumentException("Enter a valid D&D Beyond character URL");
        }
        String trimmed = urlOrId.trim();
        Matcher matcher = CHARACTER_ID_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group(1);
        }
        if (trimmed.matches("\\d+")) {
            return trimmed;
        }
        throw new IllegalArgumentException("Enter a valid D&D Beyond character URL");
    }

    private int totalLevel(JsonNode data) {
        int total = 0;
        for (JsonNode classNode : data.path("classes")) {
            total += classNode.path("level").asInt(0);
        }
        return Math.max(total, 1);
    }

    private int effectiveStat(JsonNode data, int statId) {
        Integer override = findStatValue(data.path("overrideStats"), statId);
        if (override != null) {
            return override;
        }
        Integer base = findStatValue(data.path("stats"), statId);
        Integer bonus = findStatValue(data.path("bonusStats"), statId);
        return (base != null ? base : 10) + (bonus != null ? bonus : 0);
    }

    private Integer findStatValue(JsonNode statsArray, int statId) {
        if (!statsArray.isArray()) {
            return null;
        }
        for (JsonNode stat : statsArray) {
            if (stat.path("id").asInt(-1) == statId) {
                JsonNode value = stat.path("value");
                return value.isInt() ? value.asInt() : null;
            }
        }
        return null;
    }

    private int calculateArmorClass(JsonNode data, int dexMod) {
        JsonNode inventory = data.path("inventory");
        Integer bodyArmorAc = null;
        int bodyArmorTypeId = 0;
        int shieldBonus = 0;

        if (inventory.isArray()) {
            for (JsonNode item : inventory) {
                if (!item.path("equipped").asBoolean(false)) {
                    continue;
                }
                JsonNode def = item.path("definition");
                JsonNode acNode = def.path("armorClass");
                if (!acNode.isInt()) {
                    continue;
                }
                int typeId = def.path("armorTypeId").asInt(-1);
                if (typeId == 4) {
                    shieldBonus += acNode.asInt();
                } else if (typeId >= 1 && typeId <= 3) {
                    bodyArmorAc = acNode.asInt();
                    bodyArmorTypeId = typeId;
                }
            }
        }

        int ac;
        if (bodyArmorAc != null) {
            int dexBonus = switch (bodyArmorTypeId) {
                case 1 -> dexMod;
                case 2 -> Math.min(dexMod, 2);
                default -> 0;
            };
            ac = bodyArmorAc + dexBonus;
        } else {
            ac = 10 + dexMod;
        }
        ac += shieldBonus;
        ac += flatArmorClassBonus(data.path("modifiers"));
        return ac;
    }

    private int flatArmorClassBonus(JsonNode modifiers) {
        if (!modifiers.isObject()) {
            return 0;
        }
        int total = 0;
        Iterator<JsonNode> categories = modifiers.elements();
        while (categories.hasNext()) {
            JsonNode category = categories.next();
            if (!category.isArray()) {
                continue;
            }
            for (JsonNode modifier : category) {
                String type = modifier.path("type").asText("");
                String subType = modifier.path("subType").asText("");
                if ("bonus".equals(type) && "armor-class".equals(subType)) {
                    JsonNode value = modifier.path("value");
                    if (value.isInt()) {
                        total += value.asInt();
                    }
                }
            }
        }
        return total;
    }
}
