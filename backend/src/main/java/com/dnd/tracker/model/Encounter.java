package com.dnd.tracker.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "encounters")
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Integer currentRound = 1;

    private UUID activeTurnId;

    private Instant timerStartTime;

    @Column(nullable = false)
    private Boolean isTimerPaused = false;

    @Column(nullable = false)
    private Long pausedElapsedSeconds = 0L;

    @Column(nullable = false)
    private Integer turnDurationSeconds = 120;

    public Encounter() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Integer getCurrentRound() { return currentRound; }
    public void setCurrentRound(Integer currentRound) { this.currentRound = currentRound; }

    public UUID getActiveTurnId() { return activeTurnId; }
    public void setActiveTurnId(UUID activeTurnId) { this.activeTurnId = activeTurnId; }

    public Instant getTimerStartTime() { return timerStartTime; }
    public void setTimerStartTime(Instant timerStartTime) { this.timerStartTime = timerStartTime; }

    public Boolean getIsTimerPaused() { return isTimerPaused; }
    public void setIsTimerPaused(Boolean isTimerPaused) { this.isTimerPaused = isTimerPaused; }

    public Long getPausedElapsedSeconds() { return pausedElapsedSeconds; }
    public void setPausedElapsedSeconds(Long pausedElapsedSeconds) { this.pausedElapsedSeconds = pausedElapsedSeconds; }

    public Integer getTurnDurationSeconds() { return turnDurationSeconds; }
    public void setTurnDurationSeconds(Integer turnDurationSeconds) { this.turnDurationSeconds = turnDurationSeconds; }
}
