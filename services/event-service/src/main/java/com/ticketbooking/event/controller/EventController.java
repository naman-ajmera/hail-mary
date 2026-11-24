package com.ticketbooking.event.controller;

import com.ticketbooking.event.dto.EventResponse;
import com.ticketbooking.event.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> getEvents(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category
    ) {
        return eventService.getAllEvents(city, category);
    }

    @GetMapping("/{id}")
    public EventResponse getEventById(@PathVariable String id) {
        return eventService.getEventById(id);
    }
}
