import {
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  RedoIcon,
  TypeIcon,
  UnderlineIcon,
  UndoIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Editor, Element as SlateElement, Transforms } from "slate";
import { useSlate } from "slate-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Separator } from "@/shared/ui/separator";
import { insertLink, insertThematicBreak, isLinkActive, unwrapLink } from "../plugins";
import type { CustomElement } from "../types";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

const ToolbarButton = ({ onClick, active, disabled, icon, tooltip }: ToolbarButtonProps) => {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="size-8 p-0"
      title={tooltip}
    >
      {icon}
    </Button>
  );
};

const UndoRedoButtons = () => {
  const editor = useSlate();

  return (
    <>
      <ToolbarButton
        onClick={() => editor.undo()}
        disabled={editor.history.undos.length === 0}
        icon={<UndoIcon className="size-4" />}
        tooltip="復原"
      />
      <ToolbarButton
        onClick={() => editor.redo()}
        disabled={editor.history.redos.length === 0}
        icon={<RedoIcon className="size-4" />}
        tooltip="重做"
      />
    </>
  );
};

const BlockTypeSelect = () => {
  const editor = useSlate();
  const [block] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
  });

  const blockType = block ? (block[0] as CustomElement).type : "paragraph";

  const handleBlockTypeChange = (type: SlateElement["type"]) => {
    Transforms.setNodes(editor, { type });
  };

  const getBlockTypeLabel = () => {
    if (blockType.startsWith("heading-")) {
      const level = blockType.split("-")[1];
      return `標題 ${level}`;
    }
    if (blockType === "block-quote") return "引用";
    return "段落";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <TypeIcon className="mr-1 size-4" />
          {getBlockTypeLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleBlockTypeChange("paragraph")}>段落</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBlockTypeChange("heading-1")}>
          標題 1
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBlockTypeChange("heading-2")}>
          標題 2
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBlockTypeChange("heading-3")}>
          標題 3
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleBlockTypeChange("block-quote")}>
          引用
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FormatButtons = () => {
  const editor = useSlate();

  const isMarkActive = (format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format as keyof typeof marks] === true : false;
  };

  const toggleMark = (format: string) => {
    const isActive = isMarkActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  return (
    <>
      <ToolbarButton
        onClick={() => toggleMark("bold")}
        active={isMarkActive("bold")}
        icon={<BoldIcon className="size-4" />}
        tooltip="粗體"
      />
      <ToolbarButton
        onClick={() => toggleMark("italic")}
        active={isMarkActive("italic")}
        icon={<ItalicIcon className="size-4" />}
        tooltip="斜體"
      />
      <ToolbarButton
        onClick={() => toggleMark("underline")}
        active={isMarkActive("underline")}
        icon={<UnderlineIcon className="size-4" />}
        tooltip="底線"
      />
    </>
  );
};

const LinkButton = () => {
  const editor = useSlate();
  const [showInput, setShowInput] = useState(false);
  const [url, setUrl] = useState("");

  const handleLinkClick = () => {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    } else {
      setShowInput(true);
    }
  };

  const handleUrlSubmit = () => {
    if (url) {
      insertLink(editor, url);
      setUrl("");
      setShowInput(false);
    }
  };

  if (showInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="輸入網址"
          className="rounded border px-2 py-1 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleUrlSubmit();
            } else if (e.key === "Escape") {
              setShowInput(false);
              setUrl("");
            }
          }}
        />
        <Button size="sm" onClick={handleUrlSubmit}>
          確定
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setShowInput(false);
            setUrl("");
          }}
        >
          取消
        </Button>
      </div>
    );
  }

  return (
    <ToolbarButton
      onClick={handleLinkClick}
      active={isLinkActive(editor)}
      icon={<LinkIcon className="size-4" />}
      tooltip="連結"
    />
  );
};

const ImageButton = ({ onImageInsert }: { onImageInsert?: () => void }) => {
  const handleImageClick = () => {
    onImageInsert?.();
  };

  return (
    <ToolbarButton
      onClick={handleImageClick}
      icon={<ImageIcon className="size-4" />}
      tooltip="插入圖片"
    />
  );
};

const ThematicBreakButton = () => {
  const editor = useSlate();

  return (
    <ToolbarButton
      onClick={() => insertThematicBreak(editor)}
      icon={<MinusIcon className="size-4" />}
      tooltip="分隔線"
    />
  );
};

const ListButtons = () => {
  const editor = useSlate();

  const isListActive = (type: "bulleted-list" | "numbered-list") => {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === type,
    });
    return !!match;
  };

  const toggleList = (type: "bulleted-list" | "numbered-list") => {
    const isActive = isListActive(type);

    if (isActive) {
      Transforms.unwrapNodes(editor, {
        match: (n) => SlateElement.isElement(n) && n.type === type,
        split: true,
      });
      Transforms.setNodes(editor, { type: "paragraph" });
    } else {
      Transforms.setNodes(editor, { type: "list-item" });
      Transforms.wrapNodes(editor, { type, children: [] });
    }
  };

  return (
    <>
      <ToolbarButton
        onClick={() => toggleList("bulleted-list")}
        active={isListActive("bulleted-list")}
        icon={<ListIcon className="size-4" />}
        tooltip="項目清單"
      />
      <ToolbarButton
        onClick={() => toggleList("numbered-list")}
        active={isListActive("numbered-list")}
        icon={<ListOrderedIcon className="size-4" />}
        tooltip="編號清單"
      />
    </>
  );
};

interface ToolbarProps {
  className?: string;
  hasHeadings?: boolean;
  onImageInsert?: () => void;
}

export const Toolbar = ({ className, hasHeadings = true, onImageInsert }: ToolbarProps) => {
  return (
    <div className={cn("flex items-center gap-1 border-b border-basic-200 p-2", className)}>
      <UndoRedoButtons />
      <Separator orientation="vertical" className="mx-1 h-6" />
      {hasHeadings && <BlockTypeSelect />}
      <FormatButtons />
      <LinkButton />
      <ImageButton onImageInsert={onImageInsert} />
      <ThematicBreakButton />
      <ListButtons />
    </div>
  );
};
