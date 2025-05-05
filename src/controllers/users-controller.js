const { createUser, findUserByEmail } = require("../models/users-model.js");

async function handleOAuthUser(firstName, lastName, email) {
  try {
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser(firstName, lastName, email);
    }
    return user;
  } catch (err) {
    throw new Error("OAuth user handling failed: " + err.message);
  }
}

module.exports = {
  handleOAuthUser,
};
