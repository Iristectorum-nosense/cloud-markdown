const { promises, accessSync, constants } = window.electronAPI.fs;

/* 检查文件是否存在 */
const checkExist = (path) => {
  try {
    accessSync(path, constants.R_OK);  // fs.constants.F_OK 检查文件存在，读取、写入或执行分别为 fs.constants.R_OK、fs.constants.W_OK 或 fs.constants.X_OK
  } catch (error) {
    throw new Error('File does not exist!');
  }
};

const fileHelper = {
  /* 读文件 */
  readFile: (path) => {
    checkExist(path);
    return promises.readFile(path, { encoding: 'utf8' });
  },
  /* 写文件 */
  writeFile: (path, content) => {
    return promises.writeFile(path, content, { encoding: 'utf8' });
  },
  /* 重命名 */
  renameFile: (prePath, newPath) => {
    checkExist(prePath);
    return promises.rename(prePath, newPath);
  },
  /* 删除文件 */
  deleteFile: (path) => {
    checkExist(path);
    return promises.unlink(path);
  }
};

export default fileHelper;