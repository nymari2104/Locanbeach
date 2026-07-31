package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.exception.errorcode.AccommodationErrorCode;
import com.locanbeach.backend.dto.AccommodationDTO;
import com.locanbeach.backend.dto.request.staff.ChangeOperationalStatusRequest;
import com.locanbeach.backend.entity.Accommodation;
import com.locanbeach.backend.repository.AccommodationRepository;
import com.locanbeach.backend.repository.UserRepository;
import com.locanbeach.backend.entity.User;
import com.locanbeach.backend.entity.enums.OperationalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.locanbeach.backend.dto.response.staff.StaffCategoryAvailabilityResponse;
import com.locanbeach.backend.dto.response.staff.StaffRoomAvailabilityResponse;
import com.locanbeach.backend.entity.AccommodationCategory;
import com.locanbeach.backend.entity.Booking;
import com.locanbeach.backend.entity.RoomHold;
import com.locanbeach.backend.repository.BookingRepository;
import com.locanbeach.backend.repository.RoomHoldRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StaffAccommodationService {

    private final AccommodationRepository accommodationRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final RoomHoldRepository roomHoldRepository;

    @Transactional(readOnly = true)
    public List<StaffCategoryAvailabilityResponse> getRoomAvailability(LocalDateTime checkinDate, LocalDateTime checkoutDate) {
        LocalDateTime now = LocalDateTime.now();
        List<Accommodation> allAccommodations = accommodationRepository.findAll();
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(checkinDate, checkoutDate);
        List<RoomHold> overlappingHolds = roomHoldRepository.findOverlappingHolds(checkinDate, checkoutDate, now);

        Map<UUID, Booking> bookingMap = overlappingBookings.stream()
                .filter(b -> b.getAccommodation() != null)
                .collect(Collectors.toMap(b -> b.getAccommodation().getId(), b -> b, (existing, replacement) -> existing));

        Map<UUID, RoomHold> holdMap = overlappingHolds.stream()
                .filter(rh -> rh.getAccommodation() != null)
                .collect(Collectors.toMap(rh -> rh.getAccommodation().getId(), rh -> rh, (existing, replacement) -> existing));

        Map<AccommodationCategory, List<Accommodation>> grouped = allAccommodations.stream()
                .filter(a -> a.getCategory() != null)
                .collect(Collectors.groupingBy(Accommodation::getCategory));

        List<StaffCategoryAvailabilityResponse> result = new ArrayList<>();

        for (Map.Entry<AccommodationCategory, List<Accommodation>> entry : grouped.entrySet()) {
            AccommodationCategory category = entry.getKey();
            List<Accommodation> roomList = entry.getValue();

            long availableCount = 0;
            long heldCount = 0;
            long bookedCount = 0;
            List<StaffRoomAvailabilityResponse> roomResponses = new ArrayList<>();

            for (Accommodation room : roomList) {
                Booking booking = bookingMap.get(room.getId());
                RoomHold hold = holdMap.get(room.getId());

                String roomStatus;
                LocalDateTime holdExpiresAt = null;
                String guestName = null;
                UUID bookingId = null;

                if (booking != null) {
                    roomStatus = "BOOKED";
                    guestName = booking.getGuestName();
                    bookingId = booking.getId();
                    bookedCount++;
                } else if (hold != null) {
                    roomStatus = "HELD";
                    holdExpiresAt = hold.getExpiresAt();
                    guestName = "Khách giữ chỗ (Website)";
                    heldCount++;
                } else if (room.getOperationalStatus() == OperationalStatus.DIRTY) {
                    roomStatus = "DIRTY";
                } else {
                    roomStatus = "AVAILABLE";
                    availableCount++;
                }

                roomResponses.add(StaffRoomAvailabilityResponse.builder()
                        .id(room.getId())
                        .code(room.getCode())
                        .status(roomStatus)
                        .holdExpiresAt(holdExpiresAt)
                        .guestName(guestName)
                        .bookingId(bookingId)
                        .build());
            }

            List<String> images = category.getImages() != null
                    ? category.getImages().stream().map(img -> img.getUrl()).collect(Collectors.toList())
                    : List.of();

            result.add(StaffCategoryAvailabilityResponse.builder()
                    .categoryId(category.getId())
                    .categoryName(category.getName())
                    .categoryCode(category.getCode())
                    .basePrice(category.getBasePrice())
                    .maxGuests(category.getMaxGuests())
                    .totalRooms((long) roomList.size())
                    .availableCount(availableCount)
                    .heldCount(heldCount)
                    .bookedCount(bookedCount)
                    .images(images)
                    .rooms(roomResponses)
                    .build());
        }

        return result;
    }

    public List<AccommodationDTO> getAllAccommodations() {
        return accommodationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccommodationDTO changeOperationalStatus(UUID id, ChangeOperationalStatusRequest request) {
        Accommodation accommodation = accommodationRepository.findById(id)
                .orElseThrow(() -> new AppException(AccommodationErrorCode.ACCOMMODATION_NOT_FOUND));
        
        accommodation.setOperationalStatus(request.getStatus());
        
        if (request.getStatus() == OperationalStatus.CLEANING || request.getStatus() == OperationalStatus.DIRTY) {
            if (request.getLastCleanedById() != null) {
                User housekeeper = userRepository.findById(request.getLastCleanedById())
                        .orElseThrow(() -> new AppException(com.locanbeach.backend.exception.errorcode.AuthErrorCode.USER_NOT_FOUND));
                accommodation.setLastCleanedBy(housekeeper);
            } else {
                if (request.getStatus() == OperationalStatus.CLEANING) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.getPrincipal() instanceof User currentUser) {
                        User housekeeper = userRepository.findById(currentUser.getId())
                                .orElseThrow(() -> new AppException(com.locanbeach.backend.exception.errorcode.AuthErrorCode.USER_NOT_FOUND));
                        accommodation.setLastCleanedBy(housekeeper);
                    }
                } else {
                    accommodation.setLastCleanedBy(null);
                }
            }
        }
        
        return mapToDTO(accommodationRepository.save(accommodation));
    }

    private AccommodationDTO mapToDTO(Accommodation accommodation) {
        AccommodationDTO dto = new AccommodationDTO();
        dto.setId(accommodation.getId());
        dto.setCategoryId(accommodation.getCategory().getId());
        dto.setCategoryName(accommodation.getCategory().getName());
        dto.setCode(accommodation.getCode());
        dto.setMetadata(accommodation.getMetadata());
        dto.setStatus(accommodation.getStatus());
        dto.setOperationalStatus(accommodation.getOperationalStatus());
        
        if (accommodation.getLastCleanedBy() != null) {
            dto.setLastCleanedById(accommodation.getLastCleanedBy().getId());
            dto.setLastCleanedByName(accommodation.getLastCleanedBy().getFullName());
        }
        return dto;
    }
}
