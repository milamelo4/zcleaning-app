const { createUser, findUserByEmail, updateProfileImage } = require("../models/users-model.js");


async function handleOAuthUser(firstName, lastName, email, profileImage) {
  let user = await findUserByEmail(email);

  if (!user) {
    user = await createUser(firstName, lastName, email, profileImage);
  } else if (user.profile_image_url !== profileImage && profileImage) {
    await updateProfileImage(email, profileImage);
    user.profile_image_url = profileImage;
  }

  return user;
}

module.exports = {
  handleOAuthUser,
};
