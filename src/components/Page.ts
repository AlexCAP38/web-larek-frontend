import { Component } from "./base/Component";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

export interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

/**
 * Класс для работы с основным окном, управляет
 * 
 */

export class Page extends Component<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._counter = ensureElement<HTMLElement>('.header__basket-counter');      //счетчик на корзине
        this._catalog = ensureElement<HTMLElement>('.gallery');      //место для добавление карточек 
        this._wrapper = ensureElement<HTMLElement>('.page__wrapper');       //основная страница
        this._basket = ensureElement<HTMLElement>('.header__basket');       //кнопка корзины

        this._basket.addEventListener('click', () => {      //Устанавливаем слушатель на клик кнопки корзины
            this.events.emit('basket:open');            //вызываем событие
        });
    }

    set counter(value: number) {        //Установить значения счетчика в орзине
        this.setText(this._counter, String(value));
    }

    //Добавить карточки на старницу
    set catalog(items: HTMLElement[]) {     //принимает массив карточек (html элементов)
        this._catalog.replaceChildren(...items);        //добавляем их в Catalog
    }

    set locked(value: boolean) {        // Блокировка прокрутки Скролла
        if (value) {
            this._wrapper.classList.add('page__wrapper_locked');
        } else {
            this._wrapper.classList.remove('page__wrapper_locked');
        }
    }
}