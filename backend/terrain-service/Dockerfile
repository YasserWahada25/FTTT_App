FROM amazoncorretto:17
EXPOSE 9008
ADD target/terrain-service-0.0.1-SNAPSHOT.jar TerrainService-docker.jar
ENTRYPOINT ["java", "-jar", "TerrainService-docker.jar"]