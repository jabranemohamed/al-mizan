package com.mizan.almizan.controller;

import com.mizan.almizan.dto.AiAdviceDTO;
import com.mizan.almizan.dto.BalanceDTO;
import com.mizan.almizan.entity.AppUser;
import com.mizan.almizan.repository.UserRepository;
import com.mizan.almizan.service.AiAdviceService;
import com.mizan.almizan.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/advice")
@RequiredArgsConstructor
public class AiAdviceController {

    private final AiAdviceService aiAdviceService;
    private final BalanceService balanceService;
    private final UserRepository userRepository;

    @GetMapping("/today")
    public ResponseEntity<AiAdviceDTO> getTodayAdvice(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "fr") String lang) {
        AppUser user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BalanceDTO balance = balanceService.getBalance(user.getId(), LocalDate.now());
        AiAdviceDTO advice = aiAdviceService.generateAdvice(balance, lang);
        return ResponseEntity.ok(advice);
    }
}