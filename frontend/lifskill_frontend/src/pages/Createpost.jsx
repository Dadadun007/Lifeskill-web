// import { useState, useRef, useEffect } from "react"
// import {X,Bold,Italic,Underline,Type,Paperclip,List,ListOrdered,Link,Undo,Table,MoreHorizontal,Upload,ChevronDown,} from "lucide-react"

// function Createpost({ isOpen, onClose }) {
//   const [title, setTitle] = useState("")
//   const [content, setContent] = useState("")
//   const [selectedCategories, setSelectedCategories] = useState(["Foods", "Pets", "Pets"])
//   const [isAgeDropdownOpen, setIsAgeDropdownOpen] = useState(false)
//   const [selectedAge, setSelectedAge] = useState("6-10")

//   const ageDropdownRef = useRef(null)

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (ageDropdownRef.current && !ageDropdownRef.current.contains(event.target)) {
//         setIsAgeDropdownOpen(false)
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside)
//     return () => document.removeEventListener("mousedown", handleClickOutside)
//   }, [])

//   const handlePost = () => {
//     console.log("Creating post:", { title, content, categories: selectedCategories })
//     onClose()
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold">Create Post</h2>
//           <button onClick={onClose} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Title Input */}
//           <div>
//             <input
//               type="text"
//               placeholder="Title *"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
//             />
//           </div>

//           {/* Rich Text Editor */}
//           <div className="border border-gray-300 rounded-lg overflow-hidden">
//             {/* Toolbar */}
//             <div className="bg-gray-800 text-white p-2 flex items-center gap-1 text-sm">
//               {[Bold, Italic, Underline, Type, Paperclip, List, ListOrdered, Link, Undo, Table, MoreHorizontal].map(
//                 (Icon, index) => (
//                   <button key={index} className="h-8 w-8 flex items-center justify-center text-white hover:bg-gray-700 rounded">
//                     <Icon className="h-4 w-4" />
//                   </button>
//                 )
//               )}
//               <div className="ml-auto text-xs">Switch to Markdown Editor</div>
//             </div>

//             {/* Editor Content */}
//             <div className="bg-gray-900 text-white p-4 min-h-[120px]">
//               <textarea
//                 placeholder="Body"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 className="w-full h-full bg-transparent border-none outline-none resize-none text-white placeholder-gray-400 min-h-[100px]"
//                 rows={6}
//               />
//             </div>
//           </div>

//           {/* Categories */}
//           <div>
//             <div className="bg-gray-400 rounded-full px-4 py-2 mb-4">
//               <span className="text-white font-medium">Categories : </span>
//               <div className="inline-flex gap-2 ml-2">
//                 {selectedCategories.map((category, index) => (
//                   <span key={index} className="bg-teal-500 text-white px-2 py-1 rounded text-sm">
//                     {category}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Bottom Actions */}
//           <div className="flex items-center justify-between flex-wrap gap-4">
//             <div className="flex items-center gap-4">
//               <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
//                 <Upload className="h-4 w-4" />
//                 Import files
//                 <span className="ml-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">5+</span>
//               </button>

//               <div className="relative" ref={ageDropdownRef}>
//                 <button
//                   onClick={() => setIsAgeDropdownOpen(!isAgeDropdownOpen)}
//                   className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 min-w-[160px] justify-between"
//                 >
//                   <span>Age Recommend {selectedAge}</span>
//                   <ChevronDown className="w-4 h-4" />
//                 </button>
//                 {isAgeDropdownOpen && (
//                   <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 py-1 z-40">
//                     {["0-5", "6-10", "11-15", "16+"].map((age) => (
//                       <button
//                         key={age}
//                         onClick={() => {
//                           setSelectedAge(age)
//                           setIsAgeDropdownOpen(false)
//                         }}
//                         className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                       >
//                         {age} years
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <p className="text-sm text-gray-600">*ต้องการพิมพ์ข้อมูลครบถ้วนอย่างน้อย 1 files</p>
//               <span className="bg-orange-400 text-white px-3 py-1 rounded text-sm">📚 Tutorial</span>
//               <button
//                 onClick={handlePost}
//                 className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
//               >
//                 Post
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
// export default Createpost;