package com.ticketbooking.event.service;

import com.ticketbooking.event.dto.EventResponse;
import com.ticketbooking.event.entity.Event;
import com.ticketbooking.event.repository.EventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<EventResponse> getAllEvents(String city, String category) {
        List<Event> events;

        boolean hasCity = city != null && !city.isBlank() && !city.equalsIgnoreCase("All Cities");
        boolean hasCategory = category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL");

        if (hasCity && hasCategory) {
            events = eventRepository.findByCityIgnoreCaseAndCategoryIgnoreCase(city.trim(), category.trim());
        } else if (hasCity) {
            events = eventRepository.findByCityIgnoreCase(city.trim());
        } else if (hasCategory) {
            events = eventRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            events = eventRepository.findAll();
        }

        return events.stream()
                .map(EventResponse::fromEntity)
                .toList();
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found with ID: " + id));
        return EventResponse.fromEntity(event);
    }
}
