package com.locanbeach.backend.service;

import com.locanbeach.backend.common.exception.AppException;
import com.locanbeach.backend.exception.errorcode.BookingErrorCode;
import com.locanbeach.backend.exception.errorcode.ServiceErrorCode;
import com.locanbeach.backend.exception.errorcode.ComboErrorCode;
import com.locanbeach.backend.dto.request.staff.AddBookingComboRequest;
import com.locanbeach.backend.dto.request.staff.AddBookingGuestRequest;
import com.locanbeach.backend.dto.request.staff.AddBookingServiceRequest;
import com.locanbeach.backend.dto.request.staff.ChangeBookingStatusRequest;
import com.locanbeach.backend.dto.response.BookingResponse;
import com.locanbeach.backend.entity.*;
import com.locanbeach.backend.entity.enums.BookingStatus;
import com.locanbeach.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffBookingService {

    private final BookingRepository bookingRepository;
    private final GuestRepository guestRepository;
    private final BookingGuestRepository bookingGuestRepository;
    private final ServiceRepository serviceRepository;
    private final BookingServiceRepository bookingServiceRepository;
    private final ComboEventRepository comboEventRepository;
    private final BookingComboRepository bookingComboRepository;

    public Page<BookingResponse> getBookings(String search, BookingStatus status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return bookingRepository.findBookingsWithFilters(search, status, startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    public BookingResponse getBookingDetails(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse changeBookingStatus(UUID id, ChangeBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        booking.setStatus(request.getStatus());
        // Depending on status changes, we might record history in booking_status_history here
        
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateGuests(UUID id, com.locanbeach.backend.dto.request.staff.CheckInRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        saveGuestList(booking, request);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse checkIn(UUID id, com.locanbeach.backend.dto.request.staff.CheckInRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PENDING_DEPOSIT) {
            booking.setStatus(BookingStatus.CHECKED_IN);
            booking.setActualCheckinAt(LocalDateTime.now());
            if (booking.getAccommodation() != null) {
                booking.getAccommodation().setOperationalStatus(com.locanbeach.backend.entity.enums.OperationalStatus.OCCUPIED);
            }
        } else if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new AppException(BookingErrorCode.INVALID_CHECKIN_STATUS);
        }
        
        if (request != null && request.getGuests() != null) {
            saveGuestList(booking, request);
        }
        
        return mapToResponse(bookingRepository.save(booking));
    }

    private void saveGuestList(Booking booking, com.locanbeach.backend.dto.request.staff.CheckInRequest request) {
        if (request == null || request.getGuests() == null) return;

        java.util.List<BookingGuest> bgList = bookingGuestRepository.findByBookingId(booking.getId());
        bookingGuestRepository.deleteAll(bgList);

        for (int i = 0; i < request.getGuests().size(); i++) {
            com.locanbeach.backend.dto.request.staff.GuestInputDTO guestDto = request.getGuests().get(i);
            Guest guest = new Guest();
            guest.setFullName(guestDto.getFullName());
            guest.setIdNumber(guestDto.getIdentityCard());
            guest.setIdType(com.locanbeach.backend.entity.enums.GuestIdType.CCCD);
            guest.setPhone(guestDto.getPhone());
            guest.setGender(guestDto.getGender());
            
            if (guestDto.getDateOfBirth() != null && !guestDto.getDateOfBirth().trim().isEmpty()) {
                try {
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    guest.setDob(LocalDate.parse(guestDto.getDateOfBirth(), formatter));
                } catch (Exception e) {
                    // Ignore parse error for DOB
                }
            }
            guest = guestRepository.save(guest);
            
            BookingGuest bg = new BookingGuest();
            bg.setBooking(booking);
            bg.setGuest(guest);
            bg.setPrimary(i == 0);
            bookingGuestRepository.save(bg);
        }
    }

    @Transactional
    public BookingResponse checkOut(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new AppException(BookingErrorCode.INVALID_CHECKOUT_STATUS);
        }
        
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setActualCheckoutAt(LocalDateTime.now());
        if (booking.getAccommodation() != null) {
            booking.getAccommodation().setOperationalStatus(com.locanbeach.backend.entity.enums.OperationalStatus.DIRTY);
        }
        
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void addGuest(UUID id, AddBookingGuestRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        Guest guest = new Guest();
        guest.setFullName(request.getFullName());
        guest.setDob(request.getDob());
        guest.setGender(request.getGender());
        guest.setNationality(request.getNationality());
        guest.setIdType(request.getIdType());
        guest.setIdNumber(request.getIdNumber());
        guest.setPhone(request.getPhone());
        guest.setEmail(request.getEmail());
        guest = guestRepository.save(guest);
        
        BookingGuest bookingGuest = new BookingGuest();
        bookingGuest.setBooking(booking);
        bookingGuest.setGuest(guest);
        bookingGuest.setPrimary(request.isPrimary());
        
        bookingGuestRepository.save(bookingGuest);
    }

    @Transactional
    public void addService(UUID id, AddBookingServiceRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        com.locanbeach.backend.entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new AppException(ServiceErrorCode.SERVICE_NOT_FOUND));
                
        com.locanbeach.backend.entity.BookingService bookingService = new com.locanbeach.backend.entity.BookingService();
        bookingService.setBooking(booking);
        bookingService.setService(service);
        bookingService.setQuantity(request.getQuantity());
        bookingService.setUnitPrice(service.getPrice());
        bookingService.setNote(request.getNote());
        
        bookingServiceRepository.save(bookingService);
    }

    @Transactional
    public void addCombo(UUID id, AddBookingComboRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        ComboEvent combo = comboEventRepository.findById(request.getComboId())
                .orElseThrow(() -> new AppException(ComboErrorCode.COMBO_NOT_FOUND));
                
        BookingCombo bookingCombo = new BookingCombo();
        bookingCombo.setBooking(booking);
        bookingCombo.setCombo(combo);
        bookingCombo.setQuantity(request.getQuantity());
        bookingCombo.setUnitPrice(combo.getPrice());
        bookingCombo.setNote(request.getNote());
        
        bookingComboRepository.save(bookingCombo);
    }

    @Transactional
    public void deleteBooking(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(BookingErrorCode.BOOKING_NOT_FOUND));
        
        java.util.List<BookingGuest> bgList = bookingGuestRepository.findByBookingId(booking.getId());
        bookingGuestRepository.deleteAll(bgList);
        // Note: Master Guest records in 'guests' table are preserved for 36 months compliance per Decree 96/2016/ND-CP

        java.util.List<com.locanbeach.backend.entity.BookingService> bsList = bookingServiceRepository.findByBookingId(booking.getId());
        bookingServiceRepository.deleteAll(bsList);

        java.util.List<BookingCombo> bcList = bookingComboRepository.findByBookingId(booking.getId());
        bookingComboRepository.deleteAll(bcList);

        bookingRepository.delete(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        java.util.List<BookingGuest> bgList = bookingGuestRepository.findByBookingId(booking.getId());
        java.util.List<com.locanbeach.backend.dto.response.GuestResponse> guestResponses = bgList.stream().map(bg -> {
            Guest g = bg.getGuest();
            return com.locanbeach.backend.dto.response.GuestResponse.builder()
                    .id(g.getId())
                    .fullName(g.getFullName())
                    .dob(g.getDob())
                    .gender(g.getGender())
                    .nationality(g.getNationality())
                    .idType(g.getIdType())
                    .idNumber(g.getIdNumber())
                    .phone(g.getPhone())
                    .email(g.getEmail())
                    .isPrimary(bg.isPrimary())
                    .build();
        }).collect(java.util.stream.Collectors.toList());

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .accommodationId(booking.getAccommodation() != null ? booking.getAccommodation().getId() : null)
                .accommodationCode(booking.getAccommodation() != null ? booking.getAccommodation().getCode() : null)
                .categoryId(booking.getAccommodation() != null && booking.getAccommodation().getCategory() != null ? booking.getAccommodation().getCategory().getId() : null)
                .categoryName(booking.getAccommodation() != null && booking.getAccommodation().getCategory() != null ? booking.getAccommodation().getCategory().getName() : null)
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .checkinDate(booking.getCheckinDate())
                .checkoutDate(booking.getCheckoutDate())
                .guestsCount(booking.getGuestsCount())
                .totalAmount(booking.getTotalAmount())
                .depositAmount(booking.getDepositAmount())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .guests(guestResponses)
                .build();
    }
}
