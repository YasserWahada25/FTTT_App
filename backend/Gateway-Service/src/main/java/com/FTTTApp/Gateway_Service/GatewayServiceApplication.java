package com.FTTTApp.Gateway_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayServiceApplication.class, args);
	}

	@Bean
	public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
		return builder.routes()
				.route("club-service-route", r -> r.path("/api/clubs/**")
						.uri("lb://club-service"))
				.route("terrain-service-route", r -> r.path("/api/terrains/**")
						.uri("lb://terrain-service"))
				.route("SERVICE-PROFILE-route", r -> r.path("/api/profiles/**")
						.uri("lb://SERVICE-PROFILE"))
				.route("AUTH-SERVICE-route", r -> r.path("/api/auth/**")
						.uri("lb://AUTH-SERVICE"))
				.route("Licences-Service-route", r -> r.path("/api/licenses/**")
						.uri("lb://Licences-Service"))
				.route("competition-service-route", r -> r.path("/api/competitions/**")
						.uri("lb://competition-service"))
				.build();
	}
}
