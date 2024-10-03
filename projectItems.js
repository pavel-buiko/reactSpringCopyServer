const apiBaseUrl =
  process.env.API_BASE_URL ?? "https://server-ancient-grass-9030.fly.dev";

const projectItems = [
  {
    title: "Spring Boot",
    description:
      "Takes an opinionated view of building Spring applications and gets you in and running as quickly as possible.",
    imgSrc: `${apiBaseUrl}/img/spring-boot.svg`,
    link: "#",
  },
  {
    title: "Spring Framework",
    description:
      "Provides core support for dependency injection, transaction management, web apps, data access, messaging, and more.",
    imgSrc: `${apiBaseUrl}/img/spring-framework.svg`,
    link: "#",
  },
  {
    title: "Spring Data",
    description:
      "Provides a consistent approach to data access - relational, non-relational, map-reduce, and beyond.",
    imgSrc: `${apiBaseUrl}/img/spring-data.svg`,
    link: "#",
  },
  {
    title: "Spring Cloud",
    description:
      "Provides a set of tools for common patterns in distributed systems. Useful for building and deploying microservices.",
    imgSrc: `${apiBaseUrl}/img/spring-cloud.svg`,
    link: "#",
  },
  {
    title: "Spring Cloud Data Flow",
    description:
      "Provides an orchestration service for composable data microservice applications on modern runtimes.",
    imgSrc: `${apiBaseUrl}/img/spring-data-flow.svg`,
    link: "#",
  },
  {
    title: "Spring Security",
    description:
      "Takes an opinionated view of building Spring applications and gets you in and running as quickly as possible.",
    imgSrc: `${apiBaseUrl}/img/spring-security.svg`,
    link: "#",
  },
];

export default projectItems;
