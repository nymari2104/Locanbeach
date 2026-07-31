package com.locanbeach.backend.repository;

import com.locanbeach.backend.dto.HoldSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Repository
@RequiredArgsConstructor
public class HoldSessionRepository {

    private static final String KEY_PREFIX = "hold:session:";
    private static final long DEFAULT_TTL_SECONDS = 420; // 7 minutes

    private final RedisTemplate<String, Object> redisTemplate;

    // Fallback store in memory if Valkey / Redis is down
    private final Map<String, HoldSession> fallbackMemoryStore = new ConcurrentHashMap<>();

    public HoldSession get(String guestToken) {
        if (guestToken == null || guestToken.trim().isEmpty()) return null;
        String key = KEY_PREFIX + guestToken;
        try {
            Object obj = redisTemplate.opsForValue().get(key);
            if (obj instanceof HoldSession) {
                return (HoldSession) obj;
            }
        } catch (Exception e) {
            log.warn("Valkey/Redis read error for key {}. Falling back to in-memory store: {}", key, e.getMessage());
            return fallbackMemoryStore.get(guestToken);
        }
        return null;
    }

    public void save(String guestToken, HoldSession session) {
        save(guestToken, session, DEFAULT_TTL_SECONDS);
    }

    public void save(String guestToken, HoldSession session, long ttlSeconds) {
        if (guestToken == null || guestToken.trim().isEmpty() || session == null) return;
        String key = KEY_PREFIX + guestToken;
        long actualTtl = ttlSeconds > 0 ? ttlSeconds : DEFAULT_TTL_SECONDS;
        try {
            redisTemplate.opsForValue().set(key, session, actualTtl, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Valkey/Redis write error for key {}. Falling back to in-memory store: {}", key, e.getMessage());
            fallbackMemoryStore.put(guestToken, session);
        }
    }

    public void delete(String guestToken) {
        if (guestToken == null || guestToken.trim().isEmpty()) return;
        String key = KEY_PREFIX + guestToken;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Valkey/Redis delete error for key {}. Clearing fallback store: {}", key, e.getMessage());
        }
        fallbackMemoryStore.remove(guestToken);
    }
}
