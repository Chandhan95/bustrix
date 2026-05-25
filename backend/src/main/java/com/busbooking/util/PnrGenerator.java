package com.busbooking.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class PnrGenerator {

    private static final String PREFIX = "BT";
    private static final Random RANDOM = new Random();

    public static String generate() {
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        int randomNum = RANDOM.nextInt(9000) + 1000;
        return PREFIX + timestamp + randomNum;
    }
}
