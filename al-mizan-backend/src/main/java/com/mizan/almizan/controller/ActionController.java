package com.mizan.almizan.controller;

import com.mizan.almizan.dto.ActionDTO;
import com.mizan.almizan.entity.Action;
import com.mizan.almizan.entity.AppUser;
import com.mizan.almizan.repository.UserRepository;
import com.mizan.almizan.service.ActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/actions")
@RequiredArgsConstructor
public class ActionController {

    private final ActionService actionService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ActionDTO>> getAllActions() {
        return ResponseEntity.ok(actionService.getAllActions());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ActionDTO>> getByType(@PathVariable Action.ActionType type) {
        return ResponseEntity.ok(actionService.getActionsByType(type));
    }

    @GetMapping("/today")
    public ResponseEntity<List<ActionDTO>> getTodayActions(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(actionService.getActionsForUserAndDate(user.getId(), LocalDate.now()));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ActionDTO>> getActionsByDate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        AppUser user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(actionService.getActionsForUserAndDate(user.getId(), date));
    }
}
