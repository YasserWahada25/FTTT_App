FROM amazoncorretto:21
EXPOSE 8087
ADD target/Licences-Service-0.0.1-SNAPSHOT.jar LicencesService-docker.jar
ENTRYPOINT ["java", "-jar", "LicencesService-docker.jar"]