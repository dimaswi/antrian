import React from 'react';

interface Room {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  prefix: string;
  waiting_queues_count?: number;
  active_counters?: Counter[];
}

interface Counter {
  id: number;
  room_id: number;
  name: string;
  code: string;
  description?: string;
  type: string;
  is_active: boolean;
  waiting_count?: number;
  current_serving?: Queue;
  next_queue?: Queue;
  room?: Room;
}

interface Queue {
  id: number;
  room_id: number;
  counter_id: number;
  queue_number: string;
  number_sequence: number;
  status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
  called_at?: string;
  served_at?: string;
  completed_at?: string;
  queue_date: string;
  room?: Room;
  counter?: Counter;
  position?: number;
  estimated_wait_time?: number;
}

interface QueueStatistics {
  total_queues: number;
  waiting_queues: number;
  serving_queues: number;
  completed_queues: number;
  cancelled_queues: number;
}

export type { Room, Counter, Queue, QueueStatistics };
