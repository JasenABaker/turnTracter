package com.dnd.tracker.controller;

import com.dnd.tracker.dto.SavedCombatantDto;
import com.dnd.tracker.model.SavedCombatant;
import com.dnd.tracker.repository.SavedCombatantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/saved-combatants")
public class SavedCombatantController {

    private final SavedCombatantRepository savedCombatantRepository;

    public SavedCombatantController(SavedCombatantRepository savedCombatantRepository) {
        this.savedCombatantRepository = savedCombatantRepository;
    }

    @GetMapping
    public ResponseEntity<List<SavedCombatantDto>> getAll() {
        List<SavedCombatantDto> dtos = savedCombatantRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        savedCombatantRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private SavedCombatantDto toDto(SavedCombatant s) {
        return new SavedCombatantDto(
                s.getId(),
                s.getName(),
                s.getImageUrl(),
                s.getHp(),
                s.getArmorClass(),
                s.getIsMonster(),
                s.getIsNpc()
        );
    }
}
