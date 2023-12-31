const useDateParser = (date: string): Date => {
  const isoDateFormat = date.split(" ").reduce((prev, current, index) => {
    if (index === 0) {
      return prev + "T" + current;
    }
    return prev;
  });
  return new Date(isoDateFormat);
};

export default useDateParser;
