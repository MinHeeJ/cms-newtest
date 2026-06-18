FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S cms && adduser -S cms -G cms
COPY --from=builder /app/target/*.jar app.jar
USER cms
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
