import { storiesTable, workersTable, projectsTable } from "../models/index.js";

/**
 * Story Service
 * Handles volunteer story generation and management
 */

export const storyService = {
  /**
   * Create a new story
   */
  createStory: async (data) => {
    try {
      const story = await storiesTable.create(data);
      return story;
    } catch (error) {
      console.error("Error creating story:", error);
      throw error;
    }
  },

  /**
   * Get all stories for a worker
   */
  getWorkerStories: async (workerId) => {
    try {
      return await storiesTable.find({ workerId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching worker stories:", error);
      throw error;
    }
  },

  /**
   * Get story by ID
   */
  getStoryById: async (id) => {
    try {
      return await storiesTable.findById(id);
    } catch (error) {
      console.error("Error fetching story:", error);
      throw error;
    }
  },

  /**
   * Update story
   */
  updateStory: async (id, data) => {
    try {
      const story = await storiesTable.findByIdAndUpdate(id, data, { new: true });
      return story;
    } catch (error) {
      console.error("Error updating story:", error);
      throw error;
    }
  },

  /**
   * Delete story
   */
  deleteStory: async (id) => {
    try {
      return await storiesTable.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting story:", error);
      throw error;
    }
  },

  /**
   * Generate story content based on parameters
   * This simulates an AI generation or uses templates
   */
  generateStoryContent: async (params) => {
    try {
      const { workerId, projectId, platform, tone, additionalContext } = params;

      // Fetch context if available
      let workerName = "Volunteer";
      let projectName = "Community Project";
      
      if (workerId) {
        const worker = await workersTable.findById(workerId);
        if (worker) workerName = `${worker.firstname} ${worker.lastname}`;
      }
      
      if (projectId) {
        const project = await projectsTable.findById(projectId);
        if (project) projectName = project.name;
      }

      // Template generation logic
      let content = "";
      
      const templates = {
        professional: {
          linkedin: `I'm proud to contribute to ${projectName} as a volunteer. It's been an incredible journey working with such a dedicated team. We've made significant progress in our goals. #Volunteering #CommunityImpact #SocialGood`,
          twitter: `Honored to be part of ${projectName}. Great team, great cause. Making a difference one step at a time! 🚀 #Volunteer #${projectName.replace(/\s/g, '')}`,
          instagram: `✨ Making a difference at ${projectName}!\n\nGrateful for the opportunity to give back to the community. Swipe to see our work in action! 📸\n\n#VolunteerLife #CommunityService #Impact #${projectName.replace(/\s/g, '')}`,
          facebook: `I recently spent time volunteering with ${projectName}, and I'm truly inspired by the work being done. It's amazing to see what we can achieve when we come together. If you're looking to get involved, I highly recommend it!`
        },
        casual: {
          linkedin: `Had a great time helping out at ${projectName}. Always good to give back! 🙌 #Community #Volunteering`,
          twitter: `Helping out at ${projectName} today! Loving the vibe and the impact we're making. ❤️ #Volunteer #GoodVibes`,
          instagram: `Day well spent at ${projectName}! 🌟\n\nLove this team and what we're doing. 💪\n\n#Volunteer #Community #Happy`,
          facebook: `Just finished a shift at ${projectName}. So happy to be part of this! Check them out if you want to help.`
        },
        enthusiastic: {
          linkedin: `Thrilled to share my experience with ${projectName}! 🌟 The energy is contagious and the impact is real. So happy to be part of this movement! 🚀 #Impact #ChangeMakers #Volunteering`,
          twitter: `OMG! ${projectName} is absolutely amazing! 🤩 So pumped to be helping out. Let's goooo! 🔥 #VolunteerPower #Change`,
          instagram: `BEST. DAY. EVER! 🎉\n\nVolunteering at ${projectName} has been such a blast! So much love for this crew. ❤️\n\n#Volunteer #LoveThis #Impact`,
          facebook: `I can't say enough good things about ${projectName}! 💖 It's been such an incredible experience volunteering here. Join us!!`
        }
      };

      const selectedTone = templates[tone] || templates.professional;
      content = selectedTone[platform] || selectedTone.linkedin;

      if (additionalContext) {
        content += `\n\n${additionalContext}`;
      }

      return {
        content,
        generatedAt: new Date(),
        params
      };

    } catch (error) {
      console.error("Error generating story:", error);
      throw error;
    }
  }
};
