package com.dnd.tracker.service;

import com.dnd.tracker.model.Combatant;
import com.dnd.tracker.model.CombatantEntry;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DndBeyondMonsterService {

    private static final Logger log = LoggerFactory.getLogger(DndBeyondMonsterService.class);

    private static final String LOAD_ERROR =
            "Couldn't read a stat block from that page. Make sure it's a D&D Beyond monster page (e.g. dndbeyond.com/monsters/16907-goblin).";

    private static final Pattern MONSTER_PATH_PATTERN = Pattern.compile("monsters/([\\w-]+)");
    private static final Pattern HIT_PATTERN = Pattern.compile("\\+(\\d+) to hit");
    private static final Pattern DC_PATTERN = Pattern.compile("DC\\s*(\\d+)");
    private static final Pattern DAMAGE_PATTERN = Pattern.compile("(\\d+d\\d+(?:\\s*\\+\\s*\\d+)?)\\)?\\s+(\\w+)");

    private static final Map<String, String> HEADING_TO_CATEGORY = Map.of(
            "Traits", "trait",
            "Actions", "action",
            "Bonus Actions", "bonus-action",
            "Reactions", "reaction",
            "Legendary Actions", "legendary-action",
            "Lair Actions", "lair-action"
    );

    private final WebClient dndBeyondMonsterWebClient;

    public DndBeyondMonsterService(WebClient dndBeyondMonsterWebClient) {
        this.dndBeyondMonsterWebClient = dndBeyondMonsterWebClient;
    }

    public Combatant fetchMonster(String monsterUrl, Integer initiativeScore) {
        String path = extractMonsterPath(monsterUrl);
        String html = fetchHtml(path);
        Document doc = Jsoup.parse(html);

        Element statBlock = doc.selectFirst(".mon-stat-block");
        if (statBlock == null) {
            throw new IllegalArgumentException(LOAD_ERROR);
        }

        int initiative = (initiativeScore != null) ? initiativeScore : 10;

        Combatant combatant = new Combatant();
        combatant.setName(extractName(statBlock));
        combatant.setImageUrl(extractImageUrl(doc));
        combatant.setInitiativeScore(initiative);
        combatant.setIsMonster(true);

        combatant.setHp(extractAttributeInt(statBlock, "Hit Points"));
        combatant.setCurrentHp(combatant.getHp());
        combatant.setArmorClass(extractAttributeInt(statBlock, "Armor Class"));

        parseMeta(statBlock, combatant);
        combatant.setSpeed(extractAttributeText(statBlock, "Speed"));

        combatant.setStrength(extractAbilityScore(statBlock, "str"));
        combatant.setDexterity(extractAbilityScore(statBlock, "dex"));
        combatant.setConstitution(extractAbilityScore(statBlock, "con"));
        combatant.setIntelligence(extractAbilityScore(statBlock, "int"));
        combatant.setWisdom(extractAbilityScore(statBlock, "wis"));
        combatant.setCharisma(extractAbilityScore(statBlock, "cha"));

        combatant.setSenses(extractTidbit(statBlock, "Senses"));
        combatant.setLanguages(extractTidbit(statBlock, "Languages"));
        combatant.setChallengeRating(extractChallengeRating(statBlock));

        combatant.setDamageImmunities(extractTidbitOrEmpty(statBlock, "Damage Immunities"));
        combatant.setDamageResistances(extractTidbitOrEmpty(statBlock, "Damage Resistances"));
        combatant.setDamageVulnerabilities(extractTidbitOrEmpty(statBlock, "Damage Vulnerabilities"));
        combatant.setConditionImmunities(extractTidbitOrEmpty(statBlock, "Condition Immunities"));

        addDescriptionBlockEntries(statBlock, combatant);

        return combatant;
    }

    private String extractMonsterPath(String monsterUrl) {
        if (monsterUrl == null || monsterUrl.isBlank()) {
            throw new IllegalArgumentException("Enter a valid D&D Beyond monster URL");
        }
        Matcher matcher = MONSTER_PATH_PATTERN.matcher(monsterUrl.trim());
        if (!matcher.find()) {
            throw new IllegalArgumentException(
                    "Enter a valid D&D Beyond monster URL (e.g. dndbeyond.com/monsters/16907-goblin)");
        }
        return "/monsters/" + matcher.group(1);
    }

    private String fetchHtml(String path) {
        try {
            return dndBeyondMonsterWebClient.get()
                    .uri(path)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new IllegalArgumentException("That monster page couldn't be found on D&D Beyond.");
        } catch (WebClientResponseException e) {
            throw new IllegalArgumentException(LOAD_ERROR);
        }
    }

    private String extractName(Element statBlock) {
        Element nameLink = statBlock.selectFirst(".mon-stat-block__name-link");
        String name = nameLink != null ? nameLink.text().trim() : null;
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException(LOAD_ERROR);
        }
        return name;
    }

    private String extractImageUrl(Document doc) {
        Element img = doc.selectFirst("img.monster-image");
        return img != null ? img.absUrl("src") : null;
    }

    private void parseMeta(Element statBlock, Combatant combatant) {
        Element metaEl = statBlock.selectFirst(".mon-stat-block__meta");
        if (metaEl == null) {
            return;
        }
        String meta = metaEl.text().trim();
        String[] commaParts = meta.split(",", 2);
        String sizeTypeAlignment = commaParts[0].trim();
        if (commaParts.length > 1) {
            combatant.setAlignment(commaParts[1].trim());
        }
        String[] words = sizeTypeAlignment.split("\\s+", 2);
        if (words.length > 0 && !words[0].isEmpty()) {
            combatant.setSize(words[0]);
        }
        if (words.length > 1) {
            combatant.setCreatureType(words[1]);
        }
    }

    private String extractAttributeText(Element statBlock, String label) {
        for (Element attr : statBlock.select(".mon-stat-block__attribute")) {
            Element labelEl = attr.selectFirst(".mon-stat-block__attribute-label");
            if (labelEl == null || !labelEl.text().trim().equalsIgnoreCase(label)) {
                continue;
            }
            Element dataValue = attr.selectFirst(".mon-stat-block__attribute-data-value");
            if (dataValue != null) {
                return dataValue.text().trim();
            }
            Element value = attr.selectFirst(".mon-stat-block__attribute-value, .mon-stat-block__attribute-data");
            return value != null ? value.text().trim() : null;
        }
        return null;
    }

    private int extractAttributeInt(Element statBlock, String label) {
        String text = extractAttributeText(statBlock, label);
        if (text == null) {
            return 10;
        }
        Matcher m = Pattern.compile("\\d+").matcher(text);
        return m.find() ? Integer.parseInt(m.group()) : 10;
    }

    private int extractAbilityScore(Element statBlock, String abbrev) {
        Element stat = statBlock.selectFirst(".ability-block__stat--" + abbrev);
        if (stat == null) {
            return 10;
        }
        Element score = stat.selectFirst(".ability-block__score");
        if (score == null) {
            return 10;
        }
        try {
            return Integer.parseInt(score.text().trim());
        } catch (NumberFormatException e) {
            return 10;
        }
    }

    private String extractTidbit(Element statBlock, String label) {
        for (Element tidbit : statBlock.select(".mon-stat-block__tidbit")) {
            Element labelEl = tidbit.selectFirst(".mon-stat-block__tidbit-label");
            if (labelEl == null || !labelEl.text().trim().equalsIgnoreCase(label)) {
                continue;
            }
            Element data = tidbit.selectFirst(".mon-stat-block__tidbit-data");
            return data != null ? data.text().trim() : null;
        }
        return null;
    }

    private String extractTidbitOrEmpty(Element statBlock, String label) {
        String value = extractTidbit(statBlock, label);
        return value != null ? value : "";
    }

    private String extractChallengeRating(Element statBlock) {
        String raw = extractTidbit(statBlock, "Challenge");
        if (raw == null) {
            return null;
        }
        int parenIdx = raw.indexOf('(');
        String cr = (parenIdx >= 0 ? raw.substring(0, parenIdx) : raw).trim();
        return cr.isEmpty() ? null : cr;
    }

    private void addDescriptionBlockEntries(Element statBlock, Combatant combatant) {
        for (Element block : statBlock.select(".mon-stat-block__description-block")) {
            Element headingEl = block.selectFirst(".mon-stat-block__description-block-heading");
            if (headingEl == null) {
                continue;
            }
            String category = HEADING_TO_CATEGORY.get(headingEl.text().trim());
            if (category == null) {
                continue;
            }
            Element content = block.selectFirst(".mon-stat-block__description-block-content");
            if (content == null) {
                continue;
            }
            boolean extractAttack = "action".equals(category) || "legendary-action".equals(category);
            for (Element p : content.select("p")) {
                try {
                    addEntryFromParagraph(combatant, category, p, extractAttack);
                } catch (Exception e) {
                    log.warn("Skipping unparseable entry paragraph in category '{}': {}", category, p.text(), e);
                }
            }
        }
    }

    private void addEntryFromParagraph(Combatant combatant, String category, Element p, boolean extractAttack) {
        String fullText = p.text().trim();
        if (fullText.isEmpty()) {
            return;
        }

        Element lead = p.selectFirst("strong, b");
        String name;
        String description;
        if (lead != null) {
            String leadText = lead.text().trim();
            name = leadText.replace(".", "").trim();
            int idx = fullText.indexOf(leadText);
            description = (idx >= 0 ? fullText.substring(idx + leadText.length()) : fullText).trim();
        } else {
            int periodIdx = fullText.indexOf('.');
            name = periodIdx > 0 ? fullText.substring(0, periodIdx).trim() : fullText;
            description = periodIdx > 0 ? fullText.substring(periodIdx + 1).trim() : "";
        }
        if (name.isEmpty()) {
            return;
        }

        CombatantEntry entry = new CombatantEntry();
        entry.setCategory(category);
        entry.setName(name);
        entry.setDescription(description);
        if (extractAttack) {
            entry.setHitOrDc(extractHitOrDc(fullText));
            entry.setDamage(extractDamage(fullText));
        }
        combatant.addEntry(entry);
    }

    private String extractHitOrDc(String text) {
        Matcher hit = HIT_PATTERN.matcher(text);
        if (hit.find()) {
            return "+" + hit.group(1);
        }
        Matcher dc = DC_PATTERN.matcher(text);
        if (dc.find()) {
            return "DC " + dc.group(1);
        }
        return null;
    }

    private String extractDamage(String text) {
        Matcher m = DAMAGE_PATTERN.matcher(text);
        if (!m.find()) {
            return null;
        }
        return m.group(1).replaceAll("\\s+", "") + " " + m.group(2).toLowerCase();
    }
}
