package com.FTTTApp.Sevice_Profile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient

public class SeviceProfileApplication {

	public static void main(String[] args) {
		SpringApplication.run(SeviceProfileApplication.class, args);
	}

}
