import ResourceGroup from '../models/ResourceGroup.js';
import Resource from '../models/Resource.js';
import LearningGroup from '../models/LearningGroup.js';
import { createNotification } from './notificationController.js';

// Create resource group
export const createResourceGroup = async (req, res) => {
  try {
    const { name, description, linkedGroups } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const resourceGroup = await ResourceGroup.create({
      name,
      description,
      linkedGroups: linkedGroups || [],
      resources: [],
      createdAt: new Date(),
    });

    res.status(201).json(resourceGroup);
  } catch (err) {
    console.error('Create resource group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all resource groups
export const getResourceGroups = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const resourceGroups = await ResourceGroup.find(query)
      .populate('resources', 'title type uploadedBy createdAt')
      .populate('linkedGroups', 'name subject');

    res.json(resourceGroups);
  } catch (err) {
    console.error('Get resource groups error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get resource group by ID
export const getResourceGroupById = async (req, res) => {
  try {
    const resourceGroup = await ResourceGroup.findById(req.params.id)
      .populate('resources', 'title type url description uploadedBy createdAt')
      .populate('linkedGroups', 'name subject description');

    if (!resourceGroup) {
      return res.status(404).json({ message: 'Resource group not found.' });
    }

    res.json(resourceGroup);
  } catch (err) {
    console.error('Get resource group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update resource group
export const updateResourceGroup = async (req, res) => {
  try {
    const { name, description, linkedGroups } = req.body;

    const resourceGroup = await ResourceGroup.findByIdAndUpdate(
      req.params.id,
      { name, description, linkedGroups },
      { new: true, runValidators: true }
    ).populate('resources linkedGroups');

    if (!resourceGroup) {
      return res.status(404).json({ message: 'Resource group not found.' });
    }

    res.json(resourceGroup);
  } catch (err) {
    console.error('Update resource group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete resource group
export const deleteResourceGroup = async (req, res) => {
  try {
    const resourceGroup = await ResourceGroup.findByIdAndDelete(req.params.id);

    if (!resourceGroup) {
      return res.status(404).json({ message: 'Resource group not found.' });
    }

    res.json({ message: 'Resource group deleted successfully.' });
  } catch (err) {
    console.error('Delete resource group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add resource to resource group
export const addResourceToGroup = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const groupId = req.params.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const resourceGroup = await ResourceGroup.findById(groupId);
    if (!resourceGroup) {
      return res.status(404).json({ message: 'Resource group not found.' });
    }

    if (resourceGroup.resources.includes(resourceId)) {
      return res.status(400).json({ message: 'Resource already in this group.' });
    }

    resourceGroup.resources.push(resourceId);
    await resourceGroup.save();

    // Notify linked learning groups
    if (resourceGroup.linkedGroups && resourceGroup.linkedGroups.length > 0) {
      for (const linkedGroupId of resourceGroup.linkedGroups) {
        const learningGroup = await LearningGroup.findById(linkedGroupId);
        if (learningGroup) {
          // Notify all group members
          for (const member of learningGroup.members) {
            await createNotification(
              member.userId,
              'resource_added',
              'New Resource Added',
              `A new resource "${resource.title}" has been added to ${resourceGroup.name}`,
              { resourceId, resourceGroupId: groupId, groupId: linkedGroupId },
              'low'
            );
          }
        }
      }
    }

    const updatedGroup = await ResourceGroup.findById(groupId)
      .populate('resources linkedGroups');

    res.json(updatedGroup);
  } catch (err) {
    console.error('Add resource to group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove resource from resource group
export const removeResourceFromGroup = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const groupId = req.params.id;

    const resourceGroup = await ResourceGroup.findById(groupId);
    if (!resourceGroup) {
      return res.status(404).json({ message: 'Resource group not found.' });
    }

    resourceGroup.resources = resourceGroup.resources.filter(
      r => r.toString() !== resourceId
    );
    await resourceGroup.save();

    const updatedGroup = await ResourceGroup.findById(groupId)
      .populate('resources linkedGroups');

    res.json(updatedGroup);
  } catch (err) {
    console.error('Remove resource from group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Link learning group to resource group
export const linkLearningGroup = async (req, res) => {
  try {
    const { learningGroupId } = req.body;
    const groupId = req.params.id;

    const learningGroup = await LearningGroup.findById(learningGroupId);
    if (!learningGroup) {
      return res.status(404).json({ message: 'Learning group not found.' });
    }

    const resourceGroup = await ResourceGroup.findById(groupId);
    if (!resourceGroup) {
      return res.status(404).json({ message: 'Resource group not found.' });
    }

    if (resourceGroup.linkedGroups.includes(learningGroupId)) {
      return res.status(400).json({ message: 'Learning group already linked.' });
    }

    resourceGroup.linkedGroups.push(learningGroupId);
    await resourceGroup.save();

    const updatedGroup = await ResourceGroup.findById(groupId)
      .populate('resources linkedGroups');

    res.json(updatedGroup);
  } catch (err) {
    console.error('Link learning group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Unlink learning group from resource group
export const unlinkLearningGroup = async (req, res) => {
  try {
    const { learningGroupId } = req.params;
    const groupId = req.params.id;

    const resourceGroup = await ResourceGroup.findById(groupId);
    if (!resourceGroup) {
      return res.status(404).json({ message: 'Resource group not found.' });
    }

    resourceGroup.linkedGroups = resourceGroup.linkedGroups.filter(
      g => g.toString() !== learningGroupId
    );
    await resourceGroup.save();

    const updatedGroup = await ResourceGroup.findById(groupId)
      .populate('resources linkedGroups');

    res.json(updatedGroup);
  } catch (err) {
    console.error('Unlink learning group error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
