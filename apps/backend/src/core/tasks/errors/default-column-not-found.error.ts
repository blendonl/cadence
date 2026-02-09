import { NotFoundException } from '@nestjs/common';

export class DefaultColumnNotFoundError extends NotFoundException {
  constructor() {
    super('No column found on the default board. Please create a column first.');
  }
}
