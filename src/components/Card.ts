import { Component } from "./base/Component";
import { ILot, LotStatus } from "../types";
import { IItem } from "../types";
import { bem, createElement, ensureElement } from "../utils/utils";
import { LotItem } from "./AppData";
// import clsx from "clsx";
// import { defaultsDeep } from "lodash";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}


enum Category {
    'софт-скил' = '#83FA9D',
    'другое' = '#FAD883',
    'дополнительное' = '#B783FA',
    'кнопка' = '#83DDFA',
    'хард-скил' = '#FAA083',
}

// export interface ICard<T> {
//     title: string;
//     description?: string | string[];
//     image: string;
//     status: T;
// }



// "id": "854cef69-976d-4c2a-a18c-2aa45046c390",
// "description": "Если планируете решать задачи в тренажёре, берите два.",
// "image": "/5_Dots.svg",
// "title": "+1 час в сутках",
// "category": "софт-скил",
// "price": 750

/**
 * Класс создает готовый HTML элемент из указанного шаблона
 * Конкретный класс делает большую карточку для главной страницы 
 * 
 */

export class Card extends Component<IItem> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement | null;
    protected _button?: HTMLButtonElement;
    protected _description?: HTMLElement;
    protected _category?: HTMLElement;
    protected _price?: HTMLElement;
    protected _id?: HTMLElement;

    // принимает какойто блокнаме ???
    // принимает от родителя какойто container ????
    // действие необязательное

    //Определяем какой будем использовать шаблон 

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);        //найти в шаблоне Название
        this._image = container.querySelector(`.${blockName}__image`);       //найти в шаблоне Картинку
        // this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);       //найти в шаблоне Картинку
        this._button = container.querySelector(`.${blockName}__button`);        //Найти кнопку
        this._description = container.querySelector(`.${blockName}__description`);      //Описание
        this._category = container.querySelector(`.${blockName}__category`);      //Категорию
        this._price = container.querySelector(`.${blockName}__price`);      //Цена

        //ЭТо клик по карточке, Если событие передали как аргумент занчит выполнить 
        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {     //установить ID
        this.container.dataset.id = value;
    }

    get id(): string {      //получить ID
        return this.container.dataset.id || '';
    }

    set title(value: string) {      //установить название
        this.setText(this._title, value);
    }

    set checkPrice(item: LotItem) {          //Проверка если у карточки нет цены заблокировать кнопку вывести сообщение
        if (typeof(item.price) != 'number') {
            this.setText(this._price, 'Товар не имеет цены, обратитесь к администратору')
            this.setDisabled(this._button, true)
        }
    }

    set switchButton(value: LotItem) {      //Если товар довален в карзину изменить кнопку
        if (value.status === 'NOADD') {
            this.setText(this._button, 'В корзину')
        } else {
            this.setText(this._button, 'Удалить из корзины')
        }

    }

    set price(value: number) {      //установить название

        // console.log(value)
        this.setText(this._price, value);
    }

    set category(value: string) {      //установить название
        const color: string = Category[value as keyof typeof Category];
        this._category.style.background = color;
        this.setText(this._category, value);
    }

    get title(): string {      //получить название
        return this._title.textContent || '';
    }

    set image(value: string) {      //установить изображение
        this.setImage(this._image, value, this.title)
    }

    set description(value: string | string[]) {       //установить описание
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }
}

/** класс хранит в себе карточку для корзины
 *
 */


//----------------

// export type AuctionStatus = {
//     status: string,
//     time: string,
//     label: string,
//     nextBid: number,
//     history: number[]
// };

// export class AuctionItem extends Card<HTMLElement> {
//     protected _status: HTMLElement;

//     constructor(container: HTMLElement, actions?: ICardActions) {
//         super('lot', container, actions);
//         this._status = ensureElement<HTMLElement>(`.lot__status`, container);
//     }

//     set status(content: HTMLElement) {
//         this._status.replaceWith(content);
//     }
// }


//--------------------------

// interface IAuctionActions {
//     onSubmit: (price: number) => void;
// }

// export class Auction extends Component<AuctionStatus> {
//     protected _time: HTMLElement;
//     protected _label: HTMLElement;
//     protected _button: HTMLButtonElement;
//     protected _input: HTMLInputElement;
//     protected _history: HTMLElement;
//     protected _bids: HTMLElement
//     protected _form: HTMLFormElement;

//     constructor(container: HTMLElement, actions?: IAuctionActions) {
//         super(container);

//         this._time = ensureElement<HTMLElement>(`.lot__auction-timer`, container);
//         this._label = ensureElement<HTMLElement>(`.lot__auction-text`, container);
//         this._button = ensureElement<HTMLButtonElement>(`.button`, container);
//         this._input = ensureElement<HTMLInputElement>(`.form__input`, container);
//         this._bids = ensureElement<HTMLElement>(`.lot__history-bids`, container);
//         this._history = ensureElement<HTMLElement>('.lot__history', container);
//         this._form = ensureElement<HTMLFormElement>(`.lot__bid`, container);

//         this._form.addEventListener('submit', (event) => {
//             event.preventDefault();
//             actions?.onSubmit?.(parseInt(this._input.value));
//             return false;
//         });
//     }

//     set time(value: string) {
//         this.setText(this._time, value);
//     }
//     set label(value: string) {
//         this.setText(this._label, value);
//     }
//     set nextBid(value: number) {
//         this._input.value = String(value);
//     }
// set history(value: number[]) {
//     this._bids.replaceChildren(...value.map(item => createElement<HTMLUListElement>('li', {
//         className: 'lot__history-item',
//         textContent: formatNumber(item)
//     })));
// }

//     set status(value: LotStatus) {
//         if (value !== 'active') {
//             this.setHidden(this._history);
//             this.setHidden(this._form);
//         } else {
//             this.setVisible(this._history);
//             this.setVisible(this._form);
//         }
//     }

//     focus() {
//         this._input.focus();
//     }
// }


//----------------------------

// export interface BidStatus {
//     amount: number;
//     status: boolean;
// }

// export class BidItem extends Card<BidStatus> {
//     protected _amount: HTMLElement;
//     protected _status: HTMLElement;
//     protected _selector: HTMLInputElement;

//     constructor(container: HTMLElement, actions?: ICardActions) {
//         super('bid', container, actions);
//         this._amount = ensureElement<HTMLElement>(`.bid__amount`, container);
//         this._status = ensureElement<HTMLElement>(`.bid__status`, container);
//         this._selector = container.querySelector(`.bid__selector-input`);

//         if (!this._button && this._selector) {
//             this._selector.addEventListener('change', (event: MouseEvent) => {
//                 actions?.onClick?.(event);
//             })
//         }
//     }

// set status({ amount, status }: BidStatus) {
//     this.setText(this._amount, formatNumber(amount));

//     if (status) this.setVisible(this._status);
//     else this.setHidden(this._status);
// }
// }