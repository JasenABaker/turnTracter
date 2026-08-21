package com.dnd.tracker.util;

import java.util.Arrays;
import java.util.List;

public final class ListStringUtils {

    private ListStringUtils() {}

    public static String joinList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }
        return String.join(", ", values);
    }

    public static List<String> splitList(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split("\\s*,\\s*")).filter(s -> !s.isBlank()).toList();
    }
}
