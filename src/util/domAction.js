/* 获取元素节点的指定父节点 */
export const getParentNode = (node, parentClassName) => {
  let current = node;

  // 遍历到最顶层
  while (current !== null) {
    if (current.classList.contains(parentClassName)) {
      return current;
    }
    current = current.parentNode;
  }

  return false;
}