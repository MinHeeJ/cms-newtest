FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17.0.12_7-jre-alpine
WORKDIR /app
RUN addgroup -S cms && adduser -S cms -G cms
COPY --from=builder /app/target/*.jar app.jar
USER cms
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
