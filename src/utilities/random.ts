export const generateRandomToken = (length: number = 24, isNum?: boolean) => {
  const characters = isNum
    ? '0123456789'
    : 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 1; i < length; i++) {
    token =
      token + characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return token;
};
