package com.mizan.almizan.controller;

import com.mizan.almizan.dto.BalanceDTO;
import com.mizan.almizan.dto.CheckActionRequest;
import com.mizan.almizan.entity.AppUser;
import com.mizan.almizan.repository.UserRepository;
import com.mizan.almizan.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/balance")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;
    private final UserRepository userRepository;

    @PostMapping("/toggle")
    public ResponseEntity<BalanceDTO> toggleAction(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CheckActionRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(balanceService.toggleAction(userId, request));
    }

    @GetMapping("/today")
    public ResponseEntity<BalanceDTO> getTodayBalance(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(balanceService.getBalance(userId, LocalDate.now()));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<BalanceDTO> getBalanceByDate(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(balanceService.getBalance(userId, date));
    }

    @GetMapping("/history")
    public ResponseEntity<List<BalanceDTO>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(balanceService.getHistory(userId, startDate, endDate));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<BalanceDTO>> getRecentHistory(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(balanceService.getRecentHistory(userId));
    }

    private Long getUserId(UserDetails userDetails) {
        AppUser user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
