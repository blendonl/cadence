import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Goal } from '@prisma/client';
import {
  GOAL_REPOSITORY,
  type GoalRepository,
} from '../repository/goal.repository';

@Injectable()
export class GoalGetOneUseCase {
  constructor(
    @Inject(GOAL_REPOSITORY)
    private readonly goalRepository: GoalRepository,
  ) {}

  async execute(id: number, userId: string): Promise<Goal> {
    const goal = await this.goalRepository.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException(`Goal with id ${id} not found`);
    }
    return goal;
  }
}
