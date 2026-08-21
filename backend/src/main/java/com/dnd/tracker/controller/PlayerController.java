package com.dnd.tracker.controller;

import com.dnd.tracker.dto.CreatePlayerTemplateRequest;
import com.dnd.tracker.dto.PlayerDto;
import com.dnd.tracker.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<PlayerDto>> search(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(playerService.search(q));
    }

    @PostMapping
    public ResponseEntity<PlayerDto> create(@RequestBody CreatePlayerTemplateRequest request) {
        return ResponseEntity.ok(playerService.toDto(playerService.create(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(playerService.getDto(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PlayerDto> update(@PathVariable UUID id, @RequestBody CreatePlayerTemplateRequest request) {
        return ResponseEntity.ok(playerService.toDto(playerService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
