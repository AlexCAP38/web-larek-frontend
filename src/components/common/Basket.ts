import { Component } from "../base/Component";
import { cloneTemplate, createElement, ensureElement } from "../../utils/utils";
// import {cloneTemplate, createElement, ensureElement, formatNumber} from "../../utils/utils";
import { EventEmitter } from "../base/events";

interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}

// на выходе получаем объект где содержится видимо корзина заказов
//Класс хранящий все корзину

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__total');
        this._button = this.container.querySelector('.basket__action');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');

                console.log('НАЖАЛИ НА конпку оформить')
            });
        }

        this.items = [];
    }

    set items(items: HTMLElement[]) {

        if (items.length) {
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
        }
        console.log(this._list)
    }

    set selected(items: string[]) {
        if (items.length) {
            this.setDisabled(this._button, false);
        } else {
            this.setDisabled(this._button, true);
        }
    }

    set total(total: number) {
        this.setText(this._total, total);
    }

}