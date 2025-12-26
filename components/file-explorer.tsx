"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { FileCode, Folder, FolderOpen, ChevronRight, ChevronDown, File } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
  content?: string
  language?: string
}

interface FileExplorerProps {
  files: Array<{ name: string; content: string; language: string }>
  onFileSelect?: (file: { name: string; content: string; language: string }) => void
  selectedFile?: string
}

export default function FileExplorer({ files, onFileSelect, selectedFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const previousFilesKeyRef = useRef<string>("")

  // Build file tree structure using useMemo to avoid infinite loops
  const { fileTree, rootFolders } = useMemo(() => {
    const tree: FileNode[] = []
    const folderMap = new Map<string, FileNode>()
    const rootFoldersSet = new Set<string>()

    files.forEach((file) => {
      const parts = file.name.split("/")
      let currentPath = ""

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1
        const parentPath = currentPath
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (isLast) {
          // It's a file
          const parent = parentPath ? folderMap.get(parentPath) : null
          const fileNode: FileNode = {
            name: part,
            type: "file",
            path: file.name,
            content: file.content,
            language: file.language,
          }

          if (parent) {
            if (!parent.children) parent.children = []
            parent.children.push(fileNode)
          } else {
            tree.push(fileNode)
          }
        } else {
          // It's a folder
          if (!folderMap.has(currentPath)) {
            const folderNode: FileNode = {
              name: part,
              type: "folder",
              path: currentPath,
              children: [],
            }

            if (parentPath) {
              const parent = folderMap.get(parentPath)
              if (parent) {
                if (!parent.children) parent.children = []
                parent.children.push(folderNode)
              }
            } else {
              tree.push(folderNode)
              rootFoldersSet.add(currentPath)
            }

            folderMap.set(currentPath, folderNode)
          }
        }
      })
    })

    return { fileTree: tree, rootFolders: rootFoldersSet }
  }, [files])

  // Auto-expand root folders using useEffect to avoid infinite loops
  // Use a stable string representation of file names to avoid infinite loops
  const filesKey = useMemo(() => files.map(f => f.name).sort().join('|'), [files])
  
  useEffect(() => {
    // Only expand folders if files have actually changed
    if (filesKey !== previousFilesKeyRef.current && rootFolders.size > 0) {
      previousFilesKeyRef.current = filesKey
      setExpandedFolders((prev) => {
        const newSet = new Set(prev)
        let hasChanges = false
        rootFolders.forEach((path) => {
          if (!newSet.has(path)) {
            newSet.add(path)
            hasChanges = true
          }
        })
        // Only update if there are new folders to expand
        return hasChanges ? newSet : prev
      })
    }
  }, [filesKey]) // Only depend on filesKey to avoid infinite loops

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const getFileIcon = (node: FileNode) => {
    if (node.type === "folder") {
      return expandedFolders.has(node.path) ? (
        <FolderOpen className="w-4 h-4 text-blue-400" />
      ) : (
        <Folder className="w-4 h-4 text-blue-400" />
      )
    }

    const ext = node.name.split(".").pop()?.toLowerCase()
    const iconClass = "w-4 h-4 text-zinc-400"

    switch (ext) {
      case "tsx":
      case "jsx":
      case "ts":
      case "js":
        return <FileCode className={`${iconClass} text-blue-500`} />
      default:
        return <File className={iconClass} />
    }
  }

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedFile === node.path

    if (node.type === "folder") {
      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 rounded-md ${
              isSelected ? "bg-zinc-800" : ""
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-zinc-500" />
            )}
            {getFileIcon(node)}
            <span className="text-zinc-300 flex-1 truncate">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 rounded-md ${
          isSelected ? "bg-zinc-800 border-r-2 border-blue-500" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (node.content && onFileSelect) {
            onFileSelect({
              name: node.path,
              content: node.content,
              language: node.language || "typescript",
            })
          }
        }}
      >
        {getFileIcon(node)}
        <span className="text-zinc-300 flex-1 truncate">{node.name}</span>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        <div className="text-center">
          <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>لا توجد ملفات</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-2">
      <div className="mb-2 px-2">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">الملفات</h3>
      </div>
      <div className="space-y-0.5">
        {fileTree.map((node) => renderNode(node))}
      </div>
    </div>
  )
}

