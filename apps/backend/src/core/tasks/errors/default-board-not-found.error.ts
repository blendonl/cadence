import { NotFoundException } from '@nestjs/common';

export class DefaultBoardNotFoundError extends NotFoundException {
  constructor() {
    super('No board found on the "General" project. Please create a board first.');
  }
}
