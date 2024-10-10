import postgres from "../db.js";

export const findUserByUsername = (username) => {
  return postgres("users").where({ username }).first();
};

export const createUser = (userData) => {
  return postgres("users").insert(userData);
};
