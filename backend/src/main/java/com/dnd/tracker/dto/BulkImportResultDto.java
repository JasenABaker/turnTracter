package com.dnd.tracker.dto;

import java.util.List;

public record BulkImportResultDto(int imported, int skipped, List<String> failed) {}
