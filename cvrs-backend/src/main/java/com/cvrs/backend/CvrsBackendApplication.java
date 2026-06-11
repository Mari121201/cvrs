package com.cvrs.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CvrsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CvrsBackendApplication.class, args);
	}

}
