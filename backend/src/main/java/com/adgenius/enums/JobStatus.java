package com.adgenius.enums;

import java.util.EnumSet;
import java.util.Set;

public enum JobStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED;

    public static final Set<JobStatus> TERMINAL = EnumSet.of(COMPLETED, FAILED, CANCELLED);

    public boolean isTerminal() {
        return TERMINAL.contains(this);
    }
}
