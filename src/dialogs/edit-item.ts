import type { DialogManager } from "../dialog-manager";
import { OtpAlgoritm, OtpData, type Dialog } from "../interfaces";
import rawHtml from "./add-item.html?raw"

export default class AddItemDialog implements Dialog {
    title = "Edit Item";
    content = rawHtml.replace(
        '<button type="submit">Submit</button>',
        '<button type="submit">Submit</button><button id="delete-item" type="button" style="background-color: red; float: right" class="btn">DELETE</button>')

    form: HTMLFormElement

    onShow(manager: DialogManager, param: { id: string }) {
        const item = appStorage.cached.filter(v => !!v).find(v => v.id == param.id)
        console.log('EDIT', param, item)

        if (!item) return

        this.form = manager.body.querySelector('#add-item')
        this.form.querySelector('#delete-item').addEventListener('click', (e) => {

            if (!confirm('Delete this item?'))
                return

            appStorage.removeItem(param.id).then(() => location.reload()).catch(e => alert(e.message || e))

        })
        this.form.addEventListener('submit', (e) => {

            e.preventDefault();

            const data = Object.fromEntries(new FormData(this.form).entries())

            appStorage.updateItem(param.id, data, data['password'].toString())
                .then(() => location.reload())
                .catch(e => alert(e.message || e))
        })
        this.applyFormValues(item)
    }
    applyFormValues(values: Record<string, any>) {
        for (const [key, value] of Object.entries(values)) {
            const input = this.form.elements.namedItem(key);
            if (!input || value === undefined || value === null) continue;

            if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
                input.value = String(value);
            }
        }
    }
}
