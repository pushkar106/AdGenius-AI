package com.adgenius.config;

import com.adgenius.integration.aws.LocalStorageService;
import com.adgenius.integration.aws.S3StorageService;
import com.adgenius.integration.aws.StorageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class StorageConfig {
    @Bean
    public StorageService storageService(AppProperties props) throws IOException {
        if (props.getAws().isConfigured()) {
            return new S3StorageService(props);
        }
        return new LocalStorageService(props);
    }
}
