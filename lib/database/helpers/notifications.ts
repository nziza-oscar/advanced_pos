import Notification from '../models/Notification';
import { Transaction } from 'sequelize';

interface CreateNotificationParams {
  title: string;
  message: string;
  type: 'low_stock' | 'sale' | 'system' | 'alert';
  userId?: string | null;
}

export async function createNotification(
  { title, message, type, userId = null }: CreateNotificationParams,
  transaction?: Transaction
) {
  try {
    return await Notification.create({
      title: title.toUpperCase(), 
      message,
      type,
      user_id: userId,
      is_read: false,
    }, { transaction });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}