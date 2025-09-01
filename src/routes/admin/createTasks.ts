import asyncHandler from '../../core/AsyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import adminAuth from '../../middleware/adminAuth';
import { SuccessResponse } from '../../core/ApiResponses';
import { TaskRepository } from '../../repositories/TaskRepository';
import { BadRequestError } from '../../core/ApiErrors';
import Logger from '../../core/Logger';
import { ProtectedRequest } from '../../types/AppRequests';

const taskRepository = new TaskRepository();

export const createTasks = [
  adminAuth,
  validator(schema.createTasks),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Bulk create tasks (Admin only)'
    // #swagger.description = 'Create multiple tasks at once. All tasks will be created by the admin user.'

    const { tasks } = req.body;
    const createdTasks = [];
    const failedTasks = [];

    Logger.info(
      `Admin ${req.user?.email} initiated bulk task creation for ${tasks.length} tasks`
    );

    for (const [index, taskData] of tasks.entries()) {
      try {
        // Create task with admin as creator
        const newTask = await taskRepository.create({
          title: taskData.title,
          description: taskData.description,
          totalMinutes: taskData.totalMinutes,
          status: taskData.status || 'TODO',
          createdBy: req.user!._id,
        });

        createdTasks.push(newTask);

        Logger.info(
          `Task created successfully: "${taskData.title}" (Status: ${taskData.status || 'TODO'})`
        );
      } catch (error) {
        Logger.error(`Failed to create task at index ${index}:`, error);
        failedTasks.push({
          index,
          title: taskData.title,
          reason: 'Failed to create task',
        });
      }
    }

    if (createdTasks.length === 0 && failedTasks.length > 0) {
      throw new BadRequestError(
        'No tasks were created. Check the failed tasks list.'
      );
    }

    const response = {
      message: `Successfully created ${createdTasks.length} out of ${tasks.length} tasks`,
      created: createdTasks,
      failed: failedTasks,
      summary: {
        total: tasks.length,
        successful: createdTasks.length,
        failed: failedTasks.length,
      },
    };

    Logger.info(
      `Bulk task creation completed. Success: ${createdTasks.length}, Failed: ${failedTasks.length}`
    );

    new SuccessResponse('Bulk task creation completed', response).send(res);
  }),
];
