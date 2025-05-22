import type { DialogManager } from "../dialog-manager";
import type { Dialog } from "../interfaces";
import { showItems } from "../main";
import rawHtml from "./password.html?raw"

export default class PasswordDialog implements Dialog {
    title = "Input Password";
    content = rawHtml

    onShow(manager: DialogManager) {
        const form = manager.body.querySelector('#password') as HTMLFormElement
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showItems(form.querySelector<HTMLInputElement>('[name=password]').value)
                .then(() => manager.hide())
        });
    }
}
