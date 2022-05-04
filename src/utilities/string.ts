export const capitalize = (param: string) => {
  const paramSplits = param
    .split(' ')
    .map(
      (paramSlice) =>
        paramSlice.charAt(0).toUpperCase() + paramSlice.slice(1).toLowerCase(),
    );
  return paramSplits.join(' ');
};
