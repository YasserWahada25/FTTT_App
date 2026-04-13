FROM amazoncorretto:21
EXPOSE 8888
ADD target/ConfigServer-service-0.0.1-SNAPSHOT.jar ConfigServerService-docker.jar
ENTRYPOINT ["java", "-jar", "ConfigServerService-docker.jar"]