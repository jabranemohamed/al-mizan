package com.mizan.almizan.service;

import com.mizan.almizan.dto.AiAdviceDTO;
import com.mizan.almizan.dto.BalanceDTO;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AiAdviceService {

    private final ChatClient chatClient;
    private final Timer aiResponseTimer;

    public AiAdviceService(ChatClient.Builder chatClientBuilder, MeterRegistry meterRegistry) {
        this.chatClient = chatClientBuilder.build();
        this.aiResponseTimer = Timer.builder("mizan.ai.response.time")
                .description("Time taken for AI advice generation")
                .register(meterRegistry);
    }

    public AiAdviceDTO generateAdvice(BalanceDTO balance, String lang) {
        return aiResponseTimer.record(() -> {
            String prompt = buildPrompt(balance, lang);

            try {
                String response = chatClient.prompt()
                        .user(prompt)
                        .call()
                        .content();

                return parseResponse(response);
            } catch (Exception e) {
                log.error("Error calling OpenAI API: {}", e.getMessage());
                return getFallback(lang);
            }
        });
    }

    private String buildPrompt(BalanceDTO balance, String lang) {
        String langInstruction = switch (lang) {
            case "en" -> "Give your advice in English";
            case "ar" -> "أعطِ نصيحتك باللغة العربية (Give your advice in Arabic)";
            default -> "Donne ton conseil en français";
        };

        return String.format("""
            Tu es un conseiller islamique bienveillant. Voici le bilan des actions du jour :
            - Bonnes actions (حسنات) : %d (poids: %d)
            - Mauvaises actions (سيئات) : %d (poids: %d)
            - Verdict : %s

            %s.
            Donne un conseil court et encourageant (3-4 phrases max),
            une invocation en arabe, et une référence de hadith pertinente.

            Réponds en JSON avec les clés: advice, encouragement, hadithReference
            """,
                balance.getGoodCount(), balance.getGoodWeight(),
                balance.getBadCount(), balance.getBadWeight(),
                balance.getVerdict(),
                langInstruction
        );
    }

    private AiAdviceDTO getFallback(String lang) {
        return switch (lang) {
            case "en" -> AiAdviceDTO.builder()
                    .advice("Continue your good deeds and repent for the bad ones.")
                    .encouragement("اللهم أعنا على ذكرك وشكرك وحسن عبادتك")
                    .hadithReference("The Prophet ﷺ said: 'Actions are judged by intentions.'")
                    .build();
            case "ar" -> AiAdviceDTO.builder()
                    .advice("واصل أعمالك الصالحة وتب عن السيئات.")
                    .encouragement("اللهم أعنا على ذكرك وشكرك وحسن عبادتك")
                    .hadithReference("قال النبي ﷺ: إنما الأعمال بالنيات.")
                    .build();
            default -> AiAdviceDTO.builder()
                    .advice("Continuez vos bonnes actions et repentez-vous des mauvaises.")
                    .encouragement("اللهم أعنا على ذكرك وشكرك وحسن عبادتك")
                    .hadithReference("Le Prophète ﷺ a dit : « Les actions ne valent que par les intentions. »")
                    .build();
        };
    }

    private AiAdviceDTO parseResponse(String response) {
        try {
            String cleaned = response.replaceAll("```json|```", "").trim();
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(cleaned, AiAdviceDTO.class);
        } catch (Exception e) {
            log.warn("Could not parse AI response, returning raw: {}", e.getMessage());
            return AiAdviceDTO.builder()
                    .advice(response)
                    .encouragement("")
                    .hadithReference("")
                    .build();
        }
    }
}