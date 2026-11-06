package com.adgenius.integration.aws;

import com.adgenius.config.AppProperties;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

public class LocalStorageService implements StorageService {
    private final Path root;
    private final AppProperties props;

    public LocalStorageService(AppProperties props) throws IOException {
        this.props = props;
        this.root = Path.of(props.getStorage().getLocalDir()).toAbsolutePath().normalize();
        Files.createDirectories(this.root);
    }

    @Override
    public String provider() {
        return "LOCAL";
    }

    @Override
    public void put(String objectKey, byte[] bytes, String contentType) {
        try {
            Path target = resolve(objectKey);
            Files.createDirectories(target.getParent());
            Files.write(target, bytes);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file locally", e);
        }
    }

    @Override
    public byte[] get(String objectKey) {
        try {
            return Files.readAllBytes(resolve(objectKey));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read local file", e);
        }
    }

    @Override
    public InputStream getStream(String objectKey) {
        try {
            return Files.newInputStream(resolve(objectKey));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to stream local file", e);
        }
    }

    @Override
    public String presignedUrl(String objectKey, Duration ttl) {
        return props.getApiBaseUrl() + "/api/v1/media/file/" + objectKey;
    }

    @Override
    public void delete(String objectKey) {
        try {
            Files.deleteIfExists(resolve(objectKey));
        } catch (IOException ignored) {
        }
    }

    private Path resolve(String objectKey) {
        Path target = root.resolve(objectKey).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Invalid object key");
        }
        return target;
    }
}
