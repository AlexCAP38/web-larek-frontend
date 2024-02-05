import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { IPage } from "../Page";


interface IModalData {
    content: HTMLElement;
}

/**
 * Класс работающий с модальным окном.
 * @constructor
 * @param container - принимает 
 * @param event - # экземпляр событий
 * @param page - # экземпляр основного окна 
 * @method open() - открыть окно 
 * @method close() - закрыть окно, снять блокировку скрола с экрана
 * @method render() - 
 */


export class Modal extends Component<IModalData> {
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

    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    open() {
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