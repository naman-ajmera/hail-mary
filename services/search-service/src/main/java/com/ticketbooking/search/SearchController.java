package com.ticketbooking.search;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final List<EventSummary> events = List.of(
            new EventSummary("movie-001", "The Example Movie", "Dublin", "MOVIE", LocalDate.of(2026, 11, 5)),
            new EventSummary("concert-001", "Live Music Night", "Dublin", "CONCERT", LocalDate.of(2026, 11, 12)),
            new EventSummary("movie-002", "The Space Adventure", "Cork", "MOVIE", LocalDate.of(2026, 11, 20)));

    @GetMapping
    public List<EventSummary> search(@RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) String city, @RequestParam(required = false) String category) {
        String query = q.toLowerCase(Locale.ROOT).trim();
        return events.stream().filter(e -> query.isBlank() || e.title().toLowerCase(Locale.ROOT).contains(query))
                .filter(e -> city == null || e.city().equalsIgnoreCase(city))
                .filter(e -> category == null || e.category().equalsIgnoreCase(category)).toList();
    }

    public record EventSummary(String eventId, String title, String city, String category, LocalDate date) {
    }
}