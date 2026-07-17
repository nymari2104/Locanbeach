-- Sync existing checked-out bookings' rooms to DIRTY status
UPDATE accommodations 
SET operational_status = 'DIRTY' 
WHERE id IN (
    SELECT accommodation_id 
    FROM bookings 
    WHERE status = 'CHECKED_OUT'
);
