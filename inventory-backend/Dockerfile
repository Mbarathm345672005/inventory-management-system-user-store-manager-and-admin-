# Stage 1: Build the application using Maven and OpenJDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the executable jar without running tests
RUN mvn clean package -DskipTests

# Stage 2: Create a lightweight runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot default port
ENV PORT=8080
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
