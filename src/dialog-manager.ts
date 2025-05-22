
import type { Dialog, DialogConstructor } from "./interfaces";


const modules = import.meta.glob('./dialogs/*.ts', { eager: true });

const DIALOGS: Record<string, { class: DialogConstructor, instance?: Dialog }> = Object.create(null);

for (const path in modules) {
    const match = path.match(/\/([^\/]+)\.ts$/); // extract filename
    if (!match) continue;
    const filename = match[1]; // 'hello' or 'world'

    const mod = modules[path]['default']; // dynamic import
    DIALOGS[filename] = { class: mod }
}

// dialog.ts
export class DialogManager {
    private overlay: HTMLElement;
    private title: HTMLElement;
    body: HTMLElement;
    private closeBtn: HTMLButtonElement;

    constructor(
        overlayId = 'custom-dialog',
        titleId = 'dialog-title',
        bodyId = 'dialog-body',
        closeBtnId = 'dialog-close'
    ) {
        this.overlay = document.getElementById(overlayId)!;
        this.title = document.getElementById(titleId)!;
        this.body = document.getElementById(bodyId)!;
        this.closeBtn = document.getElementById(closeBtnId)! as HTMLButtonElement;
        this.closeBtn.addEventListener('click', () => this.hide());
        // Close dialog when clicking outside the box (on the overlay)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        })
    }

    dataEvents() {
        document.querySelectorAll('[data-dialog]').forEach((el: HTMLElement) => {
            if (el.classList.contains('dialog-activator'))
                return
            el.addEventListener('click', e => {
                this.show(el.dataset.dialog)
            })
            el.classList.add('dialog-activator')
        })
    }

    show(dialogOrName: Dialog | string, param?: any) {
        let dialog: Dialog
        if (typeof dialogOrName == 'string') {
            if (!(dialogOrName in DIALOGS)) {
                console.error(`Dialog not found: ${dialogOrName}`)
                return
            }

            if (!DIALOGS[dialogOrName].instance) {
                DIALOGS[dialogOrName].instance = new DIALOGS[dialogOrName].class()
            }
            dialog = DIALOGS[dialogOrName].instance
        } else {
            dialog = dialogOrName
        }

        this.title.textContent = dialog.title;

        this.body.innerHTML = '';
        if (typeof dialog.content === 'string') {
            this.body.innerHTML = dialog.content;
        } else {
            this.body.appendChild(dialog.content);
        }
        this.overlay.style.display = 'flex';
        dialog.onShow(this, param)
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}
