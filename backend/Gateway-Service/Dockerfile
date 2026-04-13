FROM amazoncorretto:21
EXPOSE 8090
ADD target/Gateway-Service-0.0.1-SNAPSHOT.jar GatewayService-docker.jar
ENTRYPOINT ["java", "-jar", "GatewayService-docker.jar"]