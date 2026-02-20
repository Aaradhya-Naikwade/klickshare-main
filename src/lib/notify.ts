import Notification from "@/models/Notification";

export async function createNotification({

  userId,
  type,
  message,
  groupId,

}: {

  userId: string;
  type: string;
  message: string;
  groupId?: string;

}) {

  try {

    await Notification.create({

      userId,
      type,
      message,
      groupId,

    });

  } catch {

    console.log(
      "Notification failed"
    );

  }

}
