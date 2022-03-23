import { HttpException, HttpStatus } from '@nestjs/common';

export const handleException = (
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
