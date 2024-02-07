import { Component } from "../base/Component";
import { cloneTemplate, createElement, ensureElement } from "../../utils/utils";
// import {cloneTemplate, createElement, ensureElement, formatNumber} from "../../utils/utils";
import { EventEmitter } from "../base/events";

interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}

export class Basket extends Component<IBasketView> {        //Класс хранящий всю корзину
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {     //НАЖАЛИ НА конпку оформить заказ, вызвать событие
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }
        this.items = [];
    }

    set items(items: HTMLElement[]) {       //Добавить HTML разметку в LIST
        if (items.length) {
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
        }
    }

    set selected(items: string[] | object[]) {
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