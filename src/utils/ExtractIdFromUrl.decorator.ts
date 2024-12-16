import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExtractIdFromUrl = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const urlParts = request.url.split('/');
    console.log(urlParts);
    const id = urlParts[urlParts.length - 1];
    return parseInt(id, 10); // Assuming the id is a number
  },
);
