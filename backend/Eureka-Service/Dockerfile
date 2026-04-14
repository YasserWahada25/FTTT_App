FROM amazoncorretto:21
EXPOSE 8761
ADD target/Eureka-Service-0.0.1-SNAPSHOT.jar EurekaService-docker.jar
ENTRYPOINT ["java", "-jar", "EurekaService-docker.jar"]