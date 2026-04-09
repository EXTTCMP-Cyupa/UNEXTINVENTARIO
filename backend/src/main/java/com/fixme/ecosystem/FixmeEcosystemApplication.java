package com.fixme.ecosystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.fixme.ecosystem.entity")
@EnableJpaRepositories(basePackages = "com.fixme.ecosystem.repository")
public class FixmeEcosystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(FixmeEcosystemApplication.class, args);
    }

}
