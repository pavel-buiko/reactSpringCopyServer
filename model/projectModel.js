import postgres from "../db.js";

export const getProjects = (searchTerm) => {
  let query = postgres("projects").select("*");

  if (searchTerm) {
    query = query.where(function () {
      this.whereRaw("LOWER(title) LIKE ?", [`%${searchTerm}%`]).orWhereRaw(
        "LOWER(description) LIKE ?",
        [`%${searchTerm}%`]
      );
    });
  }

  return query;
};
