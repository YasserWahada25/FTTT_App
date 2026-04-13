FROM amazoncorretto:21
EXPOSE 8096
ADD target/Sevice-Profile-0.0.1-SNAPSHOT.jar ServiceProfile-docker.jar
ENTRYPOINT ["java", "-jar", "ServiceProfile-docker.jar"]