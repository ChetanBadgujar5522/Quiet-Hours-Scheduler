export interface QuietBlock {
  id: string; // Changed from number to string for UUID
  user_id: string;
  start_time: string; // Changed from startTime for snake_case convention
  end_time: string;   // Changed from endTime for snake_case convention
  notified: boolean;
}

export interface NotificationMessage {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
}
