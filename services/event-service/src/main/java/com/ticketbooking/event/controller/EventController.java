package com.ticketbooking.event.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {
    @GetMapping
    public List<Map<String, Object>> getEvents() {
        // Temporary sample response; replace with service/repository logic later.
        return List.of(
            Map.of("id", 1, "title", "Sample Movie Premiere", "category", "MOVIE", "city", "Dublin"),
            Map.of("id", 2, "title", "Sample Live Concert", "category", "CONCERT", "city", "Dublin")
        );
    }
}
