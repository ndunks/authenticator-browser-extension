import type { DialogManager } from "../dialog-manager";
import { OtpAlgoritm, OtpData, type Dialog } from "../interfaces";
import { showItems } from "../main";
import rawHtml from "./add-item.html?raw"

export default class AddItemDialog implements Dialog {
    title = "Add Item";
    content = rawHtml

    onShow(manager: DialogManager) {
        const form = manager.body.querySelector('#add-item') as HTMLFormElement
        form.addEventListener('submit', (e) => {

            e.preventDefault();

            const data = Object.fromEntries(new FormData(form).entries())

            appStorage.createItem(data, data['password'].toString())
                .then(() => location.reload())
                .catch(e => alert(e.message || e))
        })
    }
}
