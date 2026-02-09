import { NotFoundException } from '@nestjs/common';

export class GeneralProjectNotFoundError extends NotFoundException {
  constructor() {
    super('The "General" project was not found. Please create a project named "General" first.');
  }
}
