import schedule from "node-schedule";
import Article from "../models/article.model.js";
import TaskStatus from "../models/taskStatus.model.js";
import Topic from "../models/topic.model.js";
import User from "../models/user.model.js";
import { sendNotification } from "./notification.service.js";

const scheduleFeedNotifications = (jobName, id, date) => {
  //   const jobName = "abc";
  //   const date = new Date();
  //   date.setDate(7 + date.getDate());
  schedule.cancelJob(jobName);
  const job = schedule.scheduleJob(
    jobName,
    date,
    // new Date(2022, 11, 20, 23, min, 0),
    async function (userId) {
      console.log(`The id is ${userId}`);
      const topics = await Topic.find({
        irrelevantUsers: { $elemMatch: { $eq: userId } },
      });
      const irrelevantTopics = topics.map((topic) => topic._id);

      const filter = {
        topic: { $nin: irrelevantTopics },
        irrelevantUsers: { $not: { $elemMatch: { $eq: userId } } },
        usersRead: { $not: { $elemMatch: { $eq: userId } } },
      };
      const feed = await Article.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "articles",
            as: "relatedTasks",
          },
        },
        { $sort: { start: 1 } },
      ]);
      if (feed.length === 0) {
        return;
      }
      const notificationData = {
        userId: userId,
        content: feed[0].content.slice(0, 20),
        heading: feed[0].title,
      };
      if (feed[0].imgLink) {
        notificationData.imageUrl = feed[0].imgLink;
      }
      await sendNotification(notificationData);
    }.bind(null, id)
  );
};

const cancelFeedNotifications = (jobName) => {
  schedule.cancelJob(jobName);
};

const scheduleTaskNotifications = (id) => {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [new schedule.Range(0, 6)];
  rule.hour = 12;
  rule.minute = 0;

  const job = schedule.scheduleJob(
    rule,
    // async function (userId) {
    //   const user = await User.findById(userId);
    //   const activeTasks = await TaskStatus.find({
    //     status: "Started",
    //     user: userId,
    //   })
    //   if (activeTasks.length === 0) {
    //     return;
    //   }
    //   const activeAdminTasks = activeTasks.filter(
    //     (activeTask) => activeTask.start !== undefined
    //   );
    //   if (activeAdminTasks.length === 0) {
    //     return;
    //   }
    //   const date = new Date();
    //   const days = (date - user.expectedBirthDate) / (1000 * 60 * 60 * 24);
    //   const expiredTasks = activeAdminTasks.filter((task) => task.end < days);
    //   const upcomingTasks = activeAdminTasks.filter(
    //     (task) => task.end <= days + 7
    //   );
    //   let notificationData;
    //   if (upcomingTasks.length === 0 && expiredTasks.length === 0) {
    //     return;
    //   }
    //   if (upcomingTasks.length === 0) {
    //     notificationData = {
    //       heading: "Tasks Expired",
    //       content: `You have ${expiredTasks.length} expired tasks`,
    //       userId: userId,
    //     };
    //   } else if (expiredTasks.length === 0) {
    //     notificationData = {
    //       heading: "Upcoming Tasks",
    //       content: `You have ${upcomingTasks.length} tasks this week`,
    //       userId: userId,
    //     };
    //   } else {
    //     notificationData = {
    //       heading: "Tasks Status",
    //       content: `You have ${upcomingTasks.length} tasks this week`,
    //       userId: userId,
    //     };
    //   }
    //   sendNotification(notificationData);
    // }.bind(null, id)

    async function () {
      const activeTasks = await TaskStatus.find({
        status: "Started",
      }).populate("user");
      if (activeTasks.length === 0) {
        return;
      }
      const activeAdminTasks = activeTasks.filter(
        (activeTask) => activeTask.start !== undefined
      );
      if (activeAdminTasks.length === 0) {
        return;
      }

      const tasksGroupByUser = activeAdminTasks.reduce((group, task) => {
        if (group[task.user._id]) {
          group[task.user._id.toString()] =
            group[task.user._id.toString()].push(task);
        } else {
          group[task.user._id.toString()] = [task];
        }
        return group;
      }, {});
      const promises = [];
      for (let userId in tasksGroupByUser) {
        if (!tasksGroupByUser[userId][0].user.enableNotifications) {
          continue;
        }
        const date = new Date();
        const days =
          (date - tasksGroupByUser[userId][0].user.expectedBirthDate) /
          (1000 * 60 * 60 * 24);
        const expiredTasks = tasksGroupByUser[userId].filter(
          (task) => task.end < days
        );
        const upcomingTasks = tasksGroupByUser[userId].filter(
          (task) => task.end <= days + 7
        );
        let notificationData;
        if (upcomingTasks.length === 0 && expiredTasks.length === 0) {
          return;
        }
        if (upcomingTasks.length === 0) {
          notificationData = {
            heading: "Tasks Expired",
            content: `You have ${expiredTasks.length} expired tasks`,
            userId: userId,
          };
        } else if (expiredTasks.length === 0) {
          notificationData = {
            heading: "Upcoming Tasks",
            content: `You have ${upcomingTasks.length} tasks this week`,
            userId: userId,
          };
        } else {
          notificationData = {
            heading: "Tasks Status",
            content: `You have ${upcomingTasks.length} tasks this week`,
            userId: userId,
          };
        }
        promises.push(sendNotification(notificationData));
      }

      await Promise.all(promises);
    }
  );
};

export {
  scheduleFeedNotifications,
  scheduleTaskNotifications,
  cancelFeedNotifications,
};
