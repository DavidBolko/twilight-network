package dev.bolko.twilightapi.utils;

import java.security.SecureRandom;
import java.util.Random;

public final class IdentifierGenerator {
    private static final SecureRandom random = new SecureRandom();

    private static final long MIN = 1_000_000_000L;
    private static final long MAX = 9_999_999_999L;
    public static long randomLong() {
        return MIN + (long) (random.nextDouble() * (MAX - MIN + 1));
    }
}
