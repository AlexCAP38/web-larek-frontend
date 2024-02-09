import { Component } from "../base/Component";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";

interface IFormState {
    valid: boolean;
    errors: string[];
}

export class Form<T> extends Component<IFormState> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);
        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this._errors = ensureElement<HTMLElement>('.form__errors', this.container);
        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;        //Находим инпут
            const field = target.name as keyof T;       //имя инпута
            const value = target.value;     //его значение
            this.onInputChange(field, value);
        });

        this.container.addEventListener('submit', (e: Event) => {       //Событие после того как выбрали оплату и адрес доставки
            const form = e.target as HTMLFormElement;
            form.reset()
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onInputChange(field: keyof T, value: string) {        //сообщаем что инпут изменился
        this.events.emit(`${this.container.name}.${String(field)}:change`, {        //Вызываем событие, передаем данные
            field,
            value
        });
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    }

    set errors(value: string) {
        this.setText(this._errors, value);
    }

    render(state?: Partial<T> & IFormState) {
        const { valid, errors, ...inputs } = state;       //деструктурировали объект
        super.render({ valid, errors });
        Object.assign(this, inputs);
        return this.container;

    }
}