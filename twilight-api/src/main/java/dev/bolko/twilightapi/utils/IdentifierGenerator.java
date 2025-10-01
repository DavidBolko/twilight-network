package dev.bolko.twilightapi.utils;

import java.util.Random;

public class IdentifierGenerator {
    private static long min = 1_000_000_000L;
    private static long max = 9_999_999_999L;
    public static long randomLong() {
        return min + (long) (Math.random() * (max - min + 1));
    }
}
