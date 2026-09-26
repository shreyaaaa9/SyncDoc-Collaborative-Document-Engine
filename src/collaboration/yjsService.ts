import * as Y from 'yjs';

export interface YjsUpdateEvent {
  documentId: string;
  updateBase64: string;
  content: string;
  isRemote: boolean;
}

export class YjsService {
  private currentDoc: Y.Doc | null = null;
  private currentDocId: string | null = null;
  private updateListeners: Set<(event: YjsUpdateEvent) => void> = new Set();
  private isApplyingRemoteUpdate = false;

  /**
   * Initialize a Y.Doc for a document room
   */
  public initializeDocument(documentId: string, initialHtmlContent?: string): Y.Doc {
    if (this.currentDocId === documentId && this.currentDoc) {
      return this.currentDoc;
    }

    // Clean up previous doc if any
    this.destroy();

    this.currentDocId = documentId;
    this.currentDoc = new Y.Doc();

    const ytext = this.currentDoc.getText('html_content');

    // Populate initial content if provided and text is empty
    if (initialHtmlContent && ytext.length === 0) {
      this.currentDoc.transact(() => {
        ytext.insert(0, initialHtmlContent);
      }, 'initial');
    }

    // Listen to local changes on Y.Doc
    this.currentDoc.on('update', (_update: Uint8Array, origin: any) => {
      // 14. Local vs Remote: If the origin is 'remote', do not broadcast back
      if (origin === 'remote' || origin === 'initial') {
        return;
      }

      // Encode state as update so peers always have full synchronization
      const fullUpdate = Y.encodeStateAsUpdate(this.currentDoc!);
      const updateBase64 = this.toBase64(fullUpdate);
      const content = ytext.toString();

      this.notifyListeners({
        documentId,
        updateBase64,
        content,
        isRemote: false,
      });
    });

    return this.currentDoc;
  }

  /**
   * Apply a local change from the editor into the Y.Doc
   */
  public setLocalContent(newHtml: string): void {
    if (!this.currentDoc || this.isApplyingRemoteUpdate) {
      return;
    }

    const ytext = this.currentDoc.getText('html_content');
    const current = ytext.toString();

    if (current === newHtml) {
      return;
    }

    this.currentDoc.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, newHtml);
    }, 'local');
  }

  /**
   * Apply a remote update from WebSocket / peer
   */
  public applyRemoteUpdate(updateBase64?: string, fallbackContent?: string): string {
    if (!this.currentDoc) {
      return fallbackContent || '';
    }

    this.isApplyingRemoteUpdate = true;
    try {
      if (updateBase64) {
        const updateArray = this.fromBase64(updateBase64);
        Y.applyUpdate(this.currentDoc, updateArray, 'remote');
      }

      // Ensure content synchrony if fallback content is provided
      if (fallbackContent !== undefined) {
        const ytext = this.currentDoc.getText('html_content');
        if (ytext.toString() !== fallbackContent) {
          this.currentDoc.transact(() => {
            ytext.delete(0, ytext.length);
            ytext.insert(0, fallbackContent);
          }, 'remote');
        }
      }

      const updatedContent = this.currentDoc.getText('html_content').toString();

      this.notifyListeners({
        documentId: this.currentDocId || '',
        updateBase64: updateBase64 || '',
        content: updatedContent,
        isRemote: true,
      });

      return updatedContent;
    } catch (err) {
      console.error('[YjsService] Failed to apply remote update:', err);
      if (fallbackContent !== undefined && this.currentDoc) {
        const ytext = this.currentDoc.getText('html_content');
        this.currentDoc.transact(() => {
          ytext.delete(0, ytext.length);
          ytext.insert(0, fallbackContent);
        }, 'remote');
        return fallbackContent;
      }
      return '';
    } finally {
      this.isApplyingRemoteUpdate = false;
    }
  }

  /**
   * Get current content
   */
  public getContent(): string {
    if (!this.currentDoc) return '';
    return this.currentDoc.getText('html_content').toString();
  }

  /**
   * Get full state vector as base64
   */
  public getStateUpdate(): string {
    if (!this.currentDoc) return '';
    const update = Y.encodeStateAsUpdate(this.currentDoc);
    return this.toBase64(update);
  }

  /**
   * Get current Y.Doc instance
   */
  public getDoc(): Y.Doc | null {
    return this.currentDoc;
  }

  /**
   * Subscribe to document content & update events
   */
  public onUpdate(listener: (event: YjsUpdateEvent) => void): () => void {
    this.updateListeners.add(listener);
    return () => {
      this.updateListeners.delete(listener);
    };
  }

  private notifyListeners(event: YjsUpdateEvent): void {
    this.updateListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[YjsService] Error in update listener:', err);
      }
    });
  }

  public destroy(): void {
    if (this.currentDoc) {
      this.currentDoc.destroy();
      this.currentDoc = null;
    }
    this.currentDocId = null;
    this.updateListeners.clear();
  }

  // Cross-environment Base64 serialization
  public toBase64(bytes: Uint8Array): string {
    const globalBuffer = (globalThis as unknown as { Buffer?: { from: (b: Uint8Array) => { toString: (enc: string) => string } } }).Buffer;
    if (globalBuffer) {
      return globalBuffer.from(bytes).toString('base64');
    }
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public fromBase64(base64: string): Uint8Array {
    const globalBuffer = (globalThis as unknown as { Buffer?: { from: (s: string, enc: string) => Uint8Array } }).Buffer;
    if (globalBuffer) {
      return new Uint8Array(globalBuffer.from(base64, 'base64'));
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

export const yjsService = new YjsService();
