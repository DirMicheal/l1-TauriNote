 
// 封装函数：将文件转换为Base64（普通函数，非 React Hook）
const convertFileToBase64 = ( file: File ): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      // 检查是否为图片文件
      if (!file.type.startsWith("image/")) {
        reject("仅支持图片文件！");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result); // 成功返回Base64字符串
        }
      };
      reader.onerror = () => {
        reject("文件读取失败，请检查文件是否有效。");
      };
      reader.readAsDataURL(file);
    });
  };
export default convertFileToBase64