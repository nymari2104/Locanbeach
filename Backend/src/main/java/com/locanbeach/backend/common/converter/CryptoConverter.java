package com.locanbeach.backend.common.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

@Converter
@Component
public class CryptoConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/ECB/PKCS5Padding";
    
    // We will inject this from application.yml, but since JPA converters are instantiated 
    // by Hibernate before Spring injection is fully complete in some cases, 
    // we use a static variable populated by Spring.
    private static byte[] KEY;

    @Value("${app.security.encryption.key:1234567890123456}") // Default 16-byte key if not set
    public void setKey(String key) {
        // Ensure key is 16 bytes for AES-128
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        byte[] finalKey = new byte[16];
        System.arraycopy(keyBytes, 0, finalKey, 0, Math.min(keyBytes.length, 16));
        KEY = finalKey;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKeySpec secretKey = new SecretKeySpec(KEY != null ? KEY : "1234567890123456".getBytes(), "AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedData = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            SecretKeySpec secretKey = new SecretKeySpec(KEY != null ? KEY : "1234567890123456".getBytes(), "AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decryptedData = cipher.doFinal(Base64.getDecoder().decode(dbData));
            return new String(decryptedData, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // If it fails to decrypt (e.g. legacy unencrypted data), return it as is or handle it
            return dbData;
        }
    }
}
