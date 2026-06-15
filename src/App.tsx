import { useEffect, useState } from "react"; 
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Editor from "./components/Editor"; 
import TreeFile from "./components/TreeFile" 

import IconLeft from "./assets/IconParkOutlineExpandLeft.svg"
import IconRight from "./assets/IconParkOutlineExpandRight.svg"
import DownloadCloud from "./assets/MeteorIconsDownloadCloud.svg"
 
// 导入antd的组件
import { Dropdown } from 'antd';
import DownloadMenu from "./components/PopMenu/DownloadMenu"; 



function getStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error("获取 localStorage 失败:", error);
    return null;
  }
}

// @ts-ignore
function setStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error("设置 localStorage 失败:", error);
  }
}

function App() { 
  const [isShow, setIsShow] =  useState<boolean>(true);
  const [fileType, setFileType] =  useState<string>("md");
  // @ts-ignore
  const [fileName, setFileName] = useState<string>("");
  const [content, setContent] = useState<any>( );
  const [filePath, setFilePath] = useState<string>("");
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
 
    // 监听窗口大小变化
    useEffect(() => {
      const handleResize = () => {
        setScreenHeight(window.innerHeight);
      };
  
      window.addEventListener('resize', handleResize);
  
      // 清理事件监听
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
    
    // @ts-ignore
const hadleSide = (bool:boolean) => {
  const result:any = getStorage("filePath") 
  setFilePath(result);
  setIsShow(bool); 
}

const setFileContent=  async (data:any)=>{
  if(  data && filePath){   
    await invoke("write_file_content", { path: filePath, content: data });
  }
}

// @ts-ignore
const onReadFile = (data)=>{ 
 // @ts-ignore
 setFileName(data.fileName)
 setFileType(data.type)
 // @ts-ignore
 setFilePath(data.path||"" ); 
 setContent("")
  setTimeout(() => {
   setContent(data.content)
  },100)
}


const hdle = (bool:boolean)=>{ 
  setIsShow(bool) 
}



const onDeleteRefresh = ()=>setContent("")
const contentHeight = `${screenHeight - 30}px`;
  
  return (  
    <div className="Layout w-full border-t-2 flex overflow-hidden"  > 
 
      <div className="left-side w-8 bg-[#F4F4F580] pt-2" style={{ height: `${screenHeight-2}px`} }>  
         <div className="p-1" onClick={()=>hdle(!isShow)}>
           {
            isShow?  <img className="w-6 h-6 cursor-pointer" src={IconLeft} alt="My SVG" /> : <img className="w-6 h-6 cursor-pointer" src={IconRight} alt="My SVG" />
           } 
         </div>

        
         <div className="p-1">
              <Dropdown menu={{ items:DownloadMenu }} placement="bottomLeft" arrow>
                <img className="w-6 h-6 cursor-pointer" src={DownloadCloud} alt="My SVG" />
              </Dropdown>
           </div>

      </div>

      <div className="flex  flex-1 flex-col  overflow-hidden" style={{ height: `${screenHeight - 2.5}px`} }>  
          <div className="flex overflow-hidden" style={{ height: contentHeight} }>
            {
               isShow&& <div className="Sider w-2/6 max-w-64 pl-2 pr-2 pt-3 border-r border-gray-300 ">
               <TreeFile onDeleteRefresh={onDeleteRefresh} onReadFile={(data) => onReadFile(data)} />
             </div>
            } 
               <div   className="w-full h-full relative overflow-hidden overflow-y-auto  ">
               {
                    content && <Editor onChange={(data)=>setFileContent(data)} type={fileType} content={content} /> 
                  } 
               </div>
          </div> 

          <div className="footer w-[90vw] h-7  flex   "> </div>
      </div>

     
    </div>
  );


}

export default App;
