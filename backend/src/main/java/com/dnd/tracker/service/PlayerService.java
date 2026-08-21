package com.dnd.tracker.service;

import com.dnd.tracker.dto.CreatePlayerTemplateRequest;
import com.dnd.tracker.dto.PlayerDto;
import com.dnd.tracker.model.Player;
import com.dnd.tracker.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PlayerService {

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    @Transactional(readOnly = true)
    public List<PlayerDto> search(String q) {
        List<Player> players = (q == null || q.isBlank())
                ? playerRepository.findAllByOrderByNameAsc()
                : playerRepository.findByNameContainingIgnoreCaseOrderByNameAsc(q);
        return players.stream().map(this::toDto).toList();
    }

    public Player findOrThrow(UUID id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Player not found: " + id));
    }

    @Transactional(readOnly = true)
    public PlayerDto getDto(UUID id) {
        return toDto(findOrThrow(id));
    }

    public Player create(CreatePlayerTemplateRequest req) {
        Player player = new Player();
        applyRequest(player, req);
        return playerRepository.save(player);
    }

    public Player update(UUID id, CreatePlayerTemplateRequest req) {
        Player player = findOrThrow(id);
        applyRequest(player, req);
        return playerRepository.save(player);
    }

    public void delete(UUID id) {
        Player player = findOrThrow(id);
        playerRepository.deleteById(player.getId());
    }

    private void applyRequest(Player player, CreatePlayerTemplateRequest req) {
        player.setName(req.name());
        player.setClassLevel(req.classLevel());
        player.setImageUrl(req.imageUrl());
        player.setMaxHp(req.maxHp());
        player.setArmorClass(req.armorClass());
        player.setPassivePerception(req.passivePerception());
        player.setStrength(req.strength());
        player.setDexterity(req.dexterity());
        player.setConstitution(req.constitution());
        player.setIntelligence(req.intelligence());
        player.setWisdom(req.wisdom());
        player.setCharisma(req.charisma());
    }

    public PlayerDto toDto(Player p) {
        return new PlayerDto(
                p.getId(),
                p.getName(),
                p.getClassLevel(),
                p.getImageUrl(),
                p.getMaxHp(),
                p.getArmorClass(),
                p.getPassivePerception(),
                p.getStrength(),
                p.getDexterity(),
                p.getConstitution(),
                p.getIntelligence(),
                p.getWisdom(),
                p.getCharisma()
        );
    }
}
