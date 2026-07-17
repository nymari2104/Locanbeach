ALTER TABLE accommodations ADD COLUMN last_cleaned_by UUID;
ALTER TABLE accommodations ADD CONSTRAINT fk_accommodations_last_cleaned_by FOREIGN KEY (last_cleaned_by) REFERENCES users(id);
