import { HttpException, HttpStatus } from '@nestjs/common';

export const throwException = (
  statusCode: HttpStatus,
  error: string,
  message: string,
) => {
  throw new HttpException(
    {
      statusCode,
      error,
      message,
    },
    statusCode,
  );
};
