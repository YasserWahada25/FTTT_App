FROM amazoncorretto:21
RUN yum install -y curl && yum clean all

EXPOSE 8082
ADD target/Auth-Service-0.0.1-SNAPSHOT.jar AuthService-docker.jar
ENTRYPOINT ["java", "-jar", "AuthService-docker.jar"]