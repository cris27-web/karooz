const mongoose = require('mongoose');
const User = require('./models/user');

const setUserAsAdmin = async (userId) => {
	try {
		const user = await User.findByIdAndUpdate(
			userId,
			{ isAdmin: true },
			{ new: true }
		);
		return user ? true : false;
	} catch (error) {
		console.error('Error setting admin privileges:', error);
		return false;
	}
};

module.exports = setUserAsAdmin;
