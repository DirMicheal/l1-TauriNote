export function getStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error("获取 localStorage 失败:", error);
    return null;
  }
}

export function setStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error("设置 localStorage 失败:", error);
  }
}
