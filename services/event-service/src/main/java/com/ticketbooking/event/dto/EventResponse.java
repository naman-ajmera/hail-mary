package com.ticketbooking.event.dto;

import com.ticketbooking.event.entity.Event;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public record EventResponse(
        String id,
        String title,
        String category,
        String city,
        String venue,
        String description,
        String duration,
        Double rating,
        String votesCount,
        Double priceFrom,
        String posterUrl,
        String backdropUrl,
        List<String> genres,
        List<String> formats,
        List<String> languages
) {
    public static EventResponse fromEntity(Event entity) {
        return new EventResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getCategory(),
                entity.getCity(),
                entity.getVenue(),
                entity.getDescription(),
                entity.getDuration(),
                entity.getRating(),
                entity.getVotesCount(),
                entity.getPriceFrom(),
                entity.getPosterUrl(),
                entity.getBackdropUrl(),
                splitList(entity.getGenres()),
                splitList(entity.getFormats()),
                splitList(entity.getLanguages())
        );
    }

    private static List<String> splitList(String str) {
        if (str == null || str.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(str.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
