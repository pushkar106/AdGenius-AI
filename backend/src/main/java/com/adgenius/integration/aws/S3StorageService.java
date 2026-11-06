package com.adgenius.integration.aws;

import com.adgenius.config.AppProperties;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;

public class S3StorageService implements StorageService {
    private final AppProperties props;
    private final S3Client client;
    private final S3Presigner presigner;

    public S3StorageService(AppProperties props) {
        if (!props.getAws().isConfigured()) {
            throw new IllegalStateException("AWS S3 is not fully configured");
        }
        this.props = props;
        AwsBasicCredentials creds = AwsBasicCredentials.create(
                props.getAws().getAccessKey(), props.getAws().getSecretKey());
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(props.getAws().getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(creds));
        if (props.getAws().getEndpoint() != null && !props.getAws().getEndpoint().isBlank()) {
            builder.endpointOverride(URI.create(props.getAws().getEndpoint()));
            builder.forcePathStyle(true);
        }
        this.client = builder.build();
        this.presigner = S3Presigner.builder()
                .region(Region.of(props.getAws().getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .build();
    }

    @Override
    public String provider() {
        return "S3";
    }

    @Override
    public void put(String objectKey, byte[] bytes, String contentType) {
        client.putObject(PutObjectRequest.builder()
                .bucket(props.getAws().getBucket())
                .key(objectKey)
                .contentType(contentType)
                .build(), RequestBody.fromBytes(bytes));
    }

    @Override
    public byte[] get(String objectKey) {
        return client.getObjectAsBytes(GetObjectRequest.builder()
                .bucket(props.getAws().getBucket())
                .key(objectKey)
                .build()).asByteArray();
    }

    @Override
    public InputStream getStream(String objectKey) {
        return client.getObject(GetObjectRequest.builder()
                .bucket(props.getAws().getBucket())
                .key(objectKey)
                .build());
    }

    @Override
    public String presignedUrl(String objectKey, Duration ttl) {
        return presigner.presignGetObject(GetObjectPresignRequest.builder()
                .signatureDuration(ttl)
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(props.getAws().getBucket())
                        .key(objectKey)
                        .build())
                .build()).url().toString();
    }

    @Override
    public void delete(String objectKey) {
        client.deleteObject(DeleteObjectRequest.builder()
                .bucket(props.getAws().getBucket())
                .key(objectKey)
                .build());
    }
}
