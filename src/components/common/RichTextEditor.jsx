import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

import { Bold, List, ListOrdered, Pilcrow, CornerDownLeft } from "lucide-react";

const MAX_CHARACTERS = 1500;

const buttonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

const editorClass =
  "min-h-40 px-4 py-3 outline-none leading-7 [&_p]:my-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-7 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-7 [&_li]:my-1 [&_li>p]:my-0 [&_strong]:font-bold";

/*
 * Count only actual visible text.
 *
 * Paragraphs, lists, bold tags, etc.
 * do not add extra characters.
 */
const getPlainTextLength = (doc) => {
  if (!doc) {
    return 0;
  }

  return doc.textBetween(0, doc.content.size, "").length;
};

/*
 * Visible text character limit.
 *
 * Allows:
 * - typing up to 1500 characters
 * - deleting
 * - bold formatting
 * - UL / OL formatting
 *
 * Blocks:
 * - typing/pasting beyond 1500 visible characters
 */
const CharacterLimit = Extension.create({
  name: "customCharacterLimit",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction(transaction, state) {
          if (!transaction.docChanged) {
            return true;
          }

          const previousLength = getPlainTextLength(state.doc);

          const nextLength = getPlainTextLength(transaction.doc);

          /*
           * Normal content within the limit.
           */
          if (nextLength <= MAX_CHARACTERS) {
            return true;
          }

          /*
           * Allow formatting changes.
           *
           * Example:
           * text -> bold
           * paragraph -> list
           *
           * Visible text length stays the same.
           */
          if (nextLength === previousLength) {
            return true;
          }

          /*
           * If old content is already above
           * the limit, allow reducing it.
           */
          if (nextLength < previousLength) {
            return true;
          }

          /*
           * Block new characters beyond limit.
           */
          return false;
        },
      }),
    ];
  },
});

export default function RichTextEditor({
  name,
  value = "",
  onChange,
  disabled = false,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        italic: false,
        strike: false,
      }),

      CharacterLimit,
    ],

    content: value || "",

    editable: !disabled,

    /*
     * Ensures toolbar active state and character
     * counter rerender as editor transactions occur.
     */
    shouldRerenderOnTransaction: true,

    editorProps: {
      attributes: {
        class: editorClass,
      },
    },

    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();

      onChange({
        target: {
          name,
          value: html,
        },
      });
    },
  });

  /*
   * Synchronize external value.
   *
   * Important for EditBrandPage because
   * existing description comes from the API.
   *
   * We only call setContent when the value
   * is actually different.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = editor.isEmpty ? "" : editor.getHTML();

    const nextValue = value || "";

    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  /*
   * Synchronize loading / disabled state.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return null;
  }

  /*
   * Character count is derived directly
   * from the current Tiptap document.
   *
   * No separate React state is needed.
   */
  const characterCount = getPlainTextLength(editor.state.doc);

  const isLimitReached = characterCount >= MAX_CHARACTERS;

  /*
   * Prevent toolbar button mouse-down from
   * stealing the editor selection.
   */
  const preventToolbarFocusLoss = (event) => {
    event.preventDefault();
  };

  /*
   * Paragraph button.
   *
   * If inside a list, lift the current item
   * out of the list.
   */
  const handleParagraph = () => {
    if (editor.isActive("listItem")) {
      editor.chain().focus().liftListItem("listItem").run();

      return;
    }

    editor.chain().focus().setParagraph().run();
  };

  /*
   * New paragraph / Exit list.
   *
   * Inside a list:
   * exits the current list item.
   *
   * Outside a list:
   * creates a new paragraph.
   */
  const handleNewParagraph = () => {
    if (editor.isActive("listItem")) {
      editor.chain().focus().liftListItem("listItem").run();

      return;
    }

    editor.chain().focus().splitBlock().run();
  };

  return (
    <div
      className={`overflow-hidden rounded-md border border-input bg-background ${
        disabled ? "opacity-70" : ""
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        {/* Paragraph */}
        <button
          type="button"
          title="Paragraph"
          aria-label="Paragraph"
          disabled={disabled}
          onMouseDown={preventToolbarFocusLoss}
          onClick={handleParagraph}
          className={`${buttonClass} ${
            editor.isActive("paragraph") &&
            !editor.isActive("bulletList") &&
            !editor.isActive("orderedList")
              ? "bg-muted"
              : ""
          }`}
        >
          <Pilcrow className="h-4 w-4" />
        </button>

        {/* Bold */}
        <button
          type="button"
          title="Bold"
          aria-label="Bold"
          disabled={disabled}
          onMouseDown={preventToolbarFocusLoss}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonClass} ${
            editor.isActive("bold") ? "bg-muted" : ""
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>

        {/* Bullet List */}
        <button
          type="button"
          title="Bullet List"
          aria-label="Bullet List"
          disabled={disabled}
          onMouseDown={preventToolbarFocusLoss}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${buttonClass} ${
            editor.isActive("bulletList") ? "bg-muted" : ""
          }`}
        >
          <List className="h-4 w-4" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          title="Numbered List"
          aria-label="Numbered List"
          disabled={disabled}
          onMouseDown={preventToolbarFocusLoss}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonClass} ${
            editor.isActive("orderedList") ? "bg-muted" : ""
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        {/* Exit List / New Paragraph */}
        <button
          type="button"
          title={editor.isActive("listItem") ? "Exit List" : "New Paragraph"}
          aria-label={
            editor.isActive("listItem") ? "Exit List" : "New Paragraph"
          }
          disabled={disabled}
          onMouseDown={preventToolbarFocusLoss}
          onClick={handleNewParagraph}
          className={buttonClass}
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Character Counter */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <p className="text-xs text-muted-foreground">
          Maximum {MAX_CHARACTERS} characters
        </p>

        <span
          className={`text-xs ${
            isLimitReached
              ? "font-semibold text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {characterCount} / {MAX_CHARACTERS}
        </span>
      </div>
    </div>
  );
}
