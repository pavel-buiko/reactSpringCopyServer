export async function seed(knex) {
  await knex("projects").del();

  await knex("projects").insert([
    {
      title: "Spring Boot",
      description:
        "Takes an opinionated view of building Spring applications and gets you in and running as quickly as possible.",
      img_src: "/img/spring-boot.svg",
      link: "#",
    },
    {
      title: "Spring Framework",
      description:
        "Provides core support for dependency injection, transaction management, web apps, data access, messaging, and more.",
      img_src: "/img/spring-framework.svg",
      link: "#",
    },
    {
      title: "Spring Data",
      description:
        "Provides a consistent approach to data access - relational, non-relational, map-reduce, and beyond.",
      img_src: "/img/spring-data.svg",
      link: "#",
    },
    {
      title: "Spring Cloud",
      description:
        "Provides a set of tools for common patterns in distributed systems. Useful for building and deploying microservices.",
      img_src: "/img/spring-cloud.svg",
      link: "#",
    },
    {
      title: "Spring Cloud Data Flow",
      description:
        "Provides an orchestration service for composable data microservice applications on modern runtimes.",
      img_src: "/img/spring-data-flow.svg",
      link: "#",
    },
    {
      title: "Spring Security",
      description:
        "Takes an opinionated view of building Spring applications and gets you in and running as quickly as possible.",
      img_src: "/img/spring-security.svg",
      link: "#",
    },
  ]);
}
