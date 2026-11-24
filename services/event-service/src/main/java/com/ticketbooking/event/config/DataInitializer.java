package com.ticketbooking.event.config;

import com.ticketbooking.event.entity.Event;
import com.ticketbooking.event.repository.EventRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

        private final EventRepository eventRepository;

        public DataInitializer(EventRepository eventRepository) {
                this.eventRepository = eventRepository;
        }

        @Override
        public void run(String... args) {
                if (eventRepository.count() > 0) {
                        return;
                }

                List<Event> initialEvents = List.of(
                                new Event(
                                                "1",
                                                "Interstellar: The Horizon Premiere",
                                                "MOVIE",
                                                "Dublin",
                                                "Cineworld Dublin, Parnell St",
                                                "A mind-bending cinematic journey across unexplored interstellar reaches with state-of-the-art IMAX visuals and Dolby Atmos sound.",
                                                "2h 45m",
                                                8.9,
                                                "48.2K",
                                                13.50,
                                                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
                                                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
                                                "Sci-Fi, Adventure, Action",
                                                "IMAX 3D, 4DX, 2D",
                                                "English, Spanish"),
                                new Event(
                                                "2",
                                                "Dublin Neon Beats Live 2026",
                                                "CONCERT",
                                                "Dublin",
                                                "3Arena, North Wall Quay, Dublin",
                                                "Experience an electrifying night of rhythm, synths, and high-energy live performance featuring world-class visual production.",
                                                "3h 30m",
                                                9.4,
                                                "21.5K",
                                                45.00,
                                                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
                                                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
                                                "Electronic, Live Music, Festival",
                                                "Standing GA, VIP Lounge",
                                                "Live"),
                                new Event(
                                                "movie-001",
                                                "The Example Movie: Echoes",
                                                "MOVIE",
                                                "Dublin",
                                                "ODEON Point Square, Dublin",
                                                "An edge-of-your-seat psychological thriller with unexpected twists from acclaimed visionary directors.",
                                                "2h 15m",
                                                8.4,
                                                "14.8K",
                                                11.50,
                                                "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80",
                                                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
                                                "Mystery, Thriller, Drama",
                                                "Standard 2D, Dolby Atmos",
                                                "English"),
                                new Event(
                                                "concert-001",
                                                "Live Music Night: Acoustic Sessions",
                                                "CONCERT",
                                                "Dublin",
                                                "The Olympia Theatre, Dublin",
                                                "Intimate acoustic sets and roaring guitar anthems in historic Dublin city center.",
                                                "2h 45m",
                                                9.1,
                                                "9.3K",
                                                32.00,
                                                "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80",
                                                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
                                                "Indie Rock, Acoustic",
                                                "General Admission",
                                                "Live Audio"),
                                new Event(
                                                "movie-002",
                                                "The Space Adventure: Odyssey Cork",
                                                "MOVIE",
                                                "Cork",
                                                "The Gate Cinema, Cork",
                                                "Mankind voyages beyond the solar frontier on a perilous mission to recover deep space artifacts.",
                                                "2h 30m",
                                                8.7,
                                                "31.0K",
                                                12.00,
                                                "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
                                                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
                                                "Sci-Fi, Space Fantasy",
                                                "IMAX 2D, Standard",
                                                "English"));

                eventRepository.saveAll(initialEvents);
        }
}
