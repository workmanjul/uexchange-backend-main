import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExecutionContextDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext) => context,
);
