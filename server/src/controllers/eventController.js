const Event = require("../models/admin/Event");

exports.getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 });
    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events" });
  }
};
