export interface IItem {        //Структура моей карточки
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export type PayButtons = {
    currentButton: HTMLButtonElement,
    allButton: HTMLButtonElement[]
}

export interface IOrderForm {
    email: string;
    phone: string;
    address: string;
    payment: string;
}

export interface IOrder extends IOrderForm {
    items: Array<object>
}


export interface IOOrder extends IOrderForm{
total:number;
items: string[]
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
    total: number
}