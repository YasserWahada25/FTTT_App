# Utilise une image Java officielle (Modifie '17' si tu utilises Java 11 ou 21)
FROM eclipse-temurin:17-jdk-alpine

# Crée un volume temporaire (utile pour Spring Boot)
VOLUME /tmp

# Copie le fichier JAR généré à l'étape 1 dans l'image Docker
COPY target/*.jar app.jar

# Commande pour lancer l'application
ENTRYPOINT ["java","-jar","/app.jar"]