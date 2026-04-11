package com.FTTTApp.ConfigServer_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;


@SpringBootApplication
@EnableDiscoveryClient
public class ConfigServerServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConfigServerServiceApplication.class, args);
	}

}
