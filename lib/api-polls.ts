import { api } from './api';

export interface Poll {
  id: string;
  post_id: string;
  question: string;
  allows_multiple_answers: boolean;
  closes_at?: string;
  total_votes: number;
  created_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  votes_count: number;
  option_order: number;
  created_at: string;
}

export interface PollWithOptions {
  id: string;
  post_id: string;
  question: string;
  allows_multiple_answers: boolean;
  closes_at?: string;
  total_votes: number;
  options: PollOptionWithVotes[];
  user_votes: string[]; // option_ids que el usuario votó
  created_at: string;
}

export interface PollOptionWithVotes {
  id: string;
  option_text: string;
  votes_count: number;
  percentage: number;
  option_order: number;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  allows_multiple_answers?: boolean;
  duration_hours?: number; // null = sin límite
}

export interface VotePollRequest {
  option_ids: string[];
}

export const pollsApi = {
  async createPoll(postId: string, data: CreatePollRequest): Promise<PollWithOptions> {
    const response = await api.post(`/posts/${postId}/poll`, data);
    return response.data;
  },

  async votePoll(pollId: string, optionIds: string[]): Promise<PollWithOptions> {
    const response = await api.post(`/polls/${pollId}/vote`, { option_ids: optionIds });
    return response.data;
  },

  async getPollResults(pollId: string): Promise<PollWithOptions> {
    const response = await api.get(`/polls/${pollId}`);
    return response.data;
  },

  async removeVote(pollId: string): Promise<void> {
    await api.delete(`/polls/${pollId}/vote`);
  },
};
