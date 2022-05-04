export const generateApiKey = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();

  const getHash = () =>
    Array.from(
      { length: 5 },
      () => characters[(Math.random() * (characters.length - 1)).toFixed(0)],
    ).join('');

  const getKeySuffix = () =>
    Array.from({ length: 6 }, () => getHash()).join('_');

  return `${getHash()}-${getKeySuffix()}`;
};
