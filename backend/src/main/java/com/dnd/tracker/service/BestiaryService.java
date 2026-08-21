package com.dnd.tracker.service;

import com.dnd.tracker.dto.BulkImportResultDto;
import com.dnd.tracker.model.Combatant;
import com.dnd.tracker.model.CombatantEntry;
import com.dnd.tracker.model.Companion;
import com.dnd.tracker.model.CompanionEntry;
import com.dnd.tracker.repository.CombatantRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class BestiaryService {

    private static final Logger log = LoggerFactory.getLogger(BestiaryService.class);

    private final WebClient dnd5eWebClient;
    private final CombatantRepository combatantRepository;
    private final CombatantService combatantService;

    public BestiaryService(WebClient dnd5eWebClient, CombatantRepository combatantRepository,
                            CombatantService combatantService) {
        this.dnd5eWebClient = dnd5eWebClient;
        this.combatantRepository = combatantRepository;
        this.combatantService = combatantService;
    }

    public List<String> listAllMonsterNames() {
        JsonNode response = dnd5eWebClient.get()
                .uri("/api/2014/monsters")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        List<String> names = new ArrayList<>();
        if (response == null) {
            return names;
        }
        for (JsonNode entry : response.path("results")) {
            String name = entry.path("name").asText(null);
            if (name != null && !name.isEmpty()) {
                names.add(name);
            }
        }
        return names;
    }

    public BulkImportResultDto importAllMonsters() {
        Set<String> existingNames = combatantRepository.findByEncounterIsNullOrderByNameAsc().stream()
                .map(c -> c.getName().toLowerCase(Locale.ROOT))
                .collect(java.util.stream.Collectors.toSet());

        int imported = 0;
        int skipped = 0;
        List<String> failed = new ArrayList<>();

        for (String name : listAllMonsterNames()) {
            if (existingNames.contains(name.toLowerCase(Locale.ROOT))) {
                skipped++;
                continue;
            }
            try {
                Combatant combatant = fetchMonster(name, 0);
                combatantService.createTemplate(combatant);
                imported++;
            } catch (Exception e) {
                log.warn("Failed to import monster '{}' from bestiary", name, e);
                failed.add(name);
            }
        }

        return new BulkImportResultDto(imported, skipped, failed);
    }

    public Combatant fetchMonster(String name, Integer initiativeScore) {
        JsonNode response = fetchMonsterJson(name, "Monster not found");

        int initiative = (initiativeScore != null) ? initiativeScore : 10;

        Combatant combatant = new Combatant();
        combatant.setName(response.path("name").asText(name));
        combatant.setImageUrl(extractImageUrl(response));
        combatant.setInitiativeScore(initiative);
        combatant.setHp(extractHitPoints(response));
        combatant.setCurrentHp(combatant.getHp());
        combatant.setArmorClass(extractArmorClass(response));
        combatant.setIsMonster(true);

        combatant.setSize(response.path("size").asText(null));
        combatant.setCreatureType(response.path("type").asText(null));
        combatant.setAlignment(response.path("alignment").asText(null));
        combatant.setChallengeRating(formatChallengeRating(response.path("challenge_rating")));

        combatant.setSpeed(flattenSpeed(response.path("speed")));

        combatant.setStrength(response.path("strength").asInt(10));
        combatant.setDexterity(response.path("dexterity").asInt(10));
        combatant.setConstitution(response.path("constitution").asInt(10));
        combatant.setIntelligence(response.path("intelligence").asInt(10));
        combatant.setWisdom(response.path("wisdom").asInt(10));
        combatant.setCharisma(response.path("charisma").asInt(10));

        combatant.setDamageImmunities(joinNames(response.path("damage_immunities")));
        combatant.setDamageResistances(joinNames(response.path("damage_resistances")));
        combatant.setDamageVulnerabilities(joinNames(response.path("damage_vulnerabilities")));
        combatant.setConditionImmunities(joinNames(response.path("condition_immunities")));

        combatant.setSenses(flattenSenses(response.path("senses")));
        combatant.setLanguages(response.path("languages").asText(""));

        addEntriesFromArray(combatant, response.path("special_abilities"), "trait");
        addEntriesFromArray(combatant, response.path("actions"), "action");
        addEntriesFromArray(combatant, response.path("reactions"), "reaction");
        addEntriesFromArray(combatant, response.path("legendary_actions"), "legendary-action");
        // No dedicated "lair_actions" array exists in this API for most monsters - left for manual entry.
        // No "bonus_actions" field exists in this API in either ruleset version - left for manual entry.

        return combatant;
    }

    public Companion fetchCompanion(String name) {
        JsonNode response = fetchMonsterJson(name, "Creature not found in bestiary");

        Companion companion = new Companion();
        companion.setName(response.path("name").asText(name));
        companion.setImageUrl(extractImageUrl(response));

        int hitPoints = extractHitPoints(response);
        companion.setMaxHp(hitPoints);
        companion.setCurrentHp(hitPoints);
        companion.setArmorClass(extractArmorClass(response));

        companion.setSpeed(flattenSpeed(response.path("speed")));

        companion.setStrength(response.path("strength").asInt(10));
        companion.setDexterity(response.path("dexterity").asInt(10));
        companion.setConstitution(response.path("constitution").asInt(10));
        companion.setIntelligence(response.path("intelligence").asInt(10));
        companion.setWisdom(response.path("wisdom").asInt(10));
        companion.setCharisma(response.path("charisma").asInt(10));

        companion.setDamageImmunities(joinNames(response.path("damage_immunities")));
        companion.setDamageResistances(joinNames(response.path("damage_resistances")));
        companion.setDamageVulnerabilities(joinNames(response.path("damage_vulnerabilities")));
        companion.setConditionImmunities(joinNames(response.path("condition_immunities")));

        companion.setSenses(flattenSenses(response.path("senses")));
        companion.setLanguages(response.path("languages").asText(""));

        addEntriesFromArray(companion, response.path("special_abilities"), "trait");
        addEntriesFromArray(companion, response.path("actions"), "action");
        addEntriesFromArray(companion, response.path("reactions"), "reaction");
        // No "bonus_actions" field exists in this API in either ruleset version - left for manual entry.

        return companion;
    }

    private JsonNode fetchMonsterJson(String name, String notFoundMessage) {
        String index = name.trim().toLowerCase().replaceAll("\\s+", "-");

        JsonNode response;
        try {
            response = dnd5eWebClient.get()
                    .uri("/api/2014/monsters/{index}", index)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new IllegalArgumentException(notFoundMessage + ": " + name);
        }

        if (response == null) {
            throw new IllegalArgumentException("Empty response for: " + name);
        }

        return response;
    }

    private int extractHitPoints(JsonNode response) {
        return response.path("hit_points").asInt(10);
    }

    private int extractArmorClass(JsonNode response) {
        JsonNode acNode = response.path("armor_class");
        if (acNode.isArray() && !acNode.isEmpty()) {
            return acNode.get(0).path("value").asInt(10);
        }
        return 10;
    }

    private String extractImageUrl(JsonNode response) {
        if (response.has("image") && !response.path("image").isNull()) {
            return "https://www.dnd5eapi.co" + response.path("image").asText();
        }
        return null;
    }

    private String formatChallengeRating(JsonNode crNode) {
        if (!crNode.isNumber()) {
            return null;
        }
        double cr = crNode.asDouble();
        if (cr == 0.125) return "1/8";
        if (cr == 0.25) return "1/4";
        if (cr == 0.5) return "1/2";
        if (cr == Math.floor(cr)) return String.valueOf((int) cr);
        return String.valueOf(cr);
    }

    private String flattenSpeed(JsonNode speedNode) {
        if (!speedNode.isObject()) {
            return null;
        }
        List<String> parts = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> fields = speedNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            String value = field.getValue().asText("");
            if (value.isEmpty()) {
                continue;
            }
            if ("walk".equals(field.getKey())) {
                parts.add(0, value);
            } else {
                parts.add(field.getKey() + " " + value);
            }
        }
        return String.join(", ", parts);
    }

    private String flattenSenses(JsonNode sensesNode) {
        if (!sensesNode.isObject()) {
            return null;
        }
        List<String> parts = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> fields = sensesNode.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            String value = field.getValue().asText("");
            if (value.isEmpty()) {
                continue;
            }
            if ("passive_perception".equals(field.getKey())) {
                parts.add("passive Perception " + value);
            } else {
                parts.add(field.getKey() + " " + value);
            }
        }
        return String.join(", ", parts);
    }

    private String joinNames(JsonNode arrayNode) {
        if (!arrayNode.isArray()) {
            return "";
        }
        List<String> names = new ArrayList<>();
        for (JsonNode element : arrayNode) {
            String value = element.isTextual() ? element.asText() : element.path("name").asText(null);
            if (value != null && !value.isEmpty()) {
                names.add(value);
            }
        }
        return String.join(", ", names);
    }

    private record ParsedEntry(String name, String description, String hitOrDc, String damage) {}

    private List<ParsedEntry> parseEntries(JsonNode arrayNode, boolean extractAttack) {
        if (!arrayNode.isArray()) {
            return List.of();
        }
        List<ParsedEntry> result = new ArrayList<>();
        for (JsonNode element : arrayNode) {
            String entryName = element.path("name").asText("");
            if (entryName.isEmpty()) {
                continue;
            }
            String description = element.path("desc").asText("");
            String hitOrDc = extractAttack ? extractHitOrDc(element) : null;
            String damage = extractAttack ? extractDamage(element) : null;
            result.add(new ParsedEntry(entryName, description, hitOrDc, damage));
        }
        return result;
    }

    private void addEntriesFromArray(Companion companion, JsonNode arrayNode, String category) {
        for (ParsedEntry pe : parseEntries(arrayNode, "action".equals(category))) {
            CompanionEntry entry = new CompanionEntry();
            entry.setCategory(category);
            entry.setName(pe.name());
            entry.setDescription(pe.description());
            entry.setHitOrDc(pe.hitOrDc());
            entry.setDamage(pe.damage());
            companion.addEntry(entry);
        }
    }

    private void addEntriesFromArray(Combatant combatant, JsonNode arrayNode, String category) {
        boolean extractAttack = "action".equals(category) || "legendary-action".equals(category);
        for (ParsedEntry pe : parseEntries(arrayNode, extractAttack)) {
            CombatantEntry entry = new CombatantEntry();
            entry.setCategory(category);
            entry.setName(pe.name());
            entry.setDescription(pe.description());
            entry.setHitOrDc(pe.hitOrDc());
            entry.setDamage(pe.damage());
            combatant.addEntry(entry);
        }
    }

    private String extractHitOrDc(JsonNode actionNode) {
        JsonNode attackBonus = actionNode.path("attack_bonus");
        if (attackBonus.isInt()) {
            return "+" + attackBonus.asInt();
        }
        return null;
    }

    private String extractDamage(JsonNode actionNode) {
        JsonNode damageArray = actionNode.path("damage");
        if (!damageArray.isArray() || damageArray.isEmpty()) {
            return null;
        }
        JsonNode firstDamage = damageArray.get(0);
        String dice = firstDamage.path("damage_dice").asText(null);
        String type = firstDamage.path("damage_type").path("name").asText(null);
        if (dice == null) {
            return null;
        }
        return type != null ? dice + " " + type.toLowerCase() : dice;
    }
}
