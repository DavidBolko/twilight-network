FROM eclipse-temurin:21-jdk
WORKDIR /app

COPY . .
RUN bash ./gradlew bootJar -x test

EXPOSE 9173
CMD ["java","-jar","build/libs/app.jar"]