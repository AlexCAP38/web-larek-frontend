import { Component } from "./base/Component";
import { IItem } from "../types";
import { ensureElement, formmater } from "../utils/utils";
import { LotItem } from "./AppData";

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
    protected _indexItem: HTMLElement | null;


    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);        //найти в шаблоне Название
        this._image = container.querySelector(`.${blockName}__image`);       //найти в шаблоне Картинку
        this._button = container.querySelector(`.${blockName}__button`);        //Найти кнопку
        this._description = container.querySelector(`.${blockName}__description`);      //Описание
        this._category = container.querySelector(`.${blockName}__category`);      //Категорию
        this._price = container.querySelector(`.${blockName}__price`);      //Цена
        this._indexItem = this.container.querySelector('.basket__item-index');


        //ЭТо клик по карточке, Если событие передали как аргумент занчит выполнить 
        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set index(value: number) {

        if (this._indexItem) {
            this._indexItem.textContent = value.toString();
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
        if (typeof (item.price) != 'number') {
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
        const modValue = `${formmater.format(value)} синапсов`
        this.setText(this._price, modValue);
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