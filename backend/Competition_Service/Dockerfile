FROM amazoncorretto:21
EXPOSE 8081
ADD target/Competition_Service-0.0.1-SNAPSHOT.jar CompetitionService-docker.jar
ENTRYPOINT ["java", "-jar", "CompetitionService-docker.jar"]