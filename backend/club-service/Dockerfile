FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
EXPOSE 9002
ADD target/club-service-0.0.1-SNAPSHOT.jar ClubService-docker.jar
ENTRYPOINT ["java", "-jar", "ClubService-docker.jar"]