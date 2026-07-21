FROM eclipse-temurin:17.0.10_7-jdk-alpine AS build
WORKDIR /workspace
RUN apk add --no-cache maven=3.9.6-r0 || apk add --no-cache maven
COPY pom.xml ./pom.xml
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17.0.10_7-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/cms-backend-0.1.0.jar /app/cms-backend.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/cms-backend.jar"]
