const Program = require("../models/admin/Program");

exports.getPublicPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select("title slug shortDescription fullDescription image isActive displayOrder createdAt updatedAt");

    return res.status(200).json(programs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch programs" });
  }
};

exports.getPublicProgramBySlug = async (req, res) => {
  try {
    const program = await Program.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select("title slug shortDescription fullDescription image isActive displayOrder createdAt updatedAt");

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    return res.status(200).json(program);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch program details" });
  }
};
