import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  escapeHtml,
  htmlToMarkdown,
  markdownToHtml,
} from "../../lib/markdownHtml";
import LinkDialog from "./LinkDialog";

const TOOLBAR_GROUPS = [
  [
    {
      label: "Bold (Ctrl+B)",
      icon: Bold,
      command: () => document.execCommand("bold"),
    },
    {
      label: "Italic (Ctrl+I)",
      icon: Italic,
      command: () => document.execCommand("italic"),
    },
    {
      label: "Underline (Ctrl+U)",
      icon: Underline,
      command: () => document.execCommand("underline"),
    },
  ],
  [
    {
      label: "Heading",
      icon: Heading2,
      command: (editor) => {
        const block = getActiveBlock(editor);
        const isHeading = block && /^H[1-6]$/.test(block.tagName);

        document.execCommand("formatBlock", false, isHeading ? "p" : "h2");
      },
    },
  ],
  [
    {
      label: "Bullet list",
      icon: List,
      command: () => document.execCommand("insertUnorderedList"),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      command: () => document.execCommand("insertOrderedList"),
    },
  ],
  [
    {
      label: "Insert link",
      icon: Link2,
      action: "link",
    },
  ],
];

const BLOCK_TAGS = /^(H[1-6]|P|DIV|LI|BLOCKQUOTE)$/;

const getActiveBlock = (editor) => {
  const selection = window.getSelection();

  if (!editor || !selection || !selection.rangeCount) return null;

  let node = selection.anchorNode;

  while (node && node !== editor) {
    if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.test(node.tagName)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

const placeCaretAtEnd = (element) => {
  const range = document.createRange();
  const selection = window.getSelection();

  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "",
  autoFocus = false,
  spellCheck = true,
  className = "",
  editorClassName = "",
  ariaLabel = "Entry content",
}) {
  const editorRef = useRef(null);
  const initializedRef = useRef(false);
  const lastEmittedRef = useRef(value || "");
  const latestRef = useRef({ value, onChange });
  const savedRangeRef = useRef(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkHasSelection, setLinkHasSelection] = useState(false);

  useEffect(() => {
    latestRef.current = { value, onChange };
  }, [onChange, value]);

  useLayoutEffect(() => {
    const editor = editorRef.current;

    if (!editor) return;

    const incoming = value || "";

    if (!initializedRef.current) {
      editor.innerHTML = markdownToHtml(incoming);
      lastEmittedRef.current = incoming;
      initializedRef.current = true;
      return;
    }

    if (incoming === lastEmittedRef.current) return;

    const current = htmlToMarkdown(editor);

    if (current === incoming) {
      lastEmittedRef.current = incoming;
      return;
    }

    editor.innerHTML = markdownToHtml(incoming);
    lastEmittedRef.current = incoming;
  }, [value]);

  useEffect(() => {
    if (!autoFocus) return;

    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();
    placeCaretAtEnd(editor);
  }, [autoFocus]);

  const emitChange = () => {
    const editor = editorRef.current;

    if (!editor) return;

    const markdown = htmlToMarkdown(editor);

    lastEmittedRef.current = markdown;
    latestRef.current.onChange?.(markdown);
  };

  const runCommand = (command) => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const shouldEmit = command(editor);

    if (shouldEmit === false) return;

    window.requestAnimationFrame(emitChange);
  };

  const openLinkDialog = () => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();

    if (selection && selection.rangeCount) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      setLinkHasSelection(!selection.isCollapsed);
    } else {
      savedRangeRef.current = null;
      setLinkHasSelection(false);
    }

    setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    savedRangeRef.current = null;
  };

  const applyLink = ({ href, text }) => {
    const editor = editorRef.current;

    if (!editor || !href) return;

    editor.focus();

    const selection = window.getSelection();

    if (selection && savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    if (linkHasSelection) {
      document.execCommand("createLink", false, href);
    } else {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${escapeHtml(href)}">${escapeHtml(text || href)}</a>`,
      );
    }

    setLinkDialogOpen(false);
    savedRangeRef.current = null;
    window.requestAnimationFrame(emitChange);
  };

  const toolbarGroups = TOOLBAR_GROUPS;

  const handlePaste = (event) => {
    event.preventDefault();

    const text = event.clipboardData.getData("text/plain");

    document.execCommand(
      "insertHTML",
      false,
      text
        .split(/\r?\n/)
        .map((line) => escapeHtml(line))
        .join("<br>"),
    );
    window.requestAnimationFrame(emitChange);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-hairline bg-paper/80 p-1 shadow-sm">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-0.5">
            {groupIndex > 0 && (
              <span className="mx-1 h-4 w-px bg-hairline" aria-hidden="true" />
            )}
            {group.map(({ label, icon: Icon, command, action }) => (
              <button
                key={label}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (action === "link") {
                    runCommand(() => {
                      openLinkDialog();
                      return false;
                    });
                    return;
                  }

                  runCommand(command);
                }}
                title={label}
                aria-label={label}
                className="grid h-8 w-8 place-items-center rounded-lg text-charcoal-muted transition-colors hover:bg-warm-beige hover:text-charcoal focus-visible:ring-2 focus-visible:ring-sage/40"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        ))}

        <div className="ml-auto flex items-center gap-0.5">
          <span className="mx-1 h-4 w-px bg-hairline" aria-hidden="true" />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(() => document.execCommand("undo"))}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="grid h-8 w-8 place-items-center rounded-lg text-charcoal-muted transition-colors hover:bg-warm-beige hover:text-charcoal focus-visible:ring-2 focus-visible:ring-sage/40"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(() => document.execCommand("redo"))}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="grid h-8 w-8 place-items-center rounded-lg text-charcoal-muted transition-colors hover:bg-warm-beige hover:text-charcoal focus-visible:ring-2 focus-visible:ring-sage/40"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline="true"
        data-placeholder={placeholder}
        spellCheck={spellCheck}
        onInput={emitChange}
        onPaste={handlePaste}
        className={`rich-editor w-full border-0 bg-transparent outline-none ${editorClassName}`}
      />

      <LinkDialog
        key={linkDialogOpen ? "link-open" : "link-closed"}
        open={linkDialogOpen}
        hasSelection={linkHasSelection}
        onClose={closeLinkDialog}
        onSubmit={applyLink}
      />
    </div>
  );
}
