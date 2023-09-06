/* 检查是否存在同命名文件 */
export const duplicateTitle = (files, title) => {
  const titles = new Set();

  for (const file of files) {
    titles.add(file, file.title);
    if (titles.has(title) && title) {
      return true;
    }
  }

  return false;
};

/* 检查命名是否符合规则 */
export const validateTitle = (title) => {
  const restrictedChars = /[\\/:*?"<>|]/;
  const startsWithSpaceDot = /^[ .]/;
  const endsWithSpaceDot = /[ .]$/;
  const maxLength = 255;

  if (
    restrictedChars.test(title) ||
    startsWithSpaceDot.test(title) ||
    endsWithSpaceDot.test(title) ||
    title.length > maxLength
  ) {
    return false;
  }

  return true;
}