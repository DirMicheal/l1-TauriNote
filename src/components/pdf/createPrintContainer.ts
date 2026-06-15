import autoMarkUnbreakableElements from "./autoMarkUnbreakableElements" 
import { htmlStyles,getPrintContainerStyle,PRINT_CONTAINER_STYLE} from "./config"

// 增强版容器创建函数 - 解决空白PDF问题
const createPrintContainer = async (html: string): Promise<HTMLElement> => { 
    
    // 创建一个离屏容器，避免闪烁
    const container = document.createElement('div');
  
    
  
    // 动态注入PDF专用样式
    const style = document.createElement('style');
    style.textContent = htmlStyles;
    
    // 应用容器样式
    Object.assign(container.style, getPrintContainerStyle());
    
    try {
      // 检查HTML内容是否为空或无效
      if (!html || html.trim() === '') {
        console.warn('HTML内容为空，添加默认内容');
        html = '<div class="empty-content" style="padding: 20px; text-align: center; font-size: 16px; color: #666;">文档内容为空</div>';
      }
      
      // 调试信息 
      
      // 添加HTML内容
      try {
        container.innerHTML = html; 
        
        // 检查内容是否成功添加
        if (container.children.length === 0 && html.length > 0) {
          console.warn('HTML内容未正确渲染，尝试替代方法');
          // 创建包装元素
          const wrapper = document.createElement('div');
          wrapper.className = 'content-wrapper';
          wrapper.innerHTML = html;
          container.appendChild(wrapper); 
        }
      } catch (error) {
        console.error('设置容器内容时出错:', error);
        // 创建错误提示元素
        const errorElement = document.createElement('div');
        errorElement.className = 'error-content';
        errorElement.innerHTML = '<h2>内容渲染失败</h2><p>无法正确处理文档内容，请尝试简化文档后重试。</p>';
        container.appendChild(errorElement);
      }
      
      // 添加样式
      container.appendChild(style);
      
      // 确保所有图片都有alt属性，避免渲染问题
      container.querySelectorAll('img').forEach(img => {
        if (!img.alt) img.alt = 'image';
        // 添加加载错误处理
        img.onerror = () => {
          img.style.display = 'none';
          console.warn('图片加载失败:', img.src);
        };
      });
      
      // 将容器添加到文档中但保持隐藏
      document.body.appendChild(container);
      
      // 等待所有资源加载完成
      await Promise.all([
        // 等待图片加载
        ...Array.from(container.querySelectorAll('img')).map(img => 
          img.complete ? Promise.resolve() : new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
            // 设置超时，避免无限等待
            setTimeout(resolve, 3000);
          })
        ),
        // 等待字体加载
        document.fonts.ready
      ]);
      
      // 自动标记不可分割元素并获取估计页数
      // @ts-ignore
      const estimatedPages = await autoMarkUnbreakableElements(container);
       
      
      return container;
    } catch (error) {
      console.error('创建打印容器失败:', error);
      // 出错时提供一个基本容器，避免完全失败
      const fallbackContainer = document.createElement('div');
      Object.assign(fallbackContainer.style, PRINT_CONTAINER_STYLE);
      fallbackContainer.innerHTML = '<p>内容处理出错，请重试</p>';
      document.body.appendChild(fallbackContainer);
      return fallbackContainer;
    }
  };

  export default createPrintContainer