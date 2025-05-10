const express = require('express');
const router = express.Router();
const Team = require('../models/team');

const getNextTeamCode = async () => {
  try {
    const lastTeam = await Team.findOne().sort({ teamCode: -1 }).exec();
    return lastTeam ? lastTeam.teamCode + 1 : 1;
  } catch (error) {
    console.error('Error generating team code:', error);
    throw error;
  }
};

// Get all non-deleted teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ cancelled: false });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new team
router.post('/', async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName) {
      return res.status(400).json({ message: 'Team Name is required.' });
    }

    const teamCode = await getNextTeamCode();
    
    const team = new Team({
      teamCode,
      teamName,
      cancelled: false
    });

    const savedTeam = await team.save();
    res.status(201).json(savedTeam);
  } catch (error) {
    console.error('Error saving team:', error);
    res.status(500).json({ message: 'Error saving team', error: error.message });
  }
});

// Update an existing team's details
router.put('/update/:id', async (req, res) => {
  try {
    const { teamCode, teamName } = req.body;

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { teamCode, teamName },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Soft delete a team
router.put('/softDelete/:id', async (req, res) => {
  try {
    const softDeletedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { cancelled: true },
      { new: true }
    );

    if (!softDeletedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete a team
router.delete('/:id', async (req, res) => {
  try {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);

    if (!deletedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team permanently deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
