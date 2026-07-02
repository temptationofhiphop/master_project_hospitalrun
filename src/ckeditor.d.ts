declare module '@ckeditor/ckeditor5-build-classic' {
  export interface ClassicEditorInstance {
    getData(): string
  }

  interface ClassicEditorConstructor {
    create(...args: unknown[]): Promise<ClassicEditorInstance>
  }

  const ClassicEditor: ClassicEditorConstructor
  export default ClassicEditor
}

declare module '@ckeditor/ckeditor5-react' {
  import ClassicEditor, { ClassicEditorInstance } from '@ckeditor/ckeditor5-build-classic'
  import * as React from 'react'

  interface CKEditorProps {
    editor: typeof ClassicEditor
    data?: string
    disabled?: boolean
    onChange?: (event: unknown, editor: ClassicEditorInstance) => void
  }

  export const CKEditor: React.ComponentType<CKEditorProps>
}
