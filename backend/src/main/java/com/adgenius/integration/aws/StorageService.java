package com.adgenius.integration.aws;

import java.io.InputStream;
import java.time.Duration;

public interface StorageService {
    String provider();
    void put(String objectKey, byte[] bytes, String contentType);
    byte[] get(String objectKey);
    InputStream getStream(String objectKey);
    String presignedUrl(String objectKey, Duration ttl);
    void delete(String objectKey);
}
