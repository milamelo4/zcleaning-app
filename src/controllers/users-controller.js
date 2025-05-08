const { createUser, findUserByEmail } = require("../models/users-model.js");

async function handleOAuthUser(firstName, lastName, email) {
  // Check if user exists
  let user = await findUserByEmail(email);

  // If not found, create them with default role (already "unauthorized" now)
  if (!user) {
    user = await createUser(firstName, lastName, email); // no need to pass role
  }
  
  return user;
}

module.exports = {
  handleOAuthUser,
};
