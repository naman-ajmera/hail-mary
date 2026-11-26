package com.ticketbooking.booking.repository;

import com.ticketbooking.booking.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, String> {
    List<BookingEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    List<BookingEntity> findByShowIdAndStatus(String showId, String status);
    List<BookingEntity> findByShowId(String showId);
}
