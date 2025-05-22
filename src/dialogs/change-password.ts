import type { DialogManager } from "../dialog-manager";
import type { Dialog } from "../interfaces";

import { strToBytes } from "../utils";
import rawHtml from "./change-password.html?raw"

export default class ChangePasswordDialog implements Dialog {
    title = "Change Password";
    content = rawHtml

    onShow(manager: DialogManager) {
        const form = manager.body.querySelector('#change-password') as HTMLFormElement
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            if (data.new_password1 !== data.new_password2) {
                return alert('New passwords does not match')
            }
            if (data.new_password1 === data.current_password) {
                return alert('No change')
            }

            appStorage.changePassword(data.current_password.toString(), data.new_password1.toString())
                .then(() => {
                    alert('Password changed')
                    location.reload()
                }).catch(e => {
                    alert(`Failed: ${e.message || e}`)
                })

        });
    }
}
