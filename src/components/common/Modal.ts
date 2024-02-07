import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { IPage } from "../Page";


interface IModalData {
    content: HTMLElement | HTMLElement[];
}

export class Modal extends Component<IModalData> {      //Класс работающий с модальным окном.
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents, protected page?: IPage) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this._content.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement) {       //Добавить хтмл элемент в контейнер для отображения в модальном окне
        this._content.replaceChildren(value);
    }

    open() {
        this.page.locked = true;    //Блокируем прокрутку основного экрана
        this.container.classList.add('modal_active');
        this.events.emit('modal:open');
    }

    close() {
        if (this.page) {    //снятие блокировки с экрана
            this.page.locked = false;
        }
        this.container.classList.remove('modal_active');
        this.content = null;
        this.events.emit('modal:close');
    }

    render(data: IModalData): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}