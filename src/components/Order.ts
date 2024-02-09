import { Form } from "./common/Form";
import { IOrderForm } from "../types";
import { IEvents } from "./base/events";

export class Order extends Form<IOrderForm> {

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

}

export class OrderPay extends Order {
    protected _container: HTMLElement;
    protected _buttons: HTMLButtonElement[];

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events)

        this._container = container.querySelector('.order__buttons');
        if (this._container) {
            this._buttons = Array.from(this._container.querySelectorAll('button'));
        }

        this._buttons.forEach((item: HTMLButtonElement) => {
            item.addEventListener('click', (e: Event) => {
                const button: HTMLButtonElement = e.target as HTMLButtonElement
                events.emit('pay:change',{
                    currentButton: button,
                    allButton: this._buttons
                })
            })
        });
    }
}