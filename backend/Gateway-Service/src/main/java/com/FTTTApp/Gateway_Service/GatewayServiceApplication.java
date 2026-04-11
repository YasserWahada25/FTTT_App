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
                // Route pour le microservice gestion-club
                .route("club-service-route", r -> r.path("/api/clubs/**")
                        .uri("lb://club-service"))

                // Route pour le microservice terrain-service
                .route("terrain-service-route", r -> r.path("/terrains/**")
                        .uri("lb://terrain-service"))

                // Route pour le microservice SERVICE-PROFILE
                .route("SERVICE-PROFILE-route", r -> r.path("/api/profiles/**")
                        .uri("lb://SERVICE-PROFILE"))

                // Route pour le microservice AUTH-SERVICE
                .route("AUTH-SERVICE-route", r -> r.path("/api/auth/**")
                        .uri("lb://AUTH-SERVICE"))

                .build();
    }
}